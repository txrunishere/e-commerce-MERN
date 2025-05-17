import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import { z } from "zod";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utility.js";
import bcrypt from "bcrypt";
import fs from "fs";

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw new Error("Error while generating access token");
  }
};

const handleRegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password, city, state, country, street, area, role } =
    req.body;

  const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contains a uppercase letter")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    street: z.string().min(1, "Street is required"),
    area: z.string().min(1, "Area is required"),
    role: z.enum(["Seller", "Customer"]).default("Customer"),
  });

  const result = userSchema.safeParse({
    name,
    email,
    password,
    city,
    state,
    country,
    street,
    area,
    role,
  });

  if (!result.success) {
    fs.unlinkSync(req.file?.path);
    return res.status(400).json({
      error: result.error.errors.map((err) => err.message),
    });
  }

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    fs.unlinkSync(req.file?.path);
    return res.status(400).json({
      error: "User already exists!",
    });
  }

  const avatarPath = req.file?.path;
  if (!avatarPath) {
    return res.status(400).json({
      error: "Avatar image is required!",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let avatar;

  try {
    console.log("Avatar", avatar);
    avatar = await uploadOnCloudinary(avatarPath, process.env.AVATAR_FOLDER);
  } catch (error) {
    return res.status(500).json({
      error: "Avatar file not uploaded",
    });
  }

  try {
    let user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar.url,
      role: role,
    });

    let setAddress = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          address: {
            city,
            state,
            country,
            street,
            area,
          },
        },
      },
      { new: true }
    );

    if (user && setAddress) {
      return res.status(201).json({
        message: `User ${name} register successfully!`,
        name: setAddress.name,
        email: setAddress.email,
        avatar: setAddress.avatar,
        address: setAddress.address,
        role: setAddress.role,
      });
    } else {
      return res.status(400).json({
        error: "Something wrong while register user",
      });
    }
  } catch (error) {
    console.log("Error while create user", error);

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    return res.status(500).json({
      error: error.message || "Something wrong while register user",
    });
  }
});

const handleLoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      error: "Password is required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  const comparePassword = await user.isPasswordCorrect(password);

  if (!comparePassword) {
    return res.status(400).json({
      error: "Incorrect Password",
    });
  }

  const token = await generateToken(user._id);

  if (user && token) {
    return res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
      })
      .json({
        message: `User ${user.name} Login Successfully`,
        accessToken: token,
      });
  } else {
    return res.status(500).json({
      error: "Error while user login",
    });
  }
});

const handleLogoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken")
    .json({
      message: `User ${req.user.name} logout successfully`,
    });
});

const handleGetUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

export { handleRegisterUser, handleLoginUser, handleGetUser, handleLogoutUser };
