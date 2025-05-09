// external packages
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// user defined modules
import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const register = asyncHandler(async (req, res) => {
  const { email, password, cnfPassword, name } = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (!cnfPassword) throw new ApiError(400, "Please confirm your password");
  if (password !== cnfPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser)
    throw new ApiError(400, "Email already registered! Try logging in.");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.USER,
    },
  });

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 1000 * 60 * 60 * 24 * 7,
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

  res.status(response.statusCode).json(response);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(401, "User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 1000 * 60 * 60 * 24 * 7,
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

  res.status(response.statusCode).json(response);
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  const response = new ApiResponse(200, "User logged out successfully");
  res.status(response.statusCode).json(response);
});

const check = asyncHandler(async (req, res) => {
  const response = new ApiResponse(200, "User authenticated successfully", {
    user: req.user,
  });
  res.status(response.statusCode).json(response);
});

export { register, login, logout, check };
