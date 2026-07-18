import { useState } from "react";
import { deleteTransaction, togglePaid } from "../services/transactionService";
import RecordTransaction from "./AddTransactionModal";

// ── Icons ─────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Category badge colors ─────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  food:     { bg: "#fef3c7", text: "#92400e" },
  dining:   { bg: "#fef3c7", text: "#92400e" },
  lunch:    { bg: "#fef3c7", text: "#92400e" },
  travel:   { bg: "#dbeafe", text: "#1e40af" },
  home:     { bg: "#d1fae5", text: "#065f46" },
  bills:    { bg: "#d1fae5", text: "#065f46" },
  shopping: { bg: "#ede9fe", text: "#5b21b6" },
  personal: { bg: "#f3f4f6", text: "#374151" },
};

function getCategoryColor(name = "") {
  const key = name.toLowerCase();
  for (const k in CATEGORY_COLORS) {
    if (key.includes(k)) return CATEGORY_COLORS[k];
  }
  return { bg: "#f5f0eb", text: "#8C5A3C" };
}

// ── Main Component ────────────────────────────────────────────────
export default function TransactionTable({
  sheetname, sheetId, transactions, setTransactions, setModal,
  pagination, page, setPage, filters, onFilterChange, summary, onMutated,
}) {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [extraCategories, setExtraCategories] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState(null);
  const [extraPaymentMethods, setExtraPaymentMethods] = useState([]);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [filterMode, setFilterMode] = useState<"category" | "method">("category");

  // top 3 from summary + any extras added by user
  const top3 = (summary?.transactionCategories || []).slice(0, 3).map(c => c.name);
  const filterTabs = [...new Set([...top3, ...extraCategories])];
  const allCategories = (summary?.transactionCategories || []).map(c => c.name);
  const pickerOptions = allCategories.filter(c => !filterTabs.includes(c));


  const top3Methods = (summary?.paymentMethods || []).slice(0, 3).map(m => m.name);
  const methodTabs = [...new Set([...top3Methods, ...extraPaymentMethods])];
  const allMethods = (summary?.paymentMethods || []).map(m => m.name);
  const methodPickerOptions = allMethods.filter(m => !methodTabs.includes(m));

  const handleSearch = (val: string) => {
    setSearch(val);
    onFilterChange({ ...filters, search: val || null });
  };

  const handleCategoryFilter = (cat: string | null) => {
    setActiveCategory(cat);
    onFilterChange({ ...filters, category: cat, paymentMethod: activePaymentMethod }); // why need this? no difference
  };

  const handleMethodFilter = (method: string | null) => {
    setActivePaymentMethod(method);
    onFilterChange({ ...filters, paymentMethod: method, category: activeCategory });
  };

  const handleAddCategory = (cat: string) => {
    setExtraCategories(prev => [...prev, cat]);
    setShowCategoryPicker(false);
    handleCategoryFilter(cat);
  };

  const handleAddMethod = (method: string) => {
    setExtraPaymentMethods(prev => [...prev, method]);
    setShowMethodPicker(false);
    handleMethodFilter(method);
};

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      setDeletingId(id);
      await deleteTransaction(sheetId, id);
      onMutated();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePaid = async (transactionId: string, participantId: string, paid: boolean) => {
    try {
      const updated = await togglePaid(sheetId, transactionId, participantId, paid);
      setTransactions((prev: any[]) =>
        prev.map((t) => String(t.id) === String(transactionId) ? { ...t, ...updated } : t)
      );
      onMutated();
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  };

  return (
    <div style={{ padding: "0 32px 32px" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1714", margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Transactions
        </h2>
        <button
          onClick={() => setModal(true)}
          style={{
            background: "#8C5A3C", color: "#fff", border: "none",
            borderRadius: 12, padding: "10px 20px", fontSize: 12,
            fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          + TRANSACTION
        </button>
      </div>

      {/* ── Search + Filter tabs ────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "14px 16px",
        border: "0.5px solid #e8e2db", marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        {/* Left — search + tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9a8f84" }}>
              <SearchIcon />
            </span>
            <input
              type="text" placeholder="Search transactions..." value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 20, border: "1px solid #e8e2db", fontSize: 13,
                background: "#faf7f4", color: "#1a1714", outline: "none", width: 200,
              }}
            />
          </div>

          {/* All button — clears both filters */}
          <button
            onClick={() => {
              setActiveCategory(null);
              setActivePaymentMethod(null);
              onFilterChange({ ...filters, category: null, paymentMethod: null });
            }}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "none",
              background: !activeCategory && !activePaymentMethod ? "#8C5A3C" : "#f5f0eb",
              color: !activeCategory && !activePaymentMethod ? "#fff" : "#8C5A3C",
            }}
          >
            All
          </button>

          {/* Active filter tabs — show whichever mode is selected */}
          {filterMode === "category" ? (
            <>
              {filterTabs.map(cat => (
                <button key={cat}
                  onClick={() => handleCategoryFilter(activeCategory === cat ? null : cat)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", border: "1px solid #e8e2db",
                    background: activeCategory === cat ? "#8C5A3C" : "#faf7f4",
                    color: activeCategory === cat ? "#fff" : "#5a4a3a",
                  }}
                >
                  {cat}
                </button>
              ))}
              {/* Add more */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowCategoryPicker(p => !p)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e2db",
                    background: "#faf7f4", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#9a8f84",
                  }}
                >
                  <FilterIcon />
                </button>
                {showCategoryPicker && pickerOptions.length > 0 && (
                  <div style={{
                    position: "absolute", top: 34, left: 0, background: "#fff",
                    border: "0.5px solid #e8e2db", borderRadius: 12, padding: 8,
                    zIndex: 10, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}>
                    {pickerOptions.map(cat => (
                      <button key={cat}
                        onClick={() => handleAddCategory(cat)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "7px 12px", fontSize: 13, background: "none",
                          border: "none", cursor: "pointer", color: "#1a1714", borderRadius: 8,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f0eb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {methodTabs.map(m => (
                <button key={m}
                  onClick={() => handleMethodFilter(activePaymentMethod === m ? null : m)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", border: "1px solid #e8e2db",
                    background: activePaymentMethod === m ? "#8C5A3C" : "#faf7f4",
                    color: activePaymentMethod === m ? "#fff" : "#5a4a3a",
                  }}
                >
                  {m}
                </button>
              ))}
              {/* Add more */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowMethodPicker(p => !p)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", border: "1px solid #e8e2db",
                    background: "#faf7f4", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#9a8f84",
                  }}
                >
                  <FilterIcon />
                </button>
                {showMethodPicker && methodPickerOptions.length > 0 && (
                  <div style={{
                    position: "absolute", top: 34, left: 0, background: "#fff",
                    border: "0.5px solid #e8e2db", borderRadius: 12, padding: 8,
                    zIndex: 10, minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}>
                    {methodPickerOptions.map(m => (
                      <button key={m}
                        onClick={() => handleAddMethod(m)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "7px 12px", fontSize: 13, background: "none",
                          border: "none", cursor: "pointer", color: "#1a1714", borderRadius: 8,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f0eb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right — BY CATEGORY | BY METHOD toggle */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          border: "1px solid #e8e2db", borderRadius: 20, overflow: "hidden", flexShrink: 0,
        }}>
          <button
            onClick={() => setFilterMode("category")}
            style={{
              padding: "6px 14px", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", border: "none", cursor: "pointer",
              background: filterMode === "category" ? "#f5f0eb" : "transparent",
              color: filterMode === "category" ? "#8C5A3C" : "#9a8f84",
              transition: "all 0.15s",
            }}
          >
            BY CATEGORY
          </button>
          <div style={{ width: 1, height: 20, background: "#e8e2db" }} />
          <button
            onClick={() => setFilterMode("method")}
            style={{
              padding: "6px 14px", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", border: "none", cursor: "pointer",
              background: filterMode === "method" ? "#f5f0eb" : "transparent",
              color: filterMode === "method" ? "#8C5A3C" : "#9a8f84",
              transition: "all 0.15s",
            }}
          >
            BY METHOD
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div style={{ background: "#faf7f4", borderRadius: 16, border: "0.5px solid #e8e2db", overflow: "hidden" }}>
        <div style={{ overflowY: "auto", maxHeight: 480 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #e8e2db" }}>
                {["Date", "Description", "Category", "Amount", "Return", "People", "Method", ""].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontSize: 10,
                    letterSpacing: "0.1em", color: "#9a8f84", fontWeight: 500,
                    textTransform: "uppercase", whiteSpace: "nowrap",
                    position: "sticky", top: 0, background: "#faf7f4", zIndex: 1,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => {
                const catColor = getCategoryColor(t.category);
                return (
                  <tr key={t.id} style={{ borderBottom: "0.5px solid #f0ebe3" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px", color: "#9a8f84", whiteSpace: "nowrap" }}>
                      {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 500, color: "#1a1714" }}>
                      {t.description || "-"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.category ? (
                        <span style={{
                          background: catColor.bg, color: catColor.text,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}>
                          {t.category}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1a1714" }}>
                      ₹{t.personal?.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px", color: t.returnAmount > 0 ? "#8C5A3C" : "#9a8f84" }}>
                      ₹{t.returnAmount?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.people?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {t.people.map((p: any) => (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12, color: p.paid ? "#9a8f84" : "#1a1714", textDecoration: p.paid ? "line-through" : "none" }}>
                                {p.name} (₹{p.owes})
                              </span>
                              <button
                                onClick={() => handleTogglePaid(t.id, p.id, !p.paid)}
                                style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                                  padding: "2px 6px", borderRadius: 4, border: "none",
                                  cursor: "pointer",
                                  background: p.paid ? "#dcfce7" : "#f3f4f6",
                                  color: p.paid ? "#16a34a" : "#9a8f84",
                                }}
                              >
                                {p.paid ? "PAID" : "MARK PAID"}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : <span style={{ color: "#d1cdc8" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#9a8f84" }}>
                      {t.method || "-"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => setEditingTransaction(t)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#C4894B", padding: 4 }}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, opacity: deletingId === t.id ? 0.4 : 1 }}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderTop: "0.5px solid #e8e2db",
          background: "#faf7f4",
        }}>
          <p style={{ fontSize: 11, color: "#9a8f84", margin: 0, letterSpacing: "0.05em" }}>
            SHOWING {((page - 1) * 20) + 1} TO {Math.min(page * 20, pagination.total)} OF {pagination.total} TRANSACTIONS
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p: number) => p - 1)}
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #e8e2db",
                background: "#fff", cursor: pagination.hasPrevPage ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: pagination.hasPrevPage ? "#1a1714" : "#d1cdc8",
              }}
            >
              <ChevronLeft />
            </button>

            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", border: "none",
                    fontSize: 12, fontWeight: page === p ? 700 : 400,
                    cursor: "pointer",
                    background: page === p ? "#8C5A3C" : "transparent",
                    color: page === p ? "#fff" : "#5a4a3a",
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p: number) => p + 1)}
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #e8e2db",
                background: "#fff", cursor: pagination.hasNextPage ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: pagination.hasNextPage ? "#1a1714" : "#d1cdc8",
              }}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────── */}
      {editingTransaction && (
        <RecordTransaction
          sheetName={sheetname}
          sheetId={sheetId}
          initialData={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={(updated: any) => {
            const normalized = {
              ...updated,
              amount: Number(updated.amount),
              personal: Number(updated.personal),
              returnAmount: Number(updated.returnAmount || 0),
              people: (updated.people || []).map((p: any) => ({
                ...p,
                owes: Number(p.owes),
              })),
            };
            setTransactions((prev: any[]) =>
              prev.map((t) =>
                String(t.id) === String(normalized.id) ? { ...t, ...normalized } : t
              )
            );
            setEditingTransaction(null);
            onMutated();
          }}
        />
      )}
    </div>
  );
}