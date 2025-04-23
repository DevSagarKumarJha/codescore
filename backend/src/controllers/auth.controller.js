// external packages
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// user defined modules
import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";

const register = async (req, res) => {
  const { email, password, cnfPassword, name } = req.body;

  if (!email) {
    res.status(400).json({ errMsg: "Email is Required" });
  }

  if (!password) {
    res.status(400).json({ errMsg: "Passwword is Required" });
  }

  if (!cnfPassword) {
    res.status(400).json({ errMsg: "Please confirm your password" });
  }

  if (cnfPassword !== password) {
    res.status(400).json({
      errMsg: "Password mismatched! confirm password and password must be same",
    });
  }
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({ errMsg: "email already registered! try login" });
    }

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

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name:newUser.name,
        role:newUser.role,
        image:newUser.image
      }
    })
  } catch (error) {
    console.log("Error creating user: ", error)
    res.status(500).json({
      error: "Error user registeration",
    })
  }
};
const login = async (req, res) => {};
const logout = async (req, res) => {};
const getMe = async (req, res) => {};
const check = async (req, res) => {};

export { register, login, logout, check, getMe };
