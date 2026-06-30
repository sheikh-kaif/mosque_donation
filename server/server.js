const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: "./environ.env" });
const cookieparser = require("cookie-parser");
const connectDB = require("./config/mogodb");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const adminRoutes = require("./routes/adminRoutes");

require("./reminderJob");

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 4000;
connectDB();
// const allowedOrigins = ["http://localhost:5173","https://mosque-donation-app-six.vercel.app"];

const allowedOrigins = [
  "http://localhost:5173",
  "https://mosque-donation-boys6.vercel.app",
  "https://mosque-donation-tawny.vercel.app/",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieparser());

//API test routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API working",
  });
});

//API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`server started on PORT:${port}`);
});
