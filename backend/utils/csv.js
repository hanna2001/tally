// utils/csv.js
// Low-level read/write for transactions.csv
// Swap this file out entirely if you move to a real DB later.

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CSV_PATH = path.join(__dirname, "..", "data");

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
function ensureFile(file_path) {
  const dir = path.dirname(file_path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file_path) || fs.readFileSync(file_path, "utf8").trim() === "") {
    fs.writeFileSync(file_path, HEADERS.join(",") + "\r\n", "utf8");
  }
}

/** Read all transactions from CSV → array of objects */
async function readAll(filename) {
  const file_path = path.join(CSV_PATH,`${filename}.csv`)
  ensureFile(file_path);
  return new Promise((resolve, reject) => {
    const rows = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(file_path),
      crlfDelay: Infinity,
    });
 
    const headerLine = HEADERS.join(",");
    rl.on("line", (line) => {
      if (!line.trim()) return;
      if (line.trim() === headerLine) return; 
      rows.push(lineToRow(parseLine(line)));
    });
 
    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });
}

/** Append a single transaction row to the CSV */
function appendOne(filename,transaction) {
  const file_path = path.join(CSV_PATH,`${filename}.csv`)
  ensureFile(file_path);
  const line = rowToLine(transaction) + "\r\n";
  fs.appendFileSync(file_path, line, "utf8");
}

/** Rewrite the entire CSV (used for delete / update) */
function writeAll(filename,transactions) {
  const file_path = path.join(CSV_PATH,`${filename}.csv`)
  ensureFile(file_path);
  const lines = [HEADERS.join(","), ...transactions.map(rowToLine)];
  fs.writeFileSync(file_path, lines.join("\r\n") + "\r\n", "utf8");
}

module.exports = { readAll, appendOne, writeAll };