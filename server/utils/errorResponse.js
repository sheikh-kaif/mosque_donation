// Logs the real (technical) error on the server, but sends the user a
// short, friendly message instead of raw error details (e.g. "Donation.findOne is not a function").
// `context` is just a label to make server logs easier to search (e.g. "login", "confirmUpiDonation").
function sendServerError(res, error, context, friendlyMessage, statusCode = 500) {
  console.error(`[${context}] error:`, error);
  return res.status(statusCode).json({
    status: false,
    message: friendlyMessage || "Something went wrong. Please try again.",
  });
}

module.exports = { sendServerError };
