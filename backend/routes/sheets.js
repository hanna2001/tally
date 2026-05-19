const express = require("express");
const fs = require("fs");
const path = require("path")
const router = express.Router();

// Directory where CSV files are stored
const SHEETS_DIR = path.resolve("data");

// Ensure the sheets directory exists
if (!fs.existsSync(SHEETS_DIR)) {
  fs.mkdirSync(SHEETS_DIR, { recursive: true });
}

function sheetPath(name) {
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9_\-]/g, "_");
  return path.join(SHEETS_DIR, `${safeName}.csv`);
}

router.post("/", (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Sheet name is required." });
    }

    const filePath = sheetPath(name);
    

    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: `Sheet "${name}" already exists.` });
    }

    fs.writeFileSync(filePath, "utf8");

    return res.status(201).json({
      message: `Sheet "${name}" created successfully.`,
      name,
      path: filePath
    });
  } catch (err) {
    console.error("POST /sheets error:", err);
    return res.status(500).json({ error: "Failed to create sheet.", detail: err.message });
  }
});

router.get("/", (_req, res) => {
  try {
    const files = fs.readdirSync(SHEETS_DIR).filter((f) => f.endsWith(".csv"));

    const sheets = files.map((file) => {
      const name = path.basename(file, ".csv");
      const stat = fs.statSync(path.join(SHEETS_DIR, file));
      return {
        name
      };
    });

    return res.json({ sheets, total: sheets.length });
  } catch (err) {
    console.error("GET /sheets error:", err);
    return res.status(500).json({ error: "Failed to list sheets.", detail: err.message });
  }
});

router.delete("/:name", (req, res) => {
  try {
    const { name } = req.params;
    const filePath = sheetPath(name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Sheet "${name}" not found.` });
    }

    fs.unlinkSync(filePath);

    return res.json({ message: `Sheet "${name}" deleted successfully.`, name });
  } catch (err) {
    console.error("DELETE /sheets/:name error:", err);
    return res.status(500).json({ error: "Failed to delete sheet.", detail: err.message });
  }
});

module.exports = router;