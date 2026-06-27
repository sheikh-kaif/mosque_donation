const Donation = require("../modals/donationModel");
const User = require("../modals/userModal");
const { sendServerError } = require("../utils/errorResponse");

// GET /api/admin/donations
// Returns all donations, newest first, with the donor's name and email joined in.
// Optionally filter by status via ?status=awaiting_verification|created|verified
exports.getAllDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const donations = await Donation.find(filter)
      .sort({ date: -1 })
      .populate("userId", "name email"); // join name + email from users collection

    res.json({
      status: true,
      donations,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "getAllDonations",
      "Could not load donations. Please try again.",
    );
  }
};

// PATCH /api/admin/donations/:id/verify
// Marks a donation as verified (payment confirmed by admin after checking bank/UPI statement).
exports.verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res
        .status(404)
        .json({ status: false, message: "Donation not found." });
    }

    donation.status = "verified";
    await donation.save();

    res.json({
      status: true,
      message: "Donation marked as verified.",
      donation,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "verifyDonation",
      "Could not verify this donation. Please try again.",
    );
  }
};

// PATCH /api/admin/donations/:id/reject
// Rejects / rolls back a donation back to created (e.g., UTR was wrong or payment not found).
exports.rejectDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res
        .status(404)
        .json({ status: false, message: "Donation not found." });
    }

    donation.status = "created";
    await donation.save();

    res.json({
      status: true,
      message: "Donation rejected and reset to pending.",
      donation,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "rejectDonation",
      "Could not update this donation. Please try again.",
    );
  }
};

// POST /api/admin/setup
// One-time endpoint: promotes a user to admin by their email.
// Protected by ADMIN_SETUP_SECRET environment variable.
// Call this once via curl or Postman to make yourself admin, then you don't need it again.
// Example: POST /api/admin/setup { "email": "you@example.com", "secret": "your_secret" }
exports.setupAdmin = async (req, res) => {
  try {
    const { email, secret } = req.body;
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;

    if (!expectedSecret) {
      return res.status(500).json({
        status: false,
        message: "ADMIN_SETUP_SECRET is not set in the server environment.",
      });
    }

    if (secret !== expectedSecret) {
      return res.status(403).json({
        status: false,
        message: "Invalid setup secret.",
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: `No user found with email: ${email}`,
      });
    }

    res.json({
      status: true,
      message: `${user.name} (${user.email}) has been granted admin access.`,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "setupAdmin",
      "Could not complete admin setup. Please try again.",
    );
  }
};
