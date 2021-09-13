import mongoose from "mongoose";

const user = mongoose.Schema({
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
  product: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
});

exports.User = mongoose.model("User", user);
