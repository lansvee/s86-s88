aconst express = require("express");
const mongoose = require("mongoose");

// Allows our backend application to be available to our frontend application
const cors = require("cors");
require("dotenv").config();

// Routes
const userRoutes = require("./routes/user");



const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_STRING);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => console.log("Now connected to MongoDB Atlas"));

// Routes
app.use("/users", userRoutes);



if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online at port ${process.env.PORT || 3000}`);
  });
}

module.exports = { app, mongoose };
