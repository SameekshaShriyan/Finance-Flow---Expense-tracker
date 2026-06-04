const router = require("express").Router();
const expenseController = require("../controllers/expenseController");

router.post("/add", expenseController.addExpense);
router.get("/all", expenseController.getExpenses);

module.exports = router;