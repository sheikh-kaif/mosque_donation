const Donation = require("../modals/donationModel");
const mongoose = require("mongoose");
const crypto = require("crypto");
const transporter = require("../config/nodemailer.js");
const { sendServerError } = require("../utils/errorResponse");
// Builds the upi:// deep link that mobile UPI apps (PhonePe, Paytm, GPay, BHIM, etc.)
// know how to open directly for a payment request.
function buildUpiLink({ upiId, payeeName, amount, reference }) {
  const params = new URLSearchParams({
    pa: upiId, // payee VPA / UPI ID
    pn: payeeName, // payee name
    am: String(amount), // amount
    cu: "INR",
    tn: `Donation ${reference}`, // transaction note, doubles as our reference
  });
  return `upi://pay?${params.toString()}`;
}

//creates a pending donation + the UPI link/details needed to render a QR code
exports.createUpiDonation = async (req, res) => {
  try {
    const userId = req.userId;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Please enter a valid donation amount",
      });
    }

    const upiId = process.env.UPI_ID;
    const payeeName = process.env.UPI_PAYEE_NAME || "FaithFund";

    if (!upiId) {
      return res.status(500).json({
        status: false,
        message:
          "UPI ID is not configured on the server yet. Set UPI_ID in the server environment file.",
      });
    }

    const reference = `FF${Date.now()}${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const donation = await Donation.create({
      userId,
      amount,
      reference,
      method: "upi",
      status: "created",
    });

    const upiLink = buildUpiLink({ upiId, payeeName, amount, reference });

    res.json({
      status: true,
      donationId: donation._id,
      reference,
      amount,
      upiId,
      payeeName,
      upiLink,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "createUpiDonation",
      "Could not start your donation. Please try again.",
    );
  }
};

// called when the donor says they've completed the payment in their UPI app.
// There is no payment gateway here, so this just marks the donation as
// "awaiting_verification" (optionally with the UTR they were given) so it can
// be reconciled against the bank/UPI statement later.
exports.confirmUpiDonation = async (req, res) => {
  try {
    const mongoose = require("mongoose");

    console.log("Ready State:", mongoose.connection.readyState);
    const userId = req.userId;
    const { reference, utr } = req.body;

    if (!reference) {
      return res.status(400).json({
        status: false,
        message: "Missing donation reference",
      });
    }

    const donation = await Donation.findOne({ reference, userId });

    if (!donation) {
      return res.status(404).json({
        status: false,
        message: "Donation not found",
      });
    }

    donation.status = "awaiting_verification";
    if (utr) donation.utr = String(utr).trim();
    await donation.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New Donation Verification Request",
      text: `
      Reference: ${reference}
      User ID: ${userId}
      Amount: ₹${donation.amount}
      UTR: ${utr || "Not provided"}
      `,
    });

    res.json({
      status: true,
      message:
        "Thank you! Your donation has been recorded and is awaiting verification.",
      donation,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "confirmUpiDonation",
      "Could not confirm your payment. Please try again.",
    );
  }
};

//legacy endpoint, kept in case anything still posts a completed payment directly
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, paymentId, orderId } = req.body;

    const donation = await Donation.create({
      userId,
      amount,
      paymentId,
      orderId,
      status: "awaiting_verification",
    });

    res.json({
      status: true,
      message: "Donation saved",
      donation,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "verifyPayment",
      "Could not save your donation. Please try again.",
    );
  }
};

//sending total donation received till now
exports.getTotalDonations = async (req, res) => {
  try {
    const result = await Donation.aggregate([
      {
        $match: { status: { $ne: "created" } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      status: true,
      total: result[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ status: false });
  }
};

//sending user total donation till now
exports.getUserTotal = async (req, res) => {
  try {
    const result = await Donation.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          status: { $ne: "created" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      status: true,
      total: result[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ status: false });
  }
};

//sending user donations one by one
exports.getUserDonations = async (req, res) => {
  try {
    const userId = req.userId;

    const donations = await Donation.find({
      userId,
      status: { $ne: "created" },
    }).sort({ date: -1 });

    res.json({
      status: true,
      donations,
    });
  } catch (error) {
    res.status(500).json({ status: false });
  }
};
