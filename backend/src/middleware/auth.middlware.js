import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized - No access token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        score: true,
        streak: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized - Invalid or expired access token",
    });
  }
});

export const checkAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new ApiError(403, "Access denied - Admins only");
  }

  next();
});
