import expressAsyncHandler from "express-async-handler";
import { User } from '../models/user.model.js'
import jwt from 'jsonwebtoken'

export const verifyAuth = expressAsyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(400).json({
        error: "Token not Found"
      })
    }

    const jwt_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const  user = await User.findById(jwt_token._id)

    if (!user) {
      return res.status(404).json({
        error: "User not Found"
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(400).json({
      error: "Token is Invalid or expired"
    })
    // next()
  }
})