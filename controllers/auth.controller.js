import Account from "../models/account.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { loginSchema, registerSchema } from "../utils/validations.js";
import bcrypt from "bcryptjs";

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
    return next(new AppError(validationResult.error));
  }

  const { email, password } = validationResult.data;

  const existingAccount = await Account.findOne({
    provider: "credentials",
    email,
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
    return next(new AppError(validationResult.error));
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
    email,
    password: hashedPassword,
    provider: "credentials",
    providerAccountId: user._id.toString(),
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
