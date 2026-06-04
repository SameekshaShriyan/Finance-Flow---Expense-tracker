const router = require("express").Router();
const billController = require("../controllers/billController");

router.post("/add", billController.addBill);
router.get("/all", billController.getBills);

module.exports = router;