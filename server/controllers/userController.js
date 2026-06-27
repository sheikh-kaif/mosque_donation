const User = require("../modals/userModal");
const { sendServerError } = require("../utils/errorResponse");

//getting user data based
exports.getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        status: "unsuccessful",
        message: "user not found",
      });
    }
    res.status(200).json({
      status: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        isAdmin: user.isAdmin || user.email === process.env.ADMIN_EMAIL,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "getUserData",
      "Could not load your account details. Please try again.",
      400,
    );
  }
};

//set friday reminder true/false
exports.updateReminder = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { reminderEnabled: req.body.reminderEnabled },
      { new: true },
    );

    res.json({
      success: true,
      reminderEnabled: user.reminderEnabled,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//getting reminder status if it is true/false
exports.getReminderStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, reminderEnabled: user.reminderEnabled });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
