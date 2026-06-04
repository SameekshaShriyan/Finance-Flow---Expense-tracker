const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getUsers,
  getCategories,
  addCategory
} = require("../controllers/adminController");

router.get("/stats", getAdminStats);
router.get("/users", getUsers);
router.get("/categories", getCategories);
router.post("/categories", addCategory);

module.exports = router;