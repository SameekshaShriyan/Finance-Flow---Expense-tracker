const Expense = require("../models/Expense");
const Income = require("../models/Income");

exports.getAnalytics = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const income = await Income.find();

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};