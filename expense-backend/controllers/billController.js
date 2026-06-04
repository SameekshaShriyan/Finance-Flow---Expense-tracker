const Bill = require("../models/Bill");

exports.addBill = async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (err) {
    res.status(500).json(err);
  }
};