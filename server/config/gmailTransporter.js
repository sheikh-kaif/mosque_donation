const nodemailer = require("nodemailer");

//used to send email for friday reminder
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

module.exports = gmailTransporter;