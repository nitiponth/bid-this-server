import mongoose from "mongoose";

const transaction = mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User", require: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
});

exports.Transaction = mongoose.model("Transaction", transaction);
