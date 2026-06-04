const router = require("express").Router();
const incomeController = require("../controllers/incomeController");

router.post("/add", incomeController.addIncome);
router.get("/all", incomeController.getIncome);

module.exports = router;