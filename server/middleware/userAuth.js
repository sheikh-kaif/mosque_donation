const jwt = require("jsonwebtoken");
const { promisify } = require("util");

//decode token coming from cookies to get user details
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({
      status: false,
      message: "Not authorized . Login again",
    });
  }
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
// console.log("DECODED:", decoded);
    if (decoded.id) {
      // req.body.userId = decoded.id;
      req.userId = decoded.id || decoded.userId;
    } else {
      return res.status(400).json({
        status: false,
        message: "Not authorized . Login again",
      });
    }
    next();
  } catch (error) {
    res.status(400).json({
      status:false,
      message: error.message,
    });
  }
};

module.exports = userAuth;
