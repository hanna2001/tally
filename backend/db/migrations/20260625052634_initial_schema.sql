-- migrate:up
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
  owes          REAL NOT NULL DEFAULT 0,
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

-- migrate:down
DROP TABLE IF EXISTS budget_categories;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS sheets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS payment_methods;