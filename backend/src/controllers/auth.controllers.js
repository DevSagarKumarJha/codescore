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
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.log("Error creating user: ", error);
    res.status(500).json({
      error: "Error user registeration",
    });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "User login successfully",
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.log("Error login user: ", error);
    res.status(500).json({
      error: "Error user login",
    });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly:true,
      sameSite: "strict",
      secure : process.env.NODE_ENV !== "development",
    })

    res.status(200).json({
      message: "User logout successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error logout user: ", error);
    res.status(500).json({
      error: "Error user login",
    });
  }
};
const check = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: req.user
    })
  } catch (error) {
    console.log("Error check user: ", error);
    res.status(500).json({
      error: "Error user check",
    });
  }
};

export { register, login, logout, check };
