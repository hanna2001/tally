// utils/csv.js
// Low-level read/write for transactions.csv
// Swap this file out entirely if you move to a real DB later.

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CSV_PATH = path.join(__dirname, "..", "data", "transactions.csv");

const HEADERS = [
  "id",
  "createdAt",
  "date",
  "description",
  "amount",
  "category",
  "method",
  "taxReturnable",
  "participants", // stored as "Name:amount|Name:amount"
  "notes",
];

// ── Helpers ──────────────────────────────────────────────────────

/** Escape a value for CSV */
function escape(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Parse one CSV line respecting quoted fields */
function parseLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/** Convert a plain object row → CSV line */
function rowToLine(obj) {
  return HEADERS.map((h) => escape(obj[h] ?? "")).join(",");
}

/** Convert a CSV values array → plain object */
function lineToRow(values) {
  return Object.fromEntries(HEADERS.map((h, i) => [h, (values[i] ?? "").trim()]));
}

// ── Public API ────────────────────────────────────────────────────

/** Ensure the CSV file + data directory exist, write headers if new */
function ensureFile() {
  const dir = path.dirname(CSV_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CSV_PATH) || fs.readFileSync(CSV_PATH, "utf8").trim() === "") {
    fs.writeFileSync(CSV_PATH, HEADERS.join(",") + "\r\n", "utf8");
  }
}

/** Read all transactions from CSV → array of objects */
async function readAll() {
  ensureFile();
  return new Promise((resolve, reject) => {
    const rows = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(CSV_PATH),
      crlfDelay: Infinity,
    });
 
    const headerLine = HEADERS.join(",");
    rl.on("line", (line) => {
      if (!line.trim()) return;
      if (line.trim() === headerLine) return; // CHANGES: skip ALL header-looking rows, not just the first — fixes duplicate header treated as data row
      rows.push(lineToRow(parseLine(line)));
    });
 
    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });
}

/** Append a single transaction row to the CSV */
function appendOne(transaction) {
  ensureFile();
  const line = rowToLine(transaction) + "\r\n";
  fs.appendFileSync(CSV_PATH, line, "utf8");
}

/** Rewrite the entire CSV (used for delete / update) */
function writeAll(transactions) {
  ensureFile();
  const lines = [HEADERS.join(","), ...transactions.map(rowToLine)];
  fs.writeFileSync(CSV_PATH, lines.join("\r\n") + "\r\n", "utf8");
}

module.exports = { readAll, appendOne, writeAll, CSV_PATH };