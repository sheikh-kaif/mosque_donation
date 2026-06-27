// const jwt = require("jsonwebtoken");
// const { promisify } = require("util");
// const User = require("../modals/userModal");

// // Extends userAuth: also verifies the user has isAdmin === true.
// const adminAuth = async (req, res, next) => {
//   const { token } = req.cookies;
//   if (!token) {
//     return res.status(401).json({
//       status: false,
//       message: "Not authorised. Please log in.",
//     });
//   }
//   try {
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//     if (!decoded.id) {
//       return res.status(401).json({
//         status: false,
//         message: "Invalid token. Please log in again.",
//       });
//     }

//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({
//         status: false,
//         message: "User not found.",
//       });
//     }

//     if (!user.isAdmin) {
//       return res.status(403).json({
//         status: false,
//         message: "Access denied. Admins only.",
//       });
//     }

//     req.userId = decoded.id;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       status: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = adminAuth;

const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../modals/userModal");

const adminAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Not authorised. Please log in." });
  }
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "User not found." });
    }

    const isAdmin = user.isAdmin || user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ status: false, message: "Access denied. Admins only." });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ status: false, message: error.message });
  }
};

module.exports = adminAuth;
