import jwt from "jsonwebtoken";

import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error authenticating user: ", error);
    return res.status(500).json({ error: "Error authenticating user" });
  }
};

export const checkAdmin = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied - Admins only" });
    }

    next();
  } catch (error) {
    console.log("Error checking Admin: ", error);

    return res.status(500).json({ error: "Internal server error" });
  }
};
