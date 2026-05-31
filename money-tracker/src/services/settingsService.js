const BASE_URL = import.meta.env.VITE_API_URL
  ?? "http://localhost:4000/api";

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Request failed: ${res.status}`);
  return json.data ?? json;
}

// ── Categories ────────────────────────────────────────────────────
export async function listCategories() {
  return handleResponse(await fetch(`${BASE_URL}/categories`));
}

export async function createCategory(name) {
  return handleResponse(await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }));
}

export async function updateCategory(id, name) {
  return handleResponse(await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }));
}

export async function deleteCategory(id) {
  return handleResponse(await fetch(`${BASE_URL}/categories/${id}`, { method: "DELETE" }));
}

// ── People ────────────────────────────────────────────────────────
export async function listPeople() {
  return handleResponse(await fetch(`${BASE_URL}/people`));
}

export async function createPerson(name, role = "Contributor") {
  return handleResponse(await fetch(`${BASE_URL}/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  }));
}

export async function updatePerson(id, name, role) {
  return handleResponse(await fetch(`${BASE_URL}/people/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  }));
}

export async function deletePerson(id) {
  return handleResponse(await fetch(`${BASE_URL}/people/${id}`, { method: "DELETE" }));
}

// ── Payment Methods ───────────────────────────────────────────────
export async function listPaymentMethods() {
  return handleResponse(await fetch(`${BASE_URL}/payment-methods`));
}

export async function createPaymentMethod({ name, detail, badge, notes }) {
  return handleResponse(await fetch(`${BASE_URL}/payment-methods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, detail, badge, notes }),
  }));
}

export async function updatePaymentMethod(id, { name, detail, badge, notes }) {
  return handleResponse(await fetch(`${BASE_URL}/payment-methods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, detail, badge, notes }),
  }));
}

export async function deletePaymentMethod(id) {
  return handleResponse(await fetch(`${BASE_URL}/payment-methods/${id}`, { method: "DELETE" }));
}