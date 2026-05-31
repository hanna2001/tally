const Database = require("better-sqlite3");
const path = require("path");
const { randomUUID } = require("crypto");

const db = new Database(path.join(__dirname, "../data/data.db"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS sheets (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    sheetId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT DEFAULT '',
    amount REAL NOT NULL,
    category TEXT DEFAULT '',
    method TEXT DEFAULT '',
    taxReturnable INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    FOREIGN KEY (sheetId) REFERENCES sheets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    transactionId TEXT NOT NULL,
    name TEXT NOT NULL,
    owes REAL NOT NULL,
    FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE
  );
`);

// ── Helpers ──────────────────────────────────────────────────────

function getSheetId(name) {
  const sheet = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (!sheet) throw Object.assign(new Error(`Sheet "${name}" not found.`), { code: 404 });
  return sheet.id;
}

function getParticipants(transactionId) {
  return db.prepare("SELECT name, owes FROM participants WHERE transactionId = ?").all(transactionId);
}

// ── Transaction functions ─────────────────────────────────────────

function readAll(sheetName) {
  const sheetId = getSheetId(sheetName);
  const transactions = db.prepare(`
    SELECT * FROM transactions WHERE sheetId = ? ORDER BY date ASC
  `).all(sheetId);

  return transactions.map(t => ({
    ...t,
    amount: t.amount,
    participants: getParticipants(t.id),  // array of {name, owes} directly
  }));
}

function transactionAmout() {
  
  const transactions = db.prepare(`
    SELECT SUM(amount) FROM transactions 
  `).all();

  return transactions.map(t => ({
    ...t,
    amount: t.amount,
    participants: getParticipants(t.id),  // array of {name, owes} directly
  }));
}

function appendOne(sheetName, transaction) {
  const sheetId = getSheetId(sheetName);

  const insert = db.transaction(() => {
    db.prepare(`
      INSERT INTO transactions (id, sheetId, createdAt, date, description, amount, category, method, taxReturnable, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction.id,
      sheetId,
      transaction.createdAt,
      transaction.date,
      transaction.description || "",
      parseFloat(transaction.amount),
      transaction.category || "",
      transaction.method || "",
      transaction.taxReturnable === "yes" ? 1 : 0,
      transaction.notes || ""
    );

    for (const p of (transaction.people || [])) {
      db.prepare(`
        INSERT INTO participants (id, transactionId, name, owes) VALUES (?, ?, ?, ?)
      `).run(randomUUID(), transaction.id, p.name, parseFloat(p.owes));
    }
  });

  insert();
}

function updateOne(id, transaction) {
  const update = db.transaction(() => {
    db.prepare(`
      UPDATE transactions SET
        date = ?, description = ?, amount = ?, category = ?,
        method = ?, taxReturnable = ?, notes = ?
      WHERE id = ?
    `).run(
      transaction.date,
      transaction.description || "",
      parseFloat(transaction.amount),
      transaction.category || "",
      transaction.method || "",
      transaction.taxReturnable === "yes" ? 1 : 0,
      transaction.notes || "",
      id
    );

    db.prepare("DELETE FROM participants WHERE transactionId = ?").run(id);
    for (const p of (transaction.people || [])) {
      db.prepare(`
        INSERT INTO participants (id, transactionId, name, owes) VALUES (?, ?, ?, ?)
      `).run(randomUUID(), id, p.name, parseFloat(p.owes));
    }
  });

  update();
}

function deleteOne(id) {
  const result = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  if (result.changes === 0) throw Object.assign(new Error("Transaction not found."), { code: 404 });
}



// ── Sheet functions ───────────────────────────────────────────────

function createSheet(name) {
  const existing = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (existing) throw Object.assign(new Error(`Sheet "${name}" already exists.`), { code: 409 });
  const id = randomUUID();
  db.prepare("INSERT INTO sheets (id, name, createdAt) VALUES (?, ?, ?)").run(
    id, name, new Date().toISOString()
  );
  return { id, name };
}

function listSheets() {
  return db.prepare("SELECT * FROM sheets ORDER BY createdAt ASC").all();
}

function deleteSheet(name) {
  const sheet = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (!sheet) throw Object.assign(new Error(`Sheet "${name}" not found.`), { code: 404 });
  db.prepare("DELETE FROM sheets WHERE name = ?").run(name);
}

module.exports = { readAll, appendOne, updateOne, deleteOne, transactionAmout, createSheet, listSheets, deleteSheet };