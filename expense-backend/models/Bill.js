const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  billName: String,
  amount: Number,
  dueDate: Date,
  status: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Bill", billSchema);