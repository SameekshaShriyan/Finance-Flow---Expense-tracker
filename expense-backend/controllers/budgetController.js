const Budget = require("../models/Budget");

exports.setBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    // If budget for this category+month+year already exists, update it
    const existing = await Budget.findOne({ category, month, year });
    if (existing) {
      existing.limit = limit;
      await existing.save();
      return res.json(existing);
    }

    const budget = new Budget(req.body);
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      { limit: req.body.limit, category: req.body.category },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};