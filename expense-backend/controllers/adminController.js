const User = require("../models/User");
const Expense = require("../models/Expense");

let categories = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Utilities", "Rent", "Other"];

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Expense.countDocuments();

    res.json({
      totalUsers,
      totalCategories: categories.length,
      totalTransactions
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

exports.getCategories = (req, res) => {
  res.json(categories);
};

exports.addCategory = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name required" });

  if (categories.includes(name)) {
    return res.status(400).json({ message: "Category already exists" });
  }

  categories.push(name);
  res.json({ message: "Category added", categories });
};