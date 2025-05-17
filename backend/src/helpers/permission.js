import { User } from '../models/user.model.js'

export const isSeller = async (userId) => {
  const user = await User.findById(userId)

  if (user.role === "Seller") {
    return true
  } else {
    return false
  }
}