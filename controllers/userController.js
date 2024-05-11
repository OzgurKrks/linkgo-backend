import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { sendEmail } from "../helpers/sendEmail.js";

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: user.generateJwtFromUser(),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select("+password");

  const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  };

  if (user && comparePassword(password, user.password)) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: user.generateJwtFromUser(),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const resetEmail = req.body.email;

  const user = await User.findOne({ email: resetEmail }).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "There is no user with that email",
    });
  }
  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resePasswordUrl = `https://linkgo-front.vercel.app/${resetPasswordToken}`;

  const emailTemplate = `
  <h3>Reset Your Password</h3>
  <p> This is <a href ='${resePasswordUrl}' target='_blank'>Link</a> will expire 1 hour </p>
  `;
  try {
    await sendEmail({
      from: "ozgurkrks0697@gmail.com",
      to: "ozgurkrks0697@gmail.com",
      subject: "Reset Your Password",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Token Sent To Your Email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(404).json({
      success: false,
      message: "Failed",
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.body;
  const { password } = req.body;

  if (!resetPasswordToken) {
    return res.status(404).json({
      success: false,
      message: "Please provide a valid token",
    });
  }
  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "There is no user with that email",
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset password process succesful",
  });
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

export { registerUser, loginUser, forgotPassword, resetPassword, getMe };
