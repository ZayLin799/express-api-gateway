const mongoose = require("mongoose");

const User_Otp = mongoose.model(
  "User_Otp",
  new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    otp: String,
    createdAt: { type: Date, default: Date.now },
  })
);

module.exports = User_Otp;
