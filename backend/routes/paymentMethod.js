const express = require("express");
const { listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = require("../utils/db");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.json({ success: true, data: listPaymentMethods() });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, detail, badge, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const method = createPaymentMethod({ name: name.trim(), detail, badge, notes });
    res.status(201).json({ success: true, data: method });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { name, detail, badge, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const method = updatePaymentMethod(req.params.id, { name: name.trim(), detail, badge, notes });
    res.json({ success: true, data: method });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    deletePaymentMethod(req.params.id);
    res.json({ success: true, message: "Payment method deleted." });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;