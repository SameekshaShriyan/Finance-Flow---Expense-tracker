const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware FIRST
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

