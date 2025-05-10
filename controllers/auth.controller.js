import Account from "../models/account.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../utils/validations.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import jwt from "jsonwebtoken";
import Email from "../utils/email.js";

const signToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const login = catchAsync(async (req, res, next) => {
  const validationResult = loginSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(AppError.handleValidationError(validationResult.error));
  }

  const { email, password } = validationResult.data;

  const existingAccount = await Account.findOne({
    provider: "credentials",
    providerAccountId: email,
  });
  if (!existingAccount) {
    return next(new AppError("No account for this email exists", 401));
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingAccount.password
  );

  if (!isPasswordValid) {
    return next(new AppError("Invalid credentials", 401));
  }

  const user = await User.findById(existingAccount.userId);
  if (!user) {
    return next(new AppError("No user found", 404));
  }

  signToken(user._id, res);
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    },
  });
});

export const register = catchAsync(async (req, res, next) => {
  const validationResult = registerSchema.safeParse(req.body);

  if (!validationResult.success) {
    return next(AppError.handleValidationError(validationResult.error));
  }

  const { name, email, password } = validationResult.data;

  let user = await User.findOne({ email });
  if (user) {
    return next(new AppError("User with this email already exists", 400));
  }

  user = await User.create({
    name,
    email,
  });

  const hashedPassword = await bcrypt.hash(password, 12);

  await Account.create({
    userId: user._id,
    name,
    password: hashedPassword,
    provider: "credentials",
    providerAccountId: email,
  });

  signToken(user._id, res);
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const validationResult = forgotPasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    return next(AppError.handleValidationError(validationResult.error));
  }

  const { email } = validationResult.data;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError("No user with this email exits", 400));

  const token = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

  console.log("Reset URL", resetUrl);

  try {
    const emailSender = new Email(user, resetUrl);
    await emailSender.sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Check your email for resetting password",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(err);

    return next(
      new AppError("An error occured while sending email. Try again later")
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Hash the reset token to match stored value
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user by token and check expiration
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Find the credentials account for this user
  const account = await Account.findOne({
    userId: user._id,
    provider: "credentials",
  });

  if (!account) {
    return next(new AppError("Credentials account not found", 404));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);
  account.password = hashedPassword;
  await account.save();

  // Clear reset token fields on User
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresIn = undefined;
  await user.save({ validateBeforeSave: false });

  // Sign new token
  signToken(user._id, res);

  res.status(200).json({
    status: "success",
    message: "Password reset successful",
  });
});

export const googleCallback = catchAsync(async (req, res) => {
  signToken(req.user._id, res);

  res.redirect(`${process.env.FRONTEND_URL}`);
});

export const getCurrentUser = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});
