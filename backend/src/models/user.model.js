import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!!"],
      unique: [true, "Email is already in use"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Seller", "Customer"],
      default: "Customer",
    },
    address: [
      {
        city: String,
        state: String,
        country: String,
        street: String,
        area: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) next();
//   await bcrypt.hash(this.password, 12);
//   next();
// });

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const User = model("User", userSchema);

export { User };
