import asyncHandler from "express-async-handler";
import { User } from "../models/user.model.js";
import { z } from "zod";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utility.js";
import bcrypt from 'bcrypt'

const handleRegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password, city, state, country, street, area } =
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
  });

  if (!result.success) {
    return res.status(400).json({
      error: result.error.errors.map((err) => err.message),
    });
  }

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
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

  const hashedPassword = await bcrypt.hash(password, 12)

  let avatar;

  try {
    console.log(avatar);
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
    })

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
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        address: user.address
      });
    } else {
      return res.status(400).json({
        error: "Something wrong while register user",
      });
    }
  } catch (error) {
    console.log("Error while create user", error);

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id)
    }

    return res.status(500).json(
      {
        error: error.message || "Something wrong while register user"
      }
    )
  }
})


export { handleRegisterUser };
