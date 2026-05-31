const express = require("express");
const { createSheet, listSheets, deleteSheet, totalTransactionAmout } = require("../utils/db");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Sheet name is required." });
    const sheet = createSheet(name);
    res.status(201).json({ message: `Sheet "${name}" created successfully.`, name: sheet.name });
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

router.get("/", (_req, res) => {
  try {
    const sheets = listSheets();
    const data = totalTransactionAmout()
    res.json({ sheets, amount_data: data, total: sheets.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to list sheets." });
  }
});

router.delete("/:name", (req, res) => {
  try {
    deleteSheet(req.params.name);
    res.json({ message: `Sheet "${req.params.name}" deleted successfully.` });
  } catch (err) {
    res.status(err.code || 500).json({ error: err.message });
  }
});

module.exports = router;