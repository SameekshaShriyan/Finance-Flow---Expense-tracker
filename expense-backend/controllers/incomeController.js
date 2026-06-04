const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getIncome = async (req, res) => {
  try {
    const income = await Income.find();
    res.json(income);
  } catch (err) {
    res.status(500).json(err);
  }
};