import { model, Schema } from 'mongoose'

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 10
    },
    price: Number,
    stock: String,
    productImage: String, // url
    brand: String,
  },
  {
    timestamps: true
  }
)

export const Product = model("Product", productSchema)