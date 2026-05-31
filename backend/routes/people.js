const express = require("express");
const { listPeople, createPerson, updatePerson, deletePerson } = require("../utils/db");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.json({ success: true, data: listPeople() });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const person = createPerson(name.trim(), role || "Contributor");
    res.status(201).json({ success: true, data: person });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required." });
    const person = updatePerson(req.params.id, name.trim(), role || "Contributor");
    res.json({ success: true, data: person });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    deletePerson(req.params.id);
    res.json({ success: true, message: "Person deleted." });
  } catch (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  }
});

module.exports = router;