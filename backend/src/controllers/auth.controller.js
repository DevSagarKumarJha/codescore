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
  await prisma.user.update({
    where: { id: newUser.id },
    data: { refreshToken },
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
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
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
    return res.status(200).json(new ApiResponse(200, "User logged out"));
  }

  try {
    // Decode token to get user ID
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Remove refresh token from DB
    await db.user.update({
      where: { id: decoded.id },
      data: { refreshToken: null },
    });
  } catch (error) {
    // Token might be invalid/expired — we silently continue to clear cookies
    console.error("Logout error:", error.message);
  }

  // Clear access and refresh tokens from cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  const response = new ApiResponse(200, "User logged out successfully");
  res.status(response.statusCode).json(response);
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = params;

  const user = await db.user.findFirst({
    where:{id: userId}
  })

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

export {
  register,
  verifyEmail,
  resendVerificationMail,
  forgotPassword,
  resetPassword,
  login,
  logout,
  getProfile,
  check,
};
