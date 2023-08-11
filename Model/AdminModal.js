const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema,"Admin");