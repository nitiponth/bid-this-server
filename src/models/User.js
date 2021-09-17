import mongoose from "mongoose";

const user = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true },
    },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: {
      home: { type: String, required: true },
      province: { type: String, required: true },
      postcode: { type: Number, required: true },
    },
    watchlists: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    wallet: { type: Number, required: true },
    // products: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    status: { type: String, required: true },
    role: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

exports.User = mongoose.model("User", user);
