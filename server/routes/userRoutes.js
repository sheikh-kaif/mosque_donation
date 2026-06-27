const express = require("express");
const userController = require("../controllers/userController");
const Router = express.Router();
const userAuth = require("../middleware/userAuth");

//getting user data
Router.get("/getUserData", userAuth, userController.getUserData);

//setting reminder option 
Router.put("/reminder", userAuth, userController.updateReminder);

//checking reminder status
Router.get("/reminder-status", userAuth, userController.getReminderStatus);
module.exports = Router;
