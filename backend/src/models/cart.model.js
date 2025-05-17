import { model, Schema } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
    amount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

export const Cart = model("Cart", cartSchema);
