// db.js
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/session_demo")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));
