const Database = require("better-sqlite3");
const path = require("path");
const { randomUUID } = require("crypto");

const db = new Database(path.join(__dirname, "../data/database.db"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS sheets (
    id            TEXT PRIMARY KEY,
    name          TEXT UNIQUE NOT NULL,
    type          TEXT DEFAULT 'monthly',
    budgetEnabled INTEGER DEFAULT 0,
    totalBudget   REAL DEFAULT 0,
    startDate     TEXT,
    endDate       TEXT,
    createdAt     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id              TEXT PRIMARY KEY,
    sheetId         TEXT NOT NULL,
    createdAt       TEXT NOT NULL,
    date            TEXT NOT NULL,
    description     TEXT DEFAULT '',
    amount          REAL NOT NULL,
    category        TEXT DEFAULT '',
    method          TEXT DEFAULT '',
    taxReturnable   INTEGER DEFAULT 0,
    notes           TEXT DEFAULT '',
    categoryId      TEXT,
    paymentMethodId TEXT,
    FOREIGN KEY (sheetId) REFERENCES sheets(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (paymentMethodId) REFERENCES payment_methods(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id            TEXT PRIMARY KEY,
    transactionId TEXT NOT NULL,
    name          TEXT NOT NULL,
    owes          REAL NOT NULL  DEFAULT 0,
    personId      TEXT,
    FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (personId) REFERENCES people(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id        TEXT PRIMARY KEY,
    name      TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS people (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    role      TEXT DEFAULT 'Contributor',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_methods (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    detail    TEXT DEFAULT '',
    badge     TEXT DEFAULT '',
    notes     TEXT DEFAULT '',
    createdAt TEXT NOT NULL
  );


  CREATE TABLE IF NOT EXISTS budget_categories (
    id          TEXT PRIMARY KEY,
    sheetId     TEXT NOT NULL,
    categoryId  TEXT,
    name        TEXT NOT NULL,
    limitAmount REAL NOT NULL DEFAULT 0,
    createdAt   TEXT NOT NULL,
    FOREIGN KEY (sheetId) REFERENCES sheets(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
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

function totalTransactionAmout() {
  const total_amount = db.prepare(`
    SELECT SUM(amount) as total FROM transactions 
  `).get();

  const owed_amount = db.prepare(`
    SELECT COALESCE(SUM(p.owes), 0) as total
    FROM participants p
    WHERE p.name != 'You'
    AND p.owes > 0
  `).get();

  const owes_amount = db.prepare(`
    SELECT COALESCE(SUM(p.owes), 0) as total
    FROM participants p
    WHERE p.name != 'You'
    AND p.owes < 0
  `).get();

  return {
    total_amount:total_amount.total,
    owed_amount:owed_amount.total,
    owes_amount:owes_amount.total
  };
}

function appendOne(sheetName, transaction) {
  const sheetId = getSheetId(sheetName);

  const insert = db.transaction(() => {
    db.prepare(`
      INSERT INTO transactions (id, sheetId, createdAt, date, description, amount, category, method, taxReturnable, notes, categoryId, paymentMethodId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      transaction.notes || "",
      transaction.categoryId || "",
      transaction.paymentMethodId || ""
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

function createSheet(name, options = {}) {

  const existing = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (existing) throw Object.assign(new Error(`Sheet "${name}" already exists.`), { code: 409 });
  const id = randomUUID();
  db.prepare(`
    INSERT INTO sheets (id, name, type, budgetEnabled, totalBudget, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id, name,
    options.type || "monthly",
    options.budgetEnabled || 0,
    options.totalBudget || 0,
    new Date().toISOString()
  );
  return { id, name, type: options.type || "monthly" };
}

function createBudgetCategories(sheetId, categories) {
  const insert = db.prepare(`
    INSERT INTO budget_categories (id, sheetId, categoryId, name, limitAmount, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertAll = db.transaction((cats) => {
    for (const cat of cats) {
      insert.run(
        randomUUID(), sheetId,
        cat.id || null,      // categoryId — foreign key
        cat.name,            // name — kept as readable fallback - TODO:w1
        parseFloat(cat.limit) || 0,
        new Date().toISOString()
      );
    }
  });
  insertAll(categories);
}

function getBudgetCategories(sheetId) {
  return db.prepare(`
    SELECT bc.*
    FROM budget_categories bc
    LEFT JOIN categories c ON c.id = bc.categoryId
    WHERE bc.sheetId = ?
    ORDER BY bc.createdAt ASC
  `).all(sheetId);
}


function listSheets() {
  return db.prepare("SELECT * FROM sheets ORDER BY createdAt ASC").all();
}

function deleteSheet(name) {
  const sheet = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (!sheet) throw Object.assign(new Error(`Sheet "${name}" not found.`), { code: 404 });
  db.prepare("DELETE FROM sheets WHERE name = ?").run(name);
}


// ── Categories ────────────────────────────────────────────────────

function listCategories() {
  return db.prepare("SELECT * FROM categories ORDER BY createdAt ASC").all();
}

function createCategory(name) {
  const existing = db.prepare("SELECT id FROM categories WHERE name = ?").get(name);
  if (existing) throw Object.assign(new Error(`Category "${name}" already exists.`), { code: 409 });
  const id = randomUUID();
  db.prepare("INSERT INTO categories (id, name, createdAt) VALUES (?, ?, ?)").run(id, name, new Date().toISOString());
  return { id, name };
}

function updateCategory(id, name) {
  const result = db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
  if (result.changes === 0) throw Object.assign(new Error("Category not found."), { code: 404 });
  return { id, name };
}

function deleteCategory(id) {
  const result = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  if (result.changes === 0) throw Object.assign(new Error("Category not found."), { code: 404 });
}

// ── People ────────────────────────────────────────────────────────

function listPeople() {
  return db.prepare("SELECT * FROM people ORDER BY createdAt ASC").all();
}

function createPerson(name, role = "Contributor") {
  const id = randomUUID();
  db.prepare("INSERT INTO people (id, name, role, createdAt) VALUES (?, ?, ?, ?)").run(id, name, role, new Date().toISOString());
  return { id, name, role };
}

function updatePerson(id, name, role) {
  const result = db.prepare("UPDATE people SET name = ?, role = ? WHERE id = ?").run(name, role, id);
  if (result.changes === 0) throw Object.assign(new Error("Person not found."), { code: 404 });
  return { id, name, role };
}

function deletePerson(id) {
  const result = db.prepare("DELETE FROM people WHERE id = ?").run(id);
  if (result.changes === 0) throw Object.assign(new Error("Person not found."), { code: 404 });
}

// ── Payment Methods ───────────────────────────────────────────────

function listPaymentMethods() {
  return db.prepare("SELECT * FROM payment_methods ORDER BY createdAt ASC").all();
}

function createPaymentMethod({ name, detail, badge, notes }) {
  const existing = db.prepare("SELECT id FROM payment_methods WHERE name = ?").get(name);
  if (existing) throw Object.assign(new Error(`Payment method "${name}" already exists.`), { code: 409 });
  const id = randomUUID();
  db.prepare("INSERT INTO payment_methods (id, name, detail, badge, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run(
    id, name, detail || "", badge || "", notes || "", new Date().toISOString()
  );
  return { id, name, detail, badge, notes };
}

function updatePaymentMethod(id, { name, detail, badge, notes }) {
  const result = db.prepare("UPDATE payment_methods SET name = ?, detail = ?, badge = ?, notes = ? WHERE id = ?")
    .run(name, detail || "", badge || "", notes || "", id);
  if (result.changes === 0) throw Object.assign(new Error("Payment method not found."), { code: 404 });
  return { id, name, detail, badge, notes };
}

function deletePaymentMethod(id) {
  const result = db.prepare("DELETE FROM payment_methods WHERE id = ?").run(id);
  if (result.changes === 0) throw Object.assign(new Error("Payment method not found."), { code: 404 });
}



module.exports = {
  readAll, appendOne, updateOne, deleteOne,
  createSheet, listSheets, deleteSheet,
  listCategories, createCategory, updateCategory, deleteCategory,
  listPeople, createPerson, updatePerson, deletePerson,
  listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  createBudgetCategories, getBudgetCategories,
  totalTransactionAmout,
};