const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  category: String,
  limit: Number,
  month: Number,
  year: Number,
});

module.exports = mongoose.model("Budget", budgetSchema);