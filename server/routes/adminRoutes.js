const express = require("express");
const Router = express.Router();

const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// One-time setup: grant admin to a user by email + secret (no auth needed — protected by secret)
Router.post("/setup", adminController.setupAdmin);

// All routes below require a valid admin JWT cookie
Router.get("/donations", adminAuth, adminController.getAllDonations);
Router.patch(
  "/donations/:id/verify",
  adminAuth,
  adminController.verifyDonation,
);
Router.patch(
  "/donations/:id/reject",
  adminAuth,
  adminController.rejectDonation,
);

module.exports = Router;
