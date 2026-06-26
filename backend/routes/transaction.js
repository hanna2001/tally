const express = require("express");
const { randomUUID } = require("crypto");
const { readAll, appendOne, readOne, updateOne, deleteOne, totalTransactionAmout, getBudgetSummary } = require("../utils/db");

const router = express.Router();

function findReturn(participants) {
  if (!Array.isArray(participants)) return 0;
  return participants
    .filter(p => p.name !== "You")
    .reduce((sum, p) => sum + (parseFloat(p.owes)? parseFloat(p.owes) : 0), 0);
}

function transactionData(transaction) {
  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: parseFloat(transaction.amount),
    category: transaction.category,
    categoryId: transaction.categoryId,
    method: transaction.method,
    methodId: transaction.paymentMethodId,
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

// ── GET /api/transactions/:sheetId ──────────────────────────────
router.get("/:sheetId", (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 100);

    const result = readAll(req.params.sheetId, page, limit);
    res.json({
      success: true,
      data: result.data.map(transactionData),
      pagination: result.pagination,
    });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});



// ── POST /api/transactions/:sheetId ─────────────────────────────
router.post("/:sheetId", (req, res) => {
  try {
    const { sheetId } = req.params;
    const { date, description, amount, category, categoryId, method, paymentMethodId, taxReturnable, people, notes } = req.body;
    
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
      people.forEach(p => {
        if(!p.owes)
            p.owes = 0;
        })
    }

    const transaction = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      date,
      description: description || "",
      amount: parseFloat(amount).toFixed(2),
      category: category || "",
      categoryId: categoryId || null,  
      method: method || "",
      taxReturnable: taxReturnable ? "yes" : "no",
      people: people || [],
      paymentMethodId: paymentMethodId || null,
      notes: notes || "",
    };

    appendOne(sheetId, transaction);

    res.json({ success: true, data: transactionData(transaction) });
  } catch (err) {
    const status = typeof err.code === "number" ? err.code : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/transactions/:sheetId/:id ────────────────────────
router.delete("/:sheetId/:id", (req, res) => {
  try {
    deleteOne(req.params.id);
    res.json({ success: true, message: "Transaction deleted." });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/transactions/:sheetId/:id ───────────────────────────
router.put("/:sheetId/:id", (req, res) => {
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
      people.forEach(p => { if (!p.owes) p.owes = 0; });
    }

    updateOne(id, { date, description, amount, category, method, taxReturnable, people, notes });

    const updated = readOne(id);
    res.json({ success: true, data: transactionData(updated) });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

// ── GET /api/transactions/:sheetId/budget-summary ────────────────
router.get("/:sheetId/budget-summary", (req, res) => {
  try {
    const summary = getBudgetSummary(req.params.sheetId);
    res.json({ success: true, data: summary });
  } catch (err) {
    const status = typeof err.code === "number" ? err.code : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

module.exports = router;