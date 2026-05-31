import { useState, useEffect } from "react";
import {
  listCategories, createCategory, deleteCategory,
  listPeople, createPerson, deletePerson,
  listPaymentMethods, createPaymentMethod, deletePaymentMethod,
} from "../services/settingsService";

const ACCENT = "#8C5A3C";

const BankIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="1"/><path d="M3 10l9-7 9 7"/><line x1="12" y1="10" x2="12" y2="21"/>
  </svg>
);
const UpiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const METHOD_ICONS = { BANK: <BankIcon />, PERSONAL: <UpiIcon />, VISA: <CardIcon />, CASH: <CardIcon />, CREDIT: <CardIcon />, DEBIT: <CardIcon />, UPI: <UpiIcon /> };

const AVATAR_COLORS = [
  { bg: "#f0e8e0", fg: ACCENT },
  { bg: "#e8e0f0", fg: "#5a3c8c" },
  { bg: "#e0f0e8", fg: "#3c8c5a" },
  { bg: "#f0ebe0", fg: "#8c6a3c" },
  { bg: "#e0e8f0", fg: "#3c5a8c" },
];

function initials(name) {
  return name.trim().split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
}

function getColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  fontSize: "13px", padding: "9px 12px",
  border: "1px solid #e8e2db", borderRadius: "8px",
  background: "#faf7f4", color: "#1a1714", outline: "none",
  fontFamily: "'DM Sans', sans-serif",
};

// ── Confirm popover ───────────────────────────────────────────────
function ConfirmPopover({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "absolute", right: 0, top: "calc(100% + 6px)",
      background: "#fff", border: "1px solid #e8e2db",
      borderRadius: "10px", padding: "10px 12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      zIndex: 50, whiteSpace: "nowrap",
      display: "flex", flexDirection: "column", gap: "8px",
      minWidth: "160px",
    }}>
      <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={onConfirm} style={{
          flex: 1, background: "#ef4444", color: "#fff", border: "none",
          borderRadius: "6px", padding: "4px 0", fontSize: "11px",
          fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Yes, delete</button>
        <button onClick={onCancel} style={{
          flex: 1, background: "#f5f0eb", color: "#555", border: "none",
          borderRadius: "6px", padding: "4px 0", fontSize: "11px",
          fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Add Payment Modal ─────────────────────────────────────────────
function AddPaymentModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { setNameError("Name is required"); return; }
    try {
      setSaving(true);
      const created = await onAdd({ name: name.trim(), detail: bank.trim(), badge: "BANK", notes: notes.trim() });
      onClose();
    } catch (err) {
      setNameError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(2px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 400, color: "#1a1714", margin: 0 }}>Add Payment Method</h3>
            <p style={{ fontSize: "11px", color: "#9a8e84", margin: "2px 0 0", letterSpacing: "0.06em" }}>Fields marked * are required</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8e84", padding: 0, marginTop: "2px" }}><XIcon /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", color: "#555", display: "block", marginBottom: "5px" }}>NAME *</label>
            <input value={name} onChange={e => { setName(e.target.value); setNameError(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="e.g. Premium Savings" style={{ ...inputStyle, borderColor: nameError ? "#ef4444" : "#e8e2db" }} autoFocus />
            {nameError && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>{nameError}</p>}
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", color: "#555", display: "block", marginBottom: "5px" }}>ASSOCIATED BANK <span style={{ color: "#b0a89e", fontWeight: 400 }}>(optional)</span></label>
            <input value={bank} onChange={e => setBank(e.target.value)} placeholder="e.g. HDFC, SBI, vance@upi" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", color: "#555", display: "block", marginBottom: "5px" }}>NOTES <span style={{ color: "#b0a89e", fontWeight: 400 }}>(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details..." rows={2} style={{ ...inputStyle, resize: "none" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", color: "#555", border: "1px solid #e8e2db", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: ACCENT, color: "#fff", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Adding..." : "Add Method"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Payment Card ──────────────────────────────────────────────────
function PaymentCard({ pm, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(pm.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirming(false); }}
      style={{ background: "#fff", border: "1px solid #e8e2db", borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "box-shadow 0.2s ease", position: "relative", boxShadow: hovered ? "0 4px 16px rgba(140,90,60,0.08)" : "none" }}
    >
      {hovered && (
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <button onClick={e => { e.stopPropagation(); setConfirming(c => !c); }} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", color: "#ef4444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            {deleting ? "..." : "DELETE"}
          </button>
          {confirming && (
            <ConfirmPopover
              message={`Delete "${pm.name}"?`}
              onConfirm={handleDelete}
              onCancel={() => setConfirming(false)}
            />
          )}
        </div>
      )}
      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, marginBottom: "12px" }}>
        {METHOD_ICONS[pm.badge] || <CardIcon />}
      </div>
      <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1714", margin: "0 0 3px" }}>{pm.name}</p>
      <p style={{ fontSize: "12px", color: "#9a8e84", margin: "0 0 10px" }}>{pm.detail}</p>
      <span style={{ fontSize: "10px", letterSpacing: "0.08em", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", background: "#f5f0eb", color: ACCENT, border: "0.5px solid #e8ddd4" }}>{pm.badge}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function SettingsPage() {
  const [people, setPeople] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPerson, setNewPerson] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingPerson, setAddingPerson] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const [confirmingPerson, setConfirmingPerson] = useState(null);
  const [confirmingCategory, setConfirmingCategory] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Fetch all on mount ──
  useEffect(() => {
    async function fetchAll() {
      try {
        const [p, c, pm] = await Promise.all([listPeople(), listCategories(), listPaymentMethods()]);
        setPeople(p);
        setCategories(c);
        setPayments(pm);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── People ──
  const addPerson = async () => {
    const name = newPerson.trim();
    if (!name) return;
    try {
      setAddingPerson(true);
      const created = await createPerson(name);
      setPeople(prev => [...prev, created]);
      setNewPerson("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingPerson(false);
    }
  };

  const removePerson = async (id) => {
    try {
      await deletePerson(id);
      setPeople(prev => prev.filter(p => p.id !== id));
      setConfirmingPerson(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Categories ──
  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      setAddingCategory(true);
      const created = await createCategory(name);
      setCategories(prev => [...prev, created]);
      setNewCategory("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingCategory(false);
    }
  };

  const removeCategory = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setConfirmingCategory(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Payment Methods ──
  const addPayment = async (data) => {
    const created = await createPaymentMethod(data);
    setPayments(prev => [...prev, created]);
  };

  const removePayment = async (id) => {
    await deletePaymentMethod(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf7f4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9a8e84", fontSize: "13px", letterSpacing: "0.08em" }}>LOADING...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf7f4", minHeight: "100vh", padding: "2.5rem 3rem", boxSizing: "border-box" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#1a1714", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#9a8e84", margin: 0 }}>PERSONALIZE YOUR LEDGER EXPERIENCE</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>

        {/* Left */}
        <div>
          <p style={{ fontSize: "16px", fontWeight: 500, color: "#1a1714", margin: "0 0 4px" }}>Payment Methods</p>
          <p style={{ fontSize: "12px", color: "#9a8e84", margin: "0 0 1.25rem" }}>Manage your connected bank accounts and cards</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {payments.map(pm => (
              <PaymentCard key={pm.id} pm={pm} onDelete={removePayment} />
            ))}
            <div onClick={() => setShowPaymentModal(true)} style={{ border: "1.5px dashed #d4ccc4", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", minHeight: "140px", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#d4ccc4"}
            >
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d4ccc4", display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8e84" }}><PlusIcon /></div>
              <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#9a8e84", textAlign: "center", padding: "0 8px" }}>ADD PAYMENT METHOD</span>
            </div>
          </div>

          {/* Data Privacy */}
          <div style={{ background: "#fff", border: "1px solid #e8e2db", borderRadius: "14px", padding: "20px 24px", marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1714", margin: "0 0 6px" }}>Data Privacy &amp; Export</p>
              <p style={{ fontSize: "13px", color: "#9a8e84", margin: 0, lineHeight: 1.6 }}>Your ledger data is encrypted. You can download a complete editorial-formatted PDF of your financial history at any time.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
              <button style={{ background: "transparent", color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: "10px", padding: "8px 20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Export CSV</button>
              <button style={{ background: ACCENT, color: "#fff", border: `1px solid ${ACCENT}`, borderRadius: "10px", padding: "8px 20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Ledger PDF</button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* People */}
          <div style={{ background: "#fff", border: "1px solid #e8e2db", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1714", margin: "0 0 2px" }}>People</p>
            <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#9a8e84", margin: "0 0 1rem" }}>SHARED ACCESS</p>
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {people.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", position: "relative", borderBottom: i < people.length - 1 ? "0.5px solid #f0ece8" : "none" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: getColor(i).bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, color: getColor(i).fg, flexShrink: 0 }}>
                  {initials(p.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714", margin: 0 }}>{p.name}</p>
                  <p style={{ fontSize: "11px", color: "#9a8e84", margin: 0 }}>{p.role}</p>
                </div>
                {p.role !== "Owner" && (
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setConfirmingPerson(confirmingPerson === p.id ? null : p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4b8ae", padding: "2px", lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#c4b8ae"}
                    ><XIcon /></button>
                    {confirmingPerson === p.id && (
                      <ConfirmPopover
                        message={`Remove ${p.name}?`}
                        onConfirm={() => removePerson(p.id)}
                        onCancel={() => setConfirmingPerson(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <input value={newPerson} onChange={e => setNewPerson(e.target.value)} onKeyDown={e => e.key === "Enter" && addPerson()} placeholder="New participant..." style={{ flex: 1, fontSize: "13px", padding: "7px 10px", border: "0.5px solid #e8e2db", borderRadius: "8px", background: "#faf7f4", color: "#1a1714", outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={addPerson} disabled={addingPerson} style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: addingPerson ? 0.7 : 1 }}>
                {addingPerson ? "..." : "ADD"}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div style={{ background: "#fff", border: "1px solid #e8e2db", borderRadius: "14px", padding: "20px" }}>
            <p style={{ fontSize: "15px", fontWeight: 500, color: "#1a1714", margin: "0 0 2px" }}>Categories</p>
            <p style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#9a8e84", margin: "0 0 1rem" }}>CLASSIFICATIONS</p>
            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {categories.map((cat, i) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", position: "relative", borderBottom: i < categories.length - 1 ? "0.5px solid #f0ece8" : "none" }}>
                <span style={{ fontSize: "13px", color: "#1a1714" }}>{cat.name}</span>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setConfirmingCategory(confirmingCategory === cat.id ? null : cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4b8ae", padding: "2px", lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color = "#c4b8ae"}
                  ><XIcon /></button>
                  {confirmingCategory === cat.id && (
                    <ConfirmPopover
                      message={`Delete "${cat.name}"?`}
                      onConfirm={() => removeCategory(cat.id)}
                      onCancel={() => setConfirmingCategory(null)}
                    />
                  )}
                </div>
              </div>
            ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="New category..." style={{ flex: 1, fontSize: "13px", padding: "7px 10px", border: "0.5px solid #e8e2db", borderRadius: "8px", background: "#faf7f4", color: "#1a1714", outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={addCategory} disabled={addingCategory} style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: addingCategory ? 0.7 : 1 }}>
                {addingCategory ? "..." : "ADD"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowPaymentModal(false)}
          onAdd={addPayment}
        />
      )}
    </div>
  );
}