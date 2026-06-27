const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String, // legacy field, kept for backward compatibility
  },
  orderId: {
    type: String,
  },
  // Unique reference we generate for every UPI donation attempt.
  // Used as the UPI transaction note so it can be matched to a bank entry later.
  reference: {
    type: String,
    unique: true,
    sparse: true,
  },
  method: {
    type: String,
    enum: ["upi"],
    default: "upi",
  },
  // created               -> QR/link generated, user has not confirmed paying yet
  // awaiting_verification -> user said "I've paid" (optionally with a UTR), needs manual confirmation
  // verified               -> manually confirmed against bank/UPI statement (e.g. by an admin)
  status: {
    type: String,
    enum: ["created", "awaiting_verification", "verified"],
    default: "created",
  },
  // UTR / UPI transaction reference number the donor enters after paying, if they have it
  utr: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
