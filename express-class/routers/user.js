import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/users.model.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv"; // Re-added dotenv import
import upload from "../modules/upload.module.js";

dotenv.config(); // Re-added dotenv.config() call here
console.log(
  "User.js - JWT_SECRET_KEY (from .env):",
  process.env.JWT_SECRET_KEY
);

const router = Router();

router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { email, username, password } = req.body;
  const profileImageUrl = req.file ? req.file.location : undefined;
  const user = await User.create({
    username,
    email,
    password,
    profileImageUrl,
  });
  res.status(201).json(user);
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureMessage: true,
    session: false,
  }),
  (req, res) => {
    let token = null;
    if (req.user) {
      const _id = req.user._id;
      const payload = { _id };
      console.log(
        "User.js - Signing token with JWT_SECRET_KEY:",
        process.env.JWT_SECRET_KEY
      );
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });

      const userToSend = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profileImageUrl: req.user.profileImageUrl,
        isAdmin: req.user.isAdmin,
        registerType: req.user.registerType,
      };
      res.json({ message: "login success!", user: userToSend });
    } else {
      res.status(401).json({ message: "Authentication failed." });
    }
  }
);

router.post("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the JWT token cookie
  res.json({ message: "logout success!" });
});

const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dyahrini908@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});
transpoter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await transpoter.sendMail({
      from: "dyahrini908@gmail.com",
      to,
      subject,
      text,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/login/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    let token = null;
    if (req.user) {
      const _id = req.user._id;
      const payload = { _id };
      console.log(
        "User.js - Signing Google token with JWT_SECRET_KEY:",
        process.env.JWT_SECRET_KEY
      );
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    }
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    // Redirect to the frontend application's /posts page after successful Google login
    res.redirect("http://localhost:5173/posts"); // Changed from res.json to res.redirect
  }
);

export default router;
