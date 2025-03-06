const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth"); // Import verify and verifyAdmin from auth.js
const router = express.Router();


// Route for duplicate email
router.post("/check-email", userController.checkEmailExists);

// User Registration
router.post("/register", userController.registerUser);

// Route for user authentication
router.post("/login", userController.loginUser);

// Routes
router.get('/details', verify, userController.getUserDetails); // Retrieve User Details
router.patch('/:id/set-as-admin', verify, verifyAdmin, userController.setUserAsAdmin); // Set User as Admin
router.patch("/update-password", verify, userController.resetPassword);


module.exports = router;
