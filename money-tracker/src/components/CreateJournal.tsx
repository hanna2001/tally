import { useState,useEffect } from "react";

const ACCENT = "#8C5A3C";
const ACCENT_LIGHT = "#f5ede6";


// ── Icons ─────────────────────────────────────────────────────────
const MonthlyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TripIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);
const GrowthIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const EventIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const InvestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const BudgetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);

const TYPES = [
  { id: "monthly", label: "MONTHLY", icon: <MonthlyIcon /> },
  { id: "trips",   label: "TRIPS",   icon: <TripIcon /> },
  { id: "growth",  label: "GROWTH",  icon: <GrowthIcon /> },
  { id: "events",  label: "EVENTS",  icon: <EventIcon /> },
  { id: "invest",  label: "INVEST",  icon: <InvestIcon />, comingSoon: true },
];

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px", padding: "10px 14px",
  border: "1px solid #e8e2db", borderRadius: "10px",
  background: "#faf7f4", color: "#1a1714", outline: "none",
};

// ── Toggle ────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: "44px", height: "24px", borderRadius: "12px",
      background: on ? ACCENT : "#d4ccc4",
      cursor: "pointer", position: "relative",
      transition: "background 0.2s ease", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: "3px",
        left: on ? "23px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

// ── Coming Soon Toast ─────────────────────────────────────────────
function ComingSoonBadge({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
      transform: "translateX(-50%)",
      background: "#1a1714", color: "#fff",
      fontSize: "10px", fontWeight: 500, letterSpacing: "0.06em",
      padding: "4px 10px", borderRadius: "6px",
      whiteSpace: "nowrap", pointerEvents: "none",
      zIndex: 10,
    }}>
      COMING SOON
      <div style={{
        position: "absolute", top: "100%", left: "50%",
        transform: "translateX(-50%)",
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "5px solid #1a1714",
      }} />
    </div>
  );
}

// ── Page 1 ────────────────────────────────────────────────────────
function Page1({ name, setName, selectedType, setSelectedType, budgetEnabled, setBudgetEnabled, onSubmit, onClose }) {
  const [comingSoonType, setComingSoonType] = useState(null);

  const handleTypeClick = (type) => {
    if (type.comingSoon) {
      setComingSoonType(type.id);
      setTimeout(() => setComingSoonType(null), 2000);
      return;
    }
    setSelectedType(type.id);
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", color: "#9a8e84", letterSpacing: "0.1em", margin: "0 0 6px" }}>STEP 01 / {budgetEnabled ? "02" : "01"}</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 400, color: "#1a1714", margin: "0 0 6px" }}>
          Create a New Journal
        </h2>
        <p style={{ fontSize: "12px", color: "#9a8e84", margin: 0, lineHeight: 1.5 }}>
          Define the purpose of your editorial ledger.
        </p>
      </div>

      {/* Journal Name */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#9a8e84", display: "block", marginBottom: "8px" }}>
          JOURNAL NAME
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. European Summer 2024"
          style={inputStyle}
          autoFocus
        />
      </div>

      {/* Budget Type */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#9a8e84", display: "block", marginBottom: "10px" }}>
          BUDGET TYPE
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          {TYPES.map(type => (
            <div key={type.id} style={{ position: "relative", flex: 1 }}>
              <ComingSoonBadge visible={comingSoonType === type.id} />
              <button
                onClick={() => handleTypeClick(type)}
                style={{
                  width: "100%", padding: "10px 6px 8px",
                  border: selectedType === type.id
                    ? `1.5px solid ${ACCENT}`
                    : "1.5px solid #e8e2db",
                  borderRadius: "10px",
                  background: selectedType === type.id ? ACCENT_LIGHT : "#fff",
                  cursor: type.comingSoon ? "default" : "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "6px",
                  color: selectedType === type.id ? ACCENT : "#9a8e84",
                  opacity: type.comingSoon ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {type.icon}
                <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em" }}>{type.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: "12px",
        background: "#faf7f4", border: "1px solid #e8e2db",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: budgetEnabled ? ACCENT_LIGHT : "#f0ece8",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: budgetEnabled ? ACCENT : "#9a8e84",
          }}>
            <BudgetIcon />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714", margin: 0 }}>Enable Budget Tracking</p>
            <p style={{ fontSize: "11px", color: "#9a8e84", margin: 0 }}>Set limits and track spend progress.</p>
          </div>
        </div>
        <Toggle on={budgetEnabled} onChange={setBudgetEnabled} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "11px", background: "transparent",
          border: "1px solid #e8e2db", borderRadius: "10px",
          fontSize: "13px", fontWeight: 500, color: "#555",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Discard</button>
        <button
          onClick={onSubmit}
          disabled={!name.trim()}
          style={{
            flex: 2, padding: "11px",
            background: !name.trim() ? "#d4ccc4" : ACCENT,
            border: "none", borderRadius: "10px",
            fontSize: "13px", fontWeight: 500, color: "#fff",
            cursor: !name.trim() ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "background 0.15s",
          }}
        >
          {budgetEnabled ? "Next →" : "Create Journal"}
        </button>
      </div>
    </>
  );
}

// ── Page 2 ────────────────────────────────────────────────────────
function Page2({ totalBudget, setTotalBudget, budgetRows, setBudgetRows, onBack, onSubmit, saving, categories }) {

  const allocatedTotal = budgetRows.reduce((sum, r) => sum + (parseFloat(r.limit) || 0), 0);
  const total = parseFloat(totalBudget) || 0;
  const remaining = total - allocatedTotal;
  const isOver = allocatedTotal > total && total > 0;
  const isBalanced = total > 0 && Math.abs(remaining) < 0.01;

  const updateLimit = (name, value) => {
    const clean = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
    setBudgetRows(prev => prev.map(r => r.name === name ? { ...r, limit: clean } : r));
  };

  const removeRow = (name) => {
    setBudgetRows(prev => prev.filter(r => r.name !== name));
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", color: "#9a8e84", letterSpacing: "0.1em", margin: "0 0 6px" }}>STEP 02 / 02</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 400, color: "#1a1714", margin: "0 0 4px" }}>
          Budgeting Architecture
        </h2>
        <p style={{ fontSize: "12px", color: "#9a8e84", margin: 0 }}>Define your financial boundaries and allocation pools.</p>
      </div>

      {/* Total Budget */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#9a8e84", display: "block", marginBottom: "8px" }}>
          TOTAL BUDGET POOL
        </label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontSize: "14px", color: ACCENT, fontWeight: 600, pointerEvents: "none",
          }}>₹</span>
          <input
            value={totalBudget}
            onChange={e => setTotalBudget(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            style={{ ...inputStyle, paddingLeft: "30px", fontSize: "18px", fontWeight: 500 }}
            autoFocus
          />
        </div>
      </div>

      {/* Category Allocations */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#9a8e84", display: "block", marginBottom: "10px" }}>
          CATEGORY ALLOCATIONS
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
          {budgetRows.map(row => (
            <div key={row.name} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", background: "#faf7f4",
              border: "1px solid #e8e2db", borderRadius: "10px",
            }}>
              <span style={{ flex: 1, fontSize: "13px", color: "#1a1714", fontWeight: 500 }}>{row.name}</span>
              <span style={{ fontSize: "12px", color: "#9a8e84" }}>₹</span>
              <input
                value={row.limit}
                onChange={e => updateLimit(row.name, e.target.value)}
                placeholder="0"
                style={{
                  width: "80px", textAlign: "right",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", padding: "4px 8px",
                  border: "1px solid #e8e2db", borderRadius: "6px",
                  background: "#fff", color: "#1a1714", outline: "none",
                }}
              />
              <button onClick={() => removeRow(row.name)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#c4b8ae", padding: "2px", lineHeight: 1,
                display: "flex", alignItems: "center",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "#c4b8ae"}
              ><XIcon /></button>
            </div>
          ))}
        </div>

        {/* Add category — dropdown from existing categories */}
        {categories.filter(c => !budgetRows.find(r => r.name === c.name)).length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <select
              value=""
              onChange={e => {
                const selected = categories.find(c => c.name === e.target.value);
                if (!selected) return;
                setBudgetRows(prev => [...prev, { id: selected.id, name: selected.name, limit: "" }]);
                }}
              style={{
                ...inputStyle, fontSize: "13px", padding: "8px 12px",
                cursor: "pointer", appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239B8672' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="">+ Add category...</option>
              {categories
                .filter(c => !budgetRows.find(r => r.name === c.name))
                .map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              }
            </select>
          </div>
        )}
      </div>

      {/* Allocation summary */}
      {total > 0 && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px", marginBottom: "20px",
          background: isBalanced ? "#f0fdf4" : isOver ? "#fef2f2" : "#fefce8",
          border: `1px solid ${isBalanced ? "#86efac" : isOver ? "#fca5a5" : "#fde68a"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 500, color: isBalanced ? "#16a34a" : isOver ? "#dc2626" : "#92400e" }}>
            {isBalanced ? "✅ Fully allocated"
              : isOver ? `⚠️ Over by ₹${(allocatedTotal - total).toFixed(0)}`
              : `₹${remaining.toFixed(0)} unallocated`}
          </span>
          <span style={{ fontSize: "12px", color: "#9a8e84" }}>
            <span style={{ fontWeight: 600, color: "#1a1714" }}>₹{allocatedTotal.toFixed(0)}</span> / ₹{total.toFixed(0)}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onBack} style={{
          flex: 1, padding: "11px", background: "transparent",
          border: "1px solid #e8e2db", borderRadius: "10px",
          fontSize: "13px", fontWeight: 500, color: "#555",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>← Back</button>
        <button
          onClick={onSubmit}
          disabled={saving || !totalBudget || isOver}
          style={{
            flex: 2, padding: "11px",
            background: saving || !totalBudget || isOver ? "#d4ccc4" : ACCENT,
            border: "none", borderRadius: "10px",
            fontSize: "13px", fontWeight: 500, color: "#fff",
            cursor: saving || !totalBudget || isOver ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {saving ? "Creating..." : "Finalize Journal ✓"}
        </button>
      </div>
    </>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function CreateJournalModal({ onClose, onCreate, categories = [] }) {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("monthly");
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const [budgetRows, setBudgetRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const handlePage1Submit = () => {
    if (!name.trim()) return;
    if (budgetEnabled) {
      setPage(2);
    } else {
      handleFinalCreate();
    }
  };

  const handleFinalCreate = async () => {
    try {
      setSaving(true);
      await onCreate({
        name: name.trim(),
        type: selectedType,
        budgetEnabled,
        totalBudget: budgetEnabled ? parseFloat(totalBudget) || 0 : 0,
        budgetCategories: budgetEnabled ? budgetRows : [],
      });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        width: "420px", padding: "28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
        position: "relative",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "#f5f0eb", border: "none", borderRadius: "8px",
          width: "28px", height: "28px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9a8e84",
        }}><XIcon /></button>

        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

        {page === 1 ? (
          <Page1
            name={name} setName={setName}
            selectedType={selectedType} setSelectedType={setSelectedType}
            budgetEnabled={budgetEnabled} setBudgetEnabled={setBudgetEnabled}
            onSubmit={handlePage1Submit}
            onClose={onClose}
          />
        ) : (
          <Page2
            totalBudget={totalBudget} setTotalBudget={setTotalBudget}
            budgetRows={budgetRows} setBudgetRows={setBudgetRows}
            onBack={() => setPage(1)}
            onSubmit={handleFinalCreate}
            saving={saving}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
}