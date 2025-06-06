// external packages
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// user defined modules
import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setEmailVerificationToken,
} from "../utils/auth-utils.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";

const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, cnfPassword } = req.body;

  if (!name || !username || !email || !password || !cnfPassword) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (password !== cnfPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const existingUserWithEmail = await db.user.findUnique({ where: { email } });

  if (existingUserWithEmail)
    throw new ApiError(400, "Email already registered! Try logging in.");

  const existingUserWithUsername = await db.user.findUnique({
    where: { username },
  });

  if (existingUserWithUsername)
    throw new ApiError(400, "Username already registered! Try logging in.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
      role: UserRole.USER,
    },
  });

  const unHashedToken = await setEmailVerificationToken(newUser.id);

  const verificationUri = `http://localhost:8000/api/v1/verify/${unHashedToken}`;

  await sendEmail({
    email: email,
    subject: "Email verification link",
    mailgenContent: emailVerificationMailgenContent(username, verificationUri),
  });

  const accessToken = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  });

  const refreshToken = generateRefreshToken({ id: newUser.id });

  // Optionally store refresh token in DB
  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const response = new ApiResponse(201, "User created successfully", {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      image: newUser.image,
    },
  });

  res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .json(response);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    },
  });

  const response = new ApiResponse(200, "Email verified successfully");
  res.status(200).json(response);
});

const resendVerificationMail = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken)
    throw new ApiError(401, "Please Login before verifying email");

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await db.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const unHashedToken = await setEmailVerificationToken(user.id);

  const verificationUrl = `${process.env.DOMAIN}/api/v1/verify/${unHashedToken}`;

  await sendEmail({
    email: user.email,
    subject: "Resend: Email Verification",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      verificationUrl
    ),
  });

  const response = new ApiResponse(200, "Verification mail sent successfully");
  res.status(200).json(response);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: expires,
    },
  });

  const resetUrl = `${process.env.DOMAIN}/reset-password/${resetToken}`;

  await sendEmail({
    email,
    subject: "Password Reset Request",
    mailgenContent: forgotPasswordMailgenContent(user.username, resetUrl),
  });

  const response = new ApiResponse(200, "Password reset mail sent");
  res.status(200).json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, cnfPassword } = req.body;

  if (!password || !cnfPassword) {
    throw new ApiError(400, "Password and Confirm Password are required");
  }

  if (password !== cnfPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await db.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    },
  });

  const response = new ApiResponse(200, "Password reset successfully");
  res.status(200).json(response);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(401, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  const refreshToken = generateRefreshToken({ id: user.id });

  // Optionally store refresh token in DB
  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const response = new ApiResponse(200, "User logged in successfully", {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    },
  });

  res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .json(response);
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res
      .status(404)
      .json(new ApiResponse(404, "User logged out already"));
  }

  await db.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  const user = await db.user.findFirst({
    where: { username: userName },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      score: true,
    },
  });

  const response = new ApiResponse(200, "User profile fetched successfully", {
    user,
  });

  res.status(response.statusCode).json(response);
});

const check = asyncHandler(async (req, res) => {
  const response = new ApiResponse(200, "User authenticated successfully", {
    user: req.user,
  });
  res.status(response.statusCode).json(response);
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing. Please login again.");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token. Please login.");
  }

  const existingUser = await db.user.findUnique({
    where: { id: decoded.id },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found. Please register again.");
  }

  const storedToken = await db.refreshToken.findUnique({
    where: { token: incomingRefreshToken },
  });

  const isTokenInvalid =
    !storedToken ||
    storedToken.userId !== decoded.id ||
    storedToken.expiresAt < new Date();

  if (isTokenInvalid) {
    throw new ApiError(403, "Refresh token is invalid or expired.");
  }

  const newAccessToken = generateAccessToken({
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
  });

  const newRefreshToken = generateRefreshToken({ id: existingUser.id });

  await db.refreshToken.deleteMany({
    where: { token: incomingRefreshToken },
  });

  await db.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: existingUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const response = new ApiResponse(200, "Access token refreshed successfully");

  res
    .status(response.statusCode)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .json(response);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const skip = (page - 1) * limit;

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      isEmailVerified: true,
      image: true,
      score: true,
      createdAt: true,
    },
    skip: Number(skip),
    take: Number(limit),
    orderBy: {
      score: "desc",
    },
  });

  const totalUsers = await db.user.count({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ],
    },
  });

  const response = new ApiResponse(200, "Users fetched successfully", {
    users,
    pagination: {
      total: totalUsers,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalUsers / limit),
    },
  });

  res.status(200).json(response);
});

export {
  register,
  verifyEmail,
  resendVerificationMail,
  forgotPassword,
  resetPassword,
  login,
  logout,
  getUserProfile,
  check,
  refreshAccessToken,
  getAllUsers,
};
