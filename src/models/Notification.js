import { Schema, model, Types } from "mongoose";

const notification = new Schema(
  {
    seller: { type: Types.ObjectId, ref: "User" },
    target: { type: Types.ObjectId, ref: "User" },
    product: { type: Types.ObjectId, ref: "Product" },
    message: { type: String, required: true },
    seen: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

export default model("Notification", notification);
