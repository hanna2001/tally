const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/sheets";

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    
    throw new Error(json.error ?? json.message ?? `Request failed: ${res.status}`);
  }
  return json.data ?? json;
}

// ── Create a new sheet (new CSV file) ────────────────────────────
export async function createSheet(data) {
  
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── List all sheets ───────────────────────────────────────────────
export async function listSheets() {
  const res = await fetch(`${BASE_URL}`);
  return handleResponse(res);
}

// ── Get budget of a sheet ───────────────────────────────────────────────
export async function getBudget(sheetID) {
  const res = await fetch(`${BASE_URL}/${sheetID}/budget`);
  return handleResponse(res);
}


// ── Delete a sheet ────────────────────────────────────────────────
export async function deleteSheet(name) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}