const express = require("express");
const authController = require("../controllers/authController");
const Router = express.Router();
const userAuth=require("../middleware/userAuth")

//sign up user
Router.post("/register", authController.register);

//login user
Router.post("/login", authController.login);

//logout user
Router.post("/logout", authController.logout);

//sending verify otp to user based on token coming from them
Router.post("/send-verify-otp", userAuth,authController.sentVerifyOtp);

//verifying otp 
Router.post("/verify-account", userAuth,authController.verifyEmail);

//checking if user is authenticated
Router.get("/is-auth",userAuth,authController.isAuthenticated)

//sending reset otp
Router.post("/send-reset-otp",authController.sendResetOtp)

//reset password
Router.post("/reset-password",authController.resetPassword)

module.exports = Router;
