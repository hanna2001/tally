const express = require("express");
const { randomUUID } = require("crypto");
const { readAll, appendOne, updateOne, deleteOne,totalTransactionAmout } = require("../utils/db");

const router = express.Router();

function findReturn(participants) {
  if (!Array.isArray(participants)) return 0;
  return participants
    .filter(p => p.name !== "You")
    .reduce((sum, p) => sum + (parseFloat(p.owes) > 0 ? parseFloat(p.owes) : 0), 0);
}

function transactionData(transaction) {
  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: parseFloat(transaction.amount),
    category: transaction.category,
    method: transaction.method,
    people: transaction.participants || [],
    returnAmount: findReturn(transaction.participants),
    notes: transaction.notes,
  };
}

router.get("/", (_req, res) => {
  try {
    const data = totalTransactionAmout()
    res.json({data});
  } catch (err) {
    res.status(500).json({ error: "Failed to get data" });
  }
});

// ── GET /api/transactions/:filename ──────────────────────────────
router.get("/:filename", (req, res) => {
  try {
    const rows = readAll(req.params.filename);
    const transactions = rows.map(transactionData)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});



// ── POST /api/transactions/:filename ─────────────────────────────
router.post("/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const { date, description, amount, category, method, taxReturnable, people, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    if (Array.isArray(people) && people.length > 0) {
      const participantTotal = people.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
      const diff = Math.abs(parseFloat(amount) - Math.abs(participantTotal));
      if (diff > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Participant amounts (₹${participantTotal.toFixed(2)}) do not match total (₹${parseFloat(amount).toFixed(2)}).`,
        });
      }
    }

    const transaction = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      date,
      description: description || "",
      amount: parseFloat(amount).toFixed(2),
      category: category || "",
      method: method || "",
      taxReturnable: taxReturnable ? "yes" : "no",
      people: people || [],
      notes: notes || "",
    };

    appendOne(filename, transaction);

    res.json({
      success: true,
      data: {
        ...transactionData(transaction),
        people: people || [],
        returnAmount: findReturn(people || []),
      },
    });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/transactions/:filename/:id ────────────────────────
router.delete("/:filename/:id", (req, res) => {
  try {
    deleteOne(req.params.id);
    res.json({ success: true, message: "Transaction deleted." });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/transactions/:filename/:id ───────────────────────────
router.put("/:filename/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, category, method, taxReturnable, people, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    if (Array.isArray(people) && people.length > 0) {
      const participantTotal = people.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
      const diff = Math.abs(parseFloat(amount) - Math.abs(participantTotal));
      if (diff > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Participant amounts (₹${participantTotal.toFixed(2)}) do not match total (₹${parseFloat(amount).toFixed(2)}).`,
        });
      }
    }

    updateOne(id, { date, description, amount, category, method, taxReturnable, people, notes });

    const updated = readAll(req.params.filename).find(t => t.id === id);
    res.json({ success: true, data: transactionData(updated) });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;