// routes/transactions.js

const express = require("express");
const { randomUUID } = require("crypto");
const { readAll, appendOne, writeAll, CSV_PATH } = require("../utils/csv");
const fs = require("fs");

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────

function serializeParticipants(participants) {
  if (!Array.isArray(participants)) return "";
  return participants.map((p) => `${p.name}:${p.owes || 0}`).join("|");
}

function deserializeParticipants(str) {
  if (!str) return [];
  return str.split("|").filter(Boolean).map((p) => {
    const [name, owes] = p.split(":");
    return { name, owes: owes || "0" };
  });
}

function findReturn(str){
    
    const participants = deserializeParticipants(str);
    const othersTotal = participants
      .filter(p => p.name !== "You")
      .reduce((sum, p) => {
            const value = Number(p.owes);
            return sum + (value > 0 ? value : 0);
        }, 0);
    return othersTotal


}

// ── GET /api/transactions/export  (must be BEFORE /:id) ───────────
router.get("/export", (req, res) => {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      return res.status(404).json({ success: false, message: "No transactions yet." });
    }
    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    fs.createReadStream(CSV_PATH).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to export." });
  }
});

// ── GET /api/transactions ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const rows = await readAll();
    
    const transactions = rows.map((r) => ({
      ...r,
      participants: deserializeParticipants(r.participants),
      return: findReturn(r.participants)}))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log(transactions)
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to read transactions." });
  }
});

// ── POST /api/transactions ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { date, description, amount, category, method, taxReturnable, participants, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    // Validate participant totals if participants are provided
    if (Array.isArray(participants) && participants.length > 0) {
      const participantTotal = participants.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
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
      participants: serializeParticipants(participants),
      notes: notes || "",
    };

    appendOne(transaction);

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save transaction." });
  }
});

// ── DELETE /api/transactions/:id ──────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await readAll();
    const filtered = rows.filter((r) => r.id !== id);

    if (filtered.length === rows.length) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    writeAll(filtered);
    res.json({ success: true, message: "Transaction deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete transaction." });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, category, method, taxReturnable, participants, notes } = req.body;
 
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }
 
    if (Array.isArray(participants) && participants.length > 0) {
      const participantTotal = participants.reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
      const diff = Math.abs(parseFloat(amount) - Math.abs(participantTotal));
      if (diff > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Participant amounts (₹${participantTotal.toFixed(2)}) do not match total (₹${parseFloat(amount).toFixed(2)}).`,
        });
      }
    }
 
    const rows = await readAll();
    const index = rows.findIndex((r) => r.id?.trim() === id?.trim()); // CHANGES: trimmed comparison
 
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }
 
    const updated = {
      ...rows[index],
      date,
      description: description || "",
      amount: parseFloat(amount).toFixed(2),
      category: category || "",
      method: method || "",
      taxReturnable: taxReturnable ? "yes" : "no",
      participants: serializeParticipants(participants),
      notes: notes || "",
    };
 
    rows[index] = updated;
    writeAll(rows); // CHANGES: rewrites entire CSV with updated row in place
 
    res.json({
      success: true,
      data: {
        ...updated,
        taxReturnable: updated.taxReturnable === "yes",
        participants: deserializeParticipants(updated.participants),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update transaction." });
  }
});
module.exports = router;