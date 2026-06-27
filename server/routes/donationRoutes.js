const express = require("express");
const Router = express.Router();

const donationController = require("../controllers/donationController");
const userAuth = require("../middleware/userAuth");

// Step 1: generate a UPI link + reference for the donation amount entered
Router.post("/create", userAuth, donationController.createUpiDonation);

// Step 2: donor confirms they've completed the payment in their UPI app
Router.post("/confirm", userAuth, donationController.confirmUpiDonation);

//  Save donation after payment (legacy)
Router.post("/verify", userAuth, donationController.verifyPayment);

//  Get total donation (all users)
Router.get("/total", donationController.getTotalDonations);

// Get logged-in user total
Router.get("/user-total", userAuth, donationController.getUserTotal);

//  Get user donation history
Router.get("/history", userAuth, donationController.getUserDonations);

module.exports = Router;