const Database = require("better-sqlite3");
const path = require("path");
const { randomUUID } = require("crypto");

const db = new Database(path.join(__dirname, "../data/database.db"));
db.pragma("foreign_keys = ON");

// ── Helpers ──────────────────────────────────────────────────────

function getSheetId(name) {
  const sheet = db.prepare("SELECT id FROM sheets WHERE name = ?").get(name);
  if (!sheet) throw Object.assign(new Error(`Sheet "${name}" not found.`), { code: 404 });
  return sheet.id;
}


function getParticipants(transactionId) {
  return db.prepare("SELECT id, name, owes, paid, personId FROM participants WHERE transactionId = ?").all(transactionId);
}

function updateEffectiveAmount(transactionId) {
  const t = db.prepare("SELECT personal FROM transactions WHERE id = ?").get(transactionId);
  const { unpaidOwes } = db.prepare(`
    SELECT COALESCE(SUM(owes), 0) as unpaidOwes
    FROM participants
    WHERE transactionId = ? AND paid = 0
  `).get(transactionId);

  db.prepare("UPDATE transactions SET effective_amount = ? WHERE id = ?")
    .run(t.personal + unpaidOwes, transactionId);
}

// ── Transaction functions ─────────────────────────────────────────

function readOne(id) {
  const t = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
  if (!t) throw Object.assign(new Error("Transaction not found."), { code: 404 });
  return { ...t, participants: getParticipants(t.id) };
}


function readAll(sheetId, page = 1, limit = 20, filters = {}) {
  const { category, search, paymentMethod } = filters;

  const conditions = ["t.sheetId = ?"];
  const params = [sheetId];

  if (category) {
    conditions.push("t.category = ?");
    params.push(category);
  }

  if (paymentMethod) {
    conditions.push("pm.name = ?");
    params.push(paymentMethod);
  }

  if (search) {
    conditions.push("t.description LIKE ?");
    params.push(`%${search}%`);
  }

  const where = conditions.join(" AND ");
  const offset = (page - 1) * limit;

  const transactions = db.prepare(`
    SELECT t.* FROM transactions t
    LEFT JOIN payment_methods pm ON pm.id = t.paymentMethodId
    WHERE ${where}
    ORDER BY t.date DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const { total } = db.prepare(`
    SELECT COUNT(*) as total FROM transactions t
    LEFT JOIN payment_methods pm ON pm.id = t.paymentMethodId
    WHERE ${where}
  `).get(...params);

  return {
    data: transactions.map(t => ({
      ...t,
      participants: getParticipants(t.id),
    })),
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    }
  };
}

function getBudgetSummary(sheetId) {
  const sheet = db.prepare(`SELECT totalBudget, budgetEnabled FROM sheets WHERE id = ?`).get(sheetId);

  const { totalSpent } = db.prepare(`
    SELECT COALESCE(SUM(effective_amount), 0) as totalSpent FROM transactions WHERE sheetId = ?
  `).get(sheetId);

  const categories = db.prepare(`
    SELECT
      bc.id, bc.name, bc.categoryId, bc.limitAmount,
      COALESCE(SUM(t.effective_amount), 0) as spent
    FROM budget_categories bc
    LEFT JOIN transactions t
      ON t.sheetId = bc.sheetId
      AND (t.categoryId = bc.categoryId OR t.category = bc.name)
    WHERE bc.sheetId = ?
    GROUP BY bc.id
    ORDER BY spent DESC
  `).all(sheetId);

  const transactionCategories = db.prepare(`
    SELECT category as name, COALESCE(SUM(effective_amount), 0) as spent
    FROM transactions
    WHERE sheetId = ? AND category != ''
    GROUP BY category
    ORDER BY spent DESC
  `).all(sheetId);

  const { returns } = db.prepare(`
    SELECT COALESCE(SUM(p.owes), 0) as returns
    FROM participants p
    JOIN transactions t ON p.transactionId = t.id
    WHERE t.sheetId = ? AND p.paid = 0 AND p.owes > 0
  `).get(sheetId);

  const { owes } = db.prepare(`
    SELECT COALESCE(SUM(p.owes), 0) as owes
    FROM participants p
    JOIN transactions t ON p.transactionId = t.id
    WHERE t.sheetId = ? AND p.owes < 0
  `).get(sheetId);

  const totalBudget = sheet?.totalBudget || 0;

  const payment = getPaymentMethodSummary(sheetId)
  console.log(payment);
  

  return {
    totalSpent,
    totalBudget,
    budgetEnabled: sheet?.budgetEnabled === 1,
    remaining: totalBudget - totalSpent,
    returns,
    owes,
    categories: categories.map(c => ({
      ...c,
      pct: c.limitAmount > 0 ? (c.spent / c.limitAmount) * 100 : 0,
    })),
    transactionCategories,
    paymentMethods: getPaymentMethodSummary(sheetId),
  };
}

function getPaymentMethodSummary(sheetId) {
  return db.prepare(`
    SELECT pm.name, COALESCE(SUM(t.amount), 0) as total
    FROM transactions t
    JOIN payment_methods pm ON pm.id = t.paymentMethodId
    WHERE t.sheetId = ?
    GROUP BY pm.id
    ORDER BY total DESC
  `).all(sheetId);
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

function appendOne(sheetId, transaction) {
  const personal = parseFloat(transaction.personal);
  const unpaidOwes = transaction.people
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + parseFloat(p.owes), 0);

  const insert = db.transaction(() => {
    db.prepare(`
      INSERT INTO transactions 
        (id, sheetId, createdAt, date, description, amount, personal, effective_amount, category, method, taxReturnable, notes, categoryId, paymentMethodId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction.id, sheetId, transaction.createdAt,
      transaction.date, transaction.description || "",
      parseFloat(transaction.amount),
      personal,
      personal + unpaidOwes,
      transaction.category || "",
      transaction.method || "",
      transaction.taxReturnable === "yes" ? 1 : 0,
      transaction.notes || "",
      transaction.categoryId || null,
      transaction.paymentMethodId || null
    );

    for (const p of transaction.people) {
      db.prepare(`INSERT INTO participants (id, transactionId, name, owes, paid, personId) VALUES (?, ?, ?, ?, ?, ?)`)
     .run(randomUUID(), transaction.id, p.name, parseFloat(p.owes), p.paid ? 1 : 0, p.id || null);
    }
  });
  insert();
}

function updateOne(id, transaction) {
  const personal = parseFloat(transaction.personal);
  const unpaidOwes = transaction.people
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + parseFloat(p.owes), 0);

  const update = db.transaction(() => {
    db.prepare(`
      UPDATE transactions SET
        date = ?, description = ?, amount = ?, personal = ?, effective_amount = ?,
        category = ?, method = ?, taxReturnable = ?, notes = ?, categoryId = ?, paymentMethodId = ?
      WHERE id = ?
    `).run(
      transaction.date,
      transaction.description || "",
      parseFloat(transaction.amount),
      personal,
      personal + unpaidOwes,
      transaction.category || "",
      transaction.method || "",
      transaction.taxReturnable === "yes" ? 1 : 0,
      transaction.notes || "",
      transaction.categoryId || "",
      transaction.paymentMethodId || "",
      id
    );

    db.prepare("DELETE FROM participants WHERE transactionId = ?").run(id);
    for (const p of transaction.people) {
      db.prepare(`INSERT INTO participants (id, transactionId, name, owes, paid, personId) VALUES (?, ?, ?, ?, ?, ?)`)
  .run(randomUUID(), id, p.name, parseFloat(p.owes), p.paid ? 1 : 0, p.personId || null);
    }
  });
  update();
}

function deleteOne(id) {
  const result = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  if (result.changes === 0) throw Object.assign(new Error("Transaction not found."), { code: 404 });
}

function togglePaid(participantId, paid) {
  db.prepare("UPDATE participants SET paid = ? WHERE id = ?").run(paid ? 1 : 0, participantId);
  const { transactionId } = db.prepare("SELECT transactionId FROM participants WHERE id = ?").get(participantId);
  updateEffectiveAmount(transactionId);
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
  readAll, appendOne, updateOne, deleteOne, readOne, getBudgetSummary,
  togglePaid,
  createSheet, listSheets, deleteSheet,
  listCategories, createCategory, updateCategory, deleteCategory,
  listPeople, createPerson, updatePerson, deletePerson,
  listPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  createBudgetCategories, getBudgetCategories,
  totalTransactionAmout,
};