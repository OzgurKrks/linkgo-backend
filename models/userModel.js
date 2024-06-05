import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    required: [true, "Please provide a name"],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    minlength: [6, "Please provide a password min length 6"],
    required: [true, "Please provide a password"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  Package: {
    type: String,
  },
  url_Name: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  profile_title: {
    type: String,
  },
  profile_bio: {
    type: String,
  },
  image_style: {
    type: String,
  },
  backgroundColor: {
    type: String,
  },
  buttonStyle: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

userSchema.pre("save", function (next) {
  // Change Password
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

// UserSchema Methods
userSchema.methods.generateJwtFromUser = function () {
  const payload = {
    id: this._id,
    username: this.username,
  };
  const token = jwt.sign(payload, "secret", {
    expiresIn: "30d",
  });
  return token;
};

userSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");

  const { RESET_PASSWORD_EXPIRE } = process.env;

  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(60 * 60 * 60 * 60);

  return resetPasswordToken;
};

export default mongoose.model("User", userSchema);
