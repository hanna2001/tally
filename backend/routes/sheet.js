const express = require("express");
const { createSheet, listSheets, deleteSheet, totalTransactionAmout, createBudgetCategories, getBudgetCategories } = require("../utils/db");
const { randomUUID } = require("crypto");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { name, type, budgetEnabled, totalBudget, budgetCategories } = req.body;
    if (!name) return res.status(400).json({ error: "Sheet name is required." });

    const sheet = createSheet(name, {
      type: type || "monthly",
      budgetEnabled: budgetEnabled ? 1 : 0,
      totalBudget: budgetEnabled ? (parseFloat(totalBudget) || 0) : 0,
    });

    // If budget enabled and categories provided, insert them
    if (budgetEnabled && Array.isArray(budgetCategories) && budgetCategories.length > 0) {
      createBudgetCategories(sheet.id, budgetCategories);
    }

    res.status(201).json({ success: true, data: sheet });
  } catch (err) {
    res.status(err.code || 500).json({ error: `${err.message}` });
  }
});

router.get("/", (_req, res) => {
  try {
    const sheets = listSheets();
    res.json({ sheets, total: sheets.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to list sheets." });
  }
});

router.get("/:id/budget", (req, res) => {
  try {
    const budget = getBudgetCategories(req.params.id);
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.delete("/:name", (req, res) => {
      // s1
      try {
    deleteSheet(req.params.name);
    res.json({ message: `Sheet "${req.params.name}" deleted successfully.` });
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;