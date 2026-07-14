const express = require("express");
const { randomUUID } = require("crypto");
const { readAll, appendOne, readOne, updateOne, deleteOne, totalTransactionAmout, getBudgetSummary, togglePaid } = require("../utils/db");

const router = express.Router();

function transactionData(transaction) {
  const participants = transaction.participants || [];

  const returnAmount = participants
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);

  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: parseFloat(transaction.amount),
    personal: parseFloat(transaction.personal),
    effectiveAmount: parseFloat(transaction.effective_amount),
    returnAmount,
    category: transaction.category,
    categoryId: transaction.categoryId,
    method: transaction.method,
    methodId: transaction.paymentMethodId,
    people: participants,
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
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filters = {
      category: req.query.category || null,
      search: req.query.search || null,
      paymentMethod: req.query.paymentMethod || null,
    };

    const result = readAll(req.params.sheetId, page, limit, filters);
    res.json({
      success: true,
      data: result.data.map(transactionData),
      pagination: result.pagination,
    });
  } catch (err) {
    const status = typeof err.code === "number" ? err.code : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});



// ── POST /api/transactions/:sheetId ─────────────────────────────
router.post("/:sheetId", (req, res) => {

  try {
    const { sheetId } = req.params;
    const { date, description, amount, personal, category, categoryId, method, paymentMethodId, taxReturnable, people, notes } = req.body;
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }
    

    if (people.length > 0) {
      if (personal == null || isNaN(parseFloat(personal))) {
        return res.status(400).json({ success: false, message: "Your share (personal) is required when participants are added." });
      }
      const othersTotal = people.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
      const diff = Math.abs(parseFloat(amount) - (parseFloat(personal) + othersTotal));
      if (diff > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Your share (₹${parseFloat(personal).toFixed(2)}) + participants (₹${othersTotal.toFixed(2)}) must equal total (₹${parseFloat(amount).toFixed(2)}).`,
        });
      }
    }

    const transaction = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      date,
      description: description || "",
      amount: parseFloat(amount),
      personal: people.length > 0 ? parseFloat(personal) : parseFloat(amount),
      category: category || "",
      categoryId: categoryId || null,
      method: method || "",
      taxReturnable: taxReturnable ? "yes" : "no",
      people,
      paymentMethodId: paymentMethodId || null,
      notes: notes || "",
    };

    appendOne(sheetId, transaction);
    const saved = readOne(transaction.id);
    res.json({ success: true, data: transactionData(saved) });
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
    const { date, description, amount, personal, category, categoryId, method, paymentMethodId, taxReturnable, people, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    if (people.length > 0) {
      if (personal == null || isNaN(parseFloat(personal))) {
        return res.status(400).json({ success: false, message: "Your share (personal) is required when participants are added." });
      }
      const othersTotal = people.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
      const diff = Math.abs(parseFloat(amount) - (parseFloat(personal) + othersTotal));
      if (diff > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Your share (₹${parseFloat(personal).toFixed(2)}) + participants (₹${othersTotal.toFixed(2)}) must equal total (₹${parseFloat(amount).toFixed(2)}).`,
        });
      }
    }

    updateOne(id, {
      date, description, amount: parseFloat(amount),
      personal: people.length > 0 ? parseFloat(personal) : parseFloat(amount),
      category, categoryId: categoryId || null,
      method, paymentMethodId: paymentMethodId || null,
      taxReturnable, people: people, notes,
    });

    const updated = readOne(id);
    res.json({ success: true, data: transactionData(updated) });
  } catch (err) {
    const status = typeof err.code === "number" ? err.code : 500;
    res.status(status).json({ success: false, message: err.message });
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

// ── PATCH /api/transactions/:sheetId/:transactionId/participants/:participantId/paid
router.patch("/:sheetId/:transactionId/participants/:participantId/paid", (req, res) => {
  try {
    const { participantId } = req.params;
    const { paid } = req.body;
    togglePaid(participantId, paid);
    const updated = readOne(req.params.transactionId);
    res.json({ success: true, data: transactionData(updated) });
  } catch (err) {
    const status = typeof err.code === "number" ? err.code : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

module.exports = router;