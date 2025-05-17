import { model, Schema } from "mongoose";

const cartSchema = new Schema(
  {
    userId: ObjectId,
    items: [
      {
        productId: ObjectId,
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Cart = model("Cart", cartSchema);
