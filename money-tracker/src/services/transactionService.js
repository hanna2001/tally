// src/services/transactionService.js
//
// ─────────────────────────────────────────────────────────────────
// ALL backend communication lives here.
// The component never calls fetch() directly.
//
// When you move to a different backend (different URL, auth headers,
// GraphQL, etc.) — change only this file.
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/transactions";

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }
  return json.data ?? json;
}

// ── Get all transaction amount ────────────────────────────────────────
export async function getTransactionAmount() {
  const res = await fetch(`${BASE_URL}/`);
  return handleResponse(res);
}

// ── Save a new transaction ────────────────────────────────────────
export async function saveTransaction(filename,formData) {

  
  const res = await fetch(`${BASE_URL}/${filename}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}

// ── Load all transactions ─────────────────────────────────────────
export async function loadTransactions(filename) {
  const res = await fetch(`${BASE_URL}/${filename}/`);
  return handleResponse(res);
}

// ── Delete a transaction by id ────────────────────────────────────
export async function deleteTransaction(filename,id) {
  const res = await fetch(`${BASE_URL}/${filename}/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// ── Download CSV export ───────────────────────────────────────────
export function exportToCsv() {
  // Opens the export endpoint — browser handles the download prompt
  window.open(`${BASE_URL}/export`, "_blank");
}

export async function updateTransaction(filename,id, formData) {
  const res = await fetch(`${BASE_URL}/${filename}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}