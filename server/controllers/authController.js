const User = require("../modals/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const validator = require("validator");
const { sendServerError } = require("../utils/errorResponse");

//creating new user
exports.register = async (req, res) => {
  console.log("Register route hit");
  console.log(
    "Mongoose readyState:",
    require("mongoose").connection.readyState,
  );

  const { name, email, password } = req.body;
  console.log("Password received:", password, password.length);
  console.log("Email received:", email);
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Missing Details",
    });
  }
  try {
    console.log("before findone");
    const existingUser = await User.findOne({ email });
    console.log("after findone");
    if (existingUser) {
      return res.status(400).json({
        status: "unsuccessfull",
        message: "User already exists",
      });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and include a number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome",
      text: `Welcome to FaithFund family. Your account has been created with email id: ${email}`,
    };
    console.log("Attempting to send email to:", email);
    await transporter.sendMail(mailOption);
    console.log("email send:", email);
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "register",
      "Could not create your account. Please try again.",
    );
  }
};

//generating token if email and password matches
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "unsuccessfull",
        message: "invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "unsuccessfull",
        message: "invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //   sameSite: "lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "login",
      "Could not log you in. Please try again.",
    );
  }
};

//logout user
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "logout",
      "Could not log you out. Please try again.",
    );
  }
};
exports.sentVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        status: false,
        message: "Account already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP`,
    };
    await transporter.sendMail(mailOption);

    res.status(200).json({
      success: true,
      message: "verification OTP sent on Email",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "sentVerifyOtp",
      "Could not send the verification OTP. Please try again.",
    );
  }
};

//verifying email
exports.verifyEmail = async (req, res) => {
  const userId = req.userId; // from middleware
  const { otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Missing details",
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP is expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "verifyEmail",
      "Could not verify your email. Please try again.",
    );
  }
};

//check if user is authenticated
exports.isAuthenticated = async (req, res) => {
  try {
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "isAuthenticated",
      "Could not check your session. Please try again.",
      400,
    );
  }
};

//sending password reset otp
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "email is required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "user not found",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset password OTP",
      text: `Your OTP is ${otp}. Reset password using this OTP(valid for 15 min only)`,
    };
    await transporter.sendMail(mailOption);
    res.status(200).json({
      status: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "sendResetOtp",
      "Could not send the reset OTP. Please try again.",
      400,
    );
  }
};

//verify otp adn  reset password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Missing Details",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "user not found",
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({
        status: false,
        message: "invalid otp",
      });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        status: false,
        message: "otp is expired",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.status(200).json({
      status: true,
      message: "password has been reset",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "resetPassword",
      "Could not reset your password. Please try again.",
      400,
    );
  }
};
