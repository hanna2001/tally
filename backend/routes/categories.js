const express = require("express");
const { listCategories, createCategory, updateCategory, deleteCategory } = require("../utils/db");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.json({ success: true, data: listCategories() });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const category = createCategory(name.trim());
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const category = updateCategory(req.params.id, name.trim());
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", (req, res) => {
    // ux1
  try {
    deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted." });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;