const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");
const { errorHandler } = auth;



// User registration

module.exports.registerUser = (req, res) => {

     if (typeof req.body.firstName !== 'string' || typeof req.body.lastName !== 'string') {
        return res.status(400).send({ message: "Name Invalid"});
    }

     if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
        return res.status(400).send({ error: "Password must be atleast 8 characters" });
    }

     if (typeof req.body.mobileNo !== 'string' || req.body.mobileNo.length !== 11) {
        return res.status(400).send({ error: "Mobile number invalid" });
    }

    if (!req.body.email.includes('@')) {
    return res.status(400).send({ error: "Email Invalid" });

    }

    let isAdmin = req.body.isAdmin;
    if (req.body.isAdmin !== undefined) {
        if (typeof req.body.isAdmin !== 'boolean') {
            return res.status(400).send({ message: "Invalid value for isAdmin. It must be a boolean." });
        }
    }




    // Creates a variable "newUser" and instantiates a new "User" object using the mongoose model
    // Uses the information from the request body to provide all the necessary information
    let newUser = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        // "10" is the number of salt rounds that the bcrypt algorithm will run to encrypt the password
        password: bcrypt.hashSync(req.body.password, 10),
        mobileNo: req.body.mobileNo,
        isAdmin: isAdmin  // Default value
    })  

    

    // Saves the created object to our database
    // Then, return result to the handler function. No return keyword used because we're using arrow function's implicit return feature
    // catch the error and return to the handler function. No return keyword used because we're using arrow function's implicit return feature
    return newUser.save()
    .then(result => res.status(201).send({
        message: "Registered Successfully"
    })
        )
    .catch(error => errorHandler(error, req, res));
}


// User authentication

module.exports.loginUser = (req, res) => {

    if(req.body.email.includes("@")) {

        // Checks if the emails exists in the db
        // The "findOne" method returns the first record in the collection that matches the search criteria
    return User.findOne({ email: req.body.email})
    .then(result => {

        // If user does not exist in the db
        if(result == null){
            return res.status(404).send({ message: "No email found"});

        // If user exists
        } else {
            // compareSync() compares a non-encrypted password with the encrypted password from the db/result
            // returns a boolean true/false
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password)

            if(isPasswordCorrect) {
                // Generate a token
                // Uses the "createAccessToken" method defined in the "auth.js" file
                return res.status(200).send({ 
                    access : auth.createAccessToken(result),
                    message: "User logged in successfully"
                });
            } else {
                return res.status(401).send({ error: "Email and password do not match"});
            }
        }
    })
    .catch(error => errorHandler(error, req, res));

    } else {
        return res.status(400).send({ error: "Invalid Email"});
    }

};



// Check if the email already exists

module.exports.checkEmailExists = (req, res) => {

    if(req.body.email.includes("@")) {
        return User.find({ email : req.body.email })
    .then(result => {

        // The "find" method returns a record if a match is found
        if (result.length > 0) {

            return res.status(409).send({ message: "Duplicate email found" });

        // No duplicate email found
        // The user is not yet registered in the database
        } else {

            return res.status(404).send({ error: "No Email found" });
        };
    })
    .catch(error => errorHandler(error, req, res));

    } else {
        res.status(400).send({ message: "Invalid email format" })
    }    
};


module.exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user details', details: err });
    }
};


module.exports.resetPassword = async (req, res) => {
	try {
	  const { newPassword } = req.body;
	  const { id: userId } = req.user; // Extracting user ID from the authorization header
  
	  // Validate the new password
	  if (!newPassword || newPassword.length < 6) {
		return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
	  }
  
	  // Hashing the new password
	  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
	  // Updating the user's password in the database
	  await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
	  // Sending a success response
	  res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
	  console.error('Error resetting password:', error);
	  res.status(500).json({ message: 'Internal server error' });
	}
  };

// Set User as Admin
module.exports.setUserAsAdmin = async (req, res) => {
  try {
    // Extract the user ID from the request parameters
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required in the URL parameters' });
    }

    // Update the user to set them as an admin
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isAdmin: true }, // Set the `isAdmin` field to true
      { new: true }      // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      updatedUser: updatedUser, // Optionally return the updated user details
    });
  } catch (error) {
    console.error('Error updating user to admin:', error);
    res.status(500).json({ 
      error: 'Failed in Find', 
      error: error.message 
    });
  }
};
