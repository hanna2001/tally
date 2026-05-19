// routes/transactions.js

const express = require("express");
const { randomUUID } = require("crypto");
const { readAll, appendOne, writeAll } = require("../utils/csv");
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


function transactionData(transaction){
  return {
    id: transaction.id,
    date: transaction.date,
    description: transaction.description,
    amount: parseFloat(transaction.amount),
    category: transaction.category,
    method: transaction.method,
    people: deserializeParticipants(transaction.participants)|| [],
    returnAmount: findReturn(transaction.participants),
    notes: transaction.notes
  }
}


// // ── GET /api/transactions/export  (must be BEFORE /:id) ───────────
// router.get("/export", (req, res) => {
//   try {
//     if (!fs.existsSync(CSV_PATH)) {
//       return res.status(404).json({ success: false, message: "No transactions yet." });
//     }
//     const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     fs.createReadStream(CSV_PATH).pipe(res);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to export." });
//   }
// });

// ── GET /api/transactions ─────────────────────────────────────────
router.get("/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    const rows = await readAll(filename);
    const transactions = rows.map((r) => (transactionData(r)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to read transactions." });
  }
});

// ── POST /api/transactions ────────────────────────────────────────
router.post("/:filename", async (req, res) => {
  try {
    const {filename} =req.params;
    const { date, description, amount, category, method, taxReturnable, people, notes } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    // Validate participant totals if participants are provided
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
      participants: serializeParticipants(people),
      notes: notes || "",
    };

    appendOne(filename,transaction);
    res.json({
      success: true,
      data: transactionData(transaction),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save transaction." });
  }
});

// ── DELETE /api/transactions/:id ──────────────────────────────────
router.delete("/:filename/:id", async (req, res) => {
  try {
    const { filename,id } = req.params;
    const rows = await readAll(filename);
    const filtered = rows.filter((r) => r.id !== id);

    if (filtered.length === rows.length) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    writeAll(filename,filtered);
    res.json({ success: true, message: "Transaction deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete transaction." });
  }
});


router.put("/:filename/:id", async (req, res) => {
  try {
    const { id, filename } = req.params;
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
 
    const rows = await readAll(filename);
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
      participants: serializeParticipants(people),
      notes: notes || "",
    };
    
 
    rows[index] = updated;
    writeAll(filename,rows);
 
    res.json({
      success: true,
      data: transactionData(updated),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update transaction." });
  }
});
module.exports = router;