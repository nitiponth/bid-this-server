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
    desc: { type: String },
    phone: { type: String, required: true },
    address: {
      home: { type: String, required: true },
      province: { type: String, required: true },
      postcode: { type: Number, required: true },
    },
    watchlists: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    wallet: { type: Number, required: true },
    profile: { type: String },
    cover: { type: String },
    kyc: {
      idCard: { type: String },
      photo: { type: String },
    },
    status: { type: String, required: true },
    role: { type: String, required: true },
    cards: [
      {
        id: String,
        cardInfo: {
          id: String,
          expiration_month: Number,
          expiration_year: Number,
          brand: String,
          last_digits: String,
        },
      },
    ],
    bankAccounts: [
      {
        id: String,
        bankInfo: {
          id: String,
          brand: String,
          last_digits: Number,
          name: String,
          active: Boolean,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

exports.User = mongoose.model("User", user);
