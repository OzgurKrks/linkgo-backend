import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinaryConfig.js";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Links from "../models/linksModel.js";
import { sendEmail } from "../helpers/sendEmail.js";

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const emailExists = await User.findOne({ email });
  const usernameExists = await User.findOne({ username });

  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }
  if (usernameExists) {
    res.status(400);
    throw new Error("Username already exists");
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      username: user.username,
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
  const { username, email, password } = req.body;

  // Check for user email
  const query = email ? { email: email } : { username: username };
  const user = await User.findOne(query).select("+password");

  const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  };

  if (user && comparePassword(password, user.password)) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: user.generateJwtFromUser(),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

const editAccount = asyncHandler(async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate that req.user._id exists
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const user = await User.findById(req.user._id);
    // If user not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name !== undefined) {
      user.name = name;
    }
    if (email !== undefined) {
      user.email = email;
    }
    await user.save();

    // Respond with the updated user object
    res.status(200).json(user);
  } catch (error) {
    // Handle errors and respond with a 500 status code
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const editProfile = asyncHandler(async (req, res) => {
  try {
    const { name, image, profile_title, profile_bio } = req.body;

    const result = await cloudinary.uploader.upload(image, {
      use_filename: true,
      folder: "social",
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile_image: result.secure_url, profile_title, profile_bio },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error." });
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

  const resePasswordUrl = `http://localhost:3000/resetpassword/${resetPasswordToken}`;

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

const updateUserPage = asyncHandler(async (req, res) => {
  try {
    const { image_style, backgroundColor, buttonStyle } = req.body;

    // Validate that req.user._id exists
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const user = await User.findById(req.user._id);
    // If user not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided in the request body
    if (image_style !== undefined) {
      user.image_style = image_style;
    }
    if (backgroundColor !== undefined) {
      user.backgroundColor = backgroundColor;
    }
    if (buttonStyle !== undefined) {
      user.buttonStyle = {
        radius:
          buttonStyle.radius !== undefined
            ? buttonStyle.radius
            : user.buttonStyle.radius,
        color:
          buttonStyle.color !== undefined
            ? buttonStyle.color
            : user.buttonStyle.color,
        backgroundColor:
          buttonStyle.backgroundColor !== undefined
            ? buttonStyle.backgroundColor
            : user.buttonStyle.backgroundColor,
        shadow:
          buttonStyle.shadow !== undefined
            ? buttonStyle.shadow
            : user.buttonStyle.shadow,
        border:
          buttonStyle.border !== undefined
            ? buttonStyle.border
            : user.buttonStyle.border,
      };
    }

    await user.save();

    // Respond with the updated user object
    res.status(200).json(user);
  } catch (error) {
    // Handle errors and respond with a 500 status code
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// get single page
const getSinglePage = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(404).json({ error: "Username not provided" });
    }

    const user = await User.findOne({ username });
    const links = await Links.find({ user: user._id }).sort({ order: 1 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!links) {
      return res.status(404).json({ error: "Links not found" });
    }

    res.status(200).json({ data: { user: user, links: links } });
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  // If user not found, return a 404 error
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.profile_image = "";

  user.save();

  res.status(200).json({ message: "operation successful" });
});

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  editAccount,
  editProfile,
  updateUserPage,
  getSinglePage,
  deleteProfileImage,
};
