-- migrate:up
ALTER TABLE transactions ADD COLUMN personal REAL;
ALTER TABLE transactions ADD COLUMN effective_amount REAL;
ALTER TABLE participants ADD COLUMN paid INTEGER DEFAULT 0;

-- Backfill personal: amount minus what others owe
UPDATE transactions
SET personal = (
  SELECT t.amount - COALESCE(
    (SELECT SUM(p.owes)
     FROM participants p
     WHERE p.transactionId = t.id
     AND p.name != 'You'),
  0)
  FROM transactions t
  WHERE t.id = transactions.id
);

-- Backfill effective_amount: personal + unpaid others
UPDATE transactions
SET effective_amount = (
  SELECT t.personal + COALESCE(
    (SELECT SUM(p.owes)
     FROM participants p
     WHERE p.transactionId = t.id
     AND p.name != 'You'
     AND p.paid = 0),
  0)
  FROM transactions t
  WHERE t.id = transactions.id
);

-- Remove all You entries from participants
DELETE FROM participants WHERE name = 'You';

-- migrate:down