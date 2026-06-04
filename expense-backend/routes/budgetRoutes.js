const router = require("express").Router();
const budgetController = require("../controllers/budgetController");

router.post("/set", budgetController.setBudget);
router.get("/all", budgetController.getBudgets);
router.put("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;