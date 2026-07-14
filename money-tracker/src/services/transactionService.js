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

export async function loadTransactions(sheetId, page = 1, limit = 20, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);
  if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);

  const res = await fetch(`${BASE_URL}/${sheetId}?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return { data: json.data, pagination: json.pagination };
}

export async function saveTransaction(sheetId, formData) {
  console.log(sheetId);
  
  const res = await fetch(`${BASE_URL}/${sheetId}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}

export async function deleteTransaction(sheetId, id) {
  const res = await fetch(`${BASE_URL}/${sheetId}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function updateTransaction(sheetId, id, formData) {
  const res = await fetch(`${BASE_URL}/${sheetId}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
}

export async function getBudgetSummary(sheetId) {
  const res = await fetch(`${BASE_URL}/${sheetId}/budget-summary`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

export async function togglePaid(sheetId, transactionId, participantId, paid) {
  const res = await fetch(`${BASE_URL}/${sheetId}/${transactionId}/participants/${participantId}/paid`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paid }),
  });
  return handleResponse(res);
}

// ── Download CSV export ───────────────────────────────────────────
export function exportToCsv() {
  // Opens the export endpoint — browser handles the download prompt
  window.open(`${BASE_URL}/export`, "_blank");
}

