const jwt = require("jsonwebtoken");
require("dotenv").config();

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

//[Section] Token Creation
/*
Analogy
    Pack the gift and provide a lock with the secret code as the key
*/

module.exports.createAccessToken = (user) => {

	// Payload/data from the user
	const data = {
		id: user.id,
		email: user.email,
		isAdmin: user.isAdmin
	}
	// console.log(data)

	// Generates the token through the sign() method
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {
		// "30s" - 30 seconds
		// "1m" - 1 minutes
		// "1h" - 1 hour
		expiresIn: "1d"
	})
}

module.exports.verify = (req, res, next) => {

	console.log("REQ HEADERS: ", req.headers.authorization);

	let token = req.headers.authorization

	if (typeof token === "undefined") {
		return res.send({ auth: "Failed. No Token"});
	} else {
		console.log(token);
		// To remove the "Bearer " prefix
		token = token.slice(7, token.length);
		console.log(token);

		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {

			if(err){
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				})
			} else {
				console.log("Result from verify method: ")
				console.log(decodedToken)

				// Assigns the user with the values from the decodedToken
				req.user = decodedToken;

				// next() is an expressJS function which allows us to move to the next function in the route. It also passes details of the request and response to the next function/middleware.
				next();
			}
		})
	}
}


module.exports.verifyAdmin = (req, res, next) => {

	console.log("Result from verifyAdmin: ", req.user);

	if(req.user.isAdmin){
		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}

// Error Handler
module.exports.errorHandler = (err, req, res, next) => {

	console.log(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || "Internal Server Error";

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || "SERVER_ERROR",
			details: err.details || null
		}
	})
}


module.exports.isLoggedIn = (req, res, next) => {
	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}
}