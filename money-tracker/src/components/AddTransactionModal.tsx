import { useState, useEffect } from "react";
import { saveTransaction, updateTransaction } from "../services/transactionService";
import { listCategories, listPeople, listPaymentMethods } from "../services/settingsService";

const AVATAR_COLORS = ["#C4894B", "#7BA7BC", "#A8C5A0", "#B5838D", "#9B8672"];

function getInitials(name) {
  if (name === "You") return "ME";
  return name.split(" ").map((n) => n[0]).join("");
}

const inputBase = { background: "#F0EBE3", border: "1.5px solid transparent" };

const selectStyle = {
  ...inputBase,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239B8672' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

const CURRENT_USER = "You";
export default function AddTransactionModal({ sheetName, sheetId, onClose, onSaved, initialData = null, currentUser = CURRENT_USER }) {
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(initialData?.amount ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [methodId, setMethodId] = useState(initialData?.methodId ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [method, setMethod] = useState(initialData?.method ?? "");
  const [people, setPeople] = useState(() => {
    const raw = initialData?.participants ?? initialData?.people ?? [];
    let arr;
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (typeof raw === "string" && raw.includes("|")) {
      arr = raw.split("|").filter(Boolean).map((p) => {
        const [name, owes] = p.split(":");
        return { name: name?.trim(), owes: owes?.trim() || "0" };
      });
    } else if (typeof raw === "string" && raw.includes("(₹")) {
      arr = raw.split(",").map((chunk) => {
        const match = chunk.trim().match(/^(.+?)\s*\(\$([0-9.]+)\)$/);
        if (match) return { name: match[1].trim(), owes: match[2] };
        return { name: chunk.trim(), owes: "0" };
      });
    } else {
      arr = [];
    }
    return arr.map((p) => ({ ...p, isYou: p.name === CURRENT_USER || p.isYou === true }));
  });
  const [taxReturnable, setTaxReturnable] = useState(initialData?.taxReturnable ?? true);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Sync initialData changes ──────────────────────────────────
  useEffect(() => {
    if (!initialData) return;
    setAmount(initialData.amount ?? "");
    setDate(initialData.date ?? "");
    setDescription(initialData.description ?? "");
    setCategory(initialData.category ?? "");
    setCategoryId(initialData.categoryId ?? "")
    setMethod(initialData.method ?? "");
    setMethodId(initialData.methodId??"")
    setTaxReturnable(initialData.taxReturnable ?? true);
    setNotes(initialData.notes ?? "");
    const raw = initialData?.participants ?? initialData?.people ?? [];
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (typeof raw === "string" && raw.includes("|")) {
      arr = raw.split("|").filter(Boolean).map((p) => {
        const [name, owes] = p.split(":");
        return { name: name?.trim(), owes: owes?.trim() || "0" };
      });
    }
    setPeople(arr.map((p) => ({ ...p, isYou: p.name === CURRENT_USER || p.isYou === true })));
  }, [initialData]);

  // ── Load categories, payment methods, people from API ─────────
  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, meths, parts] = await Promise.all([
          listCategories(),
          listPaymentMethods(),
          listPeople(),
        ]);
        setCategories(cats);       // [{id, name}, ...]
        setMethods(meths);         // [{id, name, detail}, ...]
        setAllParticipants(parts); // [{id, name, role}, ...]

        if (meths.length > 0 && !initialData?.method) {
          setMethod(meths[0].name);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        // setError("Failed to load settings data. Make sure the backend is running.");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Derived amounts ───────────────────────────────────────────
  const totalAmount = parseFloat(amount) || 0;
  const participantTotal = people.reduce((sum, p) => {
    const v = parseFloat(p.owes) || 0;
    return sum + (v > 0 ? v : -1 * v);
  }, 0);
  const remaining = parseFloat((totalAmount - participantTotal).toFixed(2));
  const isOver = participantTotal > totalAmount && totalAmount > 0;
  const isBalanced = totalAmount > 0 && people.length > 0 && Math.abs(remaining) < 0.01;

  // ── Handlers ──────────────────────────────────────────────────
  const removeParticipant = (name) => setPeople(people.filter((p) => p.name !== name));

  const addParticipant = (value) => {
    if (!value) return;
    const isYou = value === "__you__";
    const displayName = isYou ? currentUser : value;
    if (!people.find((p) => p.name === displayName)) {
      setPeople((prev) => [...prev, { name: displayName, isYou, owes: "" }]);
    }
    setShowParticipantDropdown(false);
  };

  const updateOwes = (name, raw) => {
    const clean = raw
      .replace(/[^0-9.\-]/g, "")
      .replace(/(?!^)-/g, "")
      .replace(/(\..*?)\..*/g, "$1");
    setPeople(people.map((p) => (p.name === name ? { ...p, owes: clean } : p)));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const payload = {date, description, amount, category, categoryId, method, paymentMethodId: methodId, taxReturnable, people, notes };
      let result;
      if (initialData?.id) {
        result = await updateTransaction(sheetId, initialData.id, payload);
        const returnAmount = result?.people
          .filter((p) => p.name !== "You")
          .reduce((sum, p) => sum + (parseFloat(p.owes) || 0), 0);
        result = { ...result, returnAmount };
        onSaved?.(result);
      } else {
        result = await saveTransaction(sheetId, payload);
        onSaved?.(result);
      }
      setSaveSuccess(true);
      setTimeout(() => onClose?.(), 1200);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Participants available to add — filter out already-added ones
  // allParticipants is [{id, name, role}] — extract names for comparison
  const youAlreadyAdded = people.some((p) => p.isYou);
  const available = allParticipants.filter(
    (p) => p.name !== currentUser && !people.find((pp) => pp.name === p.name)
  );
  const hasOptions = !youAlreadyAdded || available.length > 0;

  // ── Loading / error screens ───────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(30,20,10,0.55)", backdropFilter: "blur(6px)" }}>
        <div className="rounded-2xl px-10 py-8 flex flex-col items-center gap-3" style={{ background: "#FAF8F4" }}>
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "#C4894B", borderTopColor: "transparent" }} />
          <p className="text-sm text-[#9B8672] font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(30,20,10,0.55)", backdropFilter: "blur(6px)" }}>
        <div className="rounded-2xl px-10 py-8 max-w-sm text-center" style={{ background: "#FAF8F4" }}>
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-[#6B5744]"
            style={{ border: "1.5px solid #D4C4B4" }}>Close</button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(30,20,10,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-y-auto max-h-[92vh]"
        style={{ background: "#FAF8F4", boxShadow: "0 32px 80px rgba(60,35,10,0.22)" }}
      >
        <div className="px-10 py-9">

          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-[#8B7355] hover:bg-[#EDE8DF] hover:text-[#5C4A32] transition-colors text-lg leading-none">
            ✕
          </button>

          <h2 className="text-2xl font-bold text-[#2C1F0E] tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            Record Transaction
          </h2>
          <p className="text-xs text-[#9B8672] mt-1 font-light">Detailing your financial narrative.</p>

          <div className="h-px bg-[#E8E2D9] my-6" />

          {/* Amount + Date */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4894B] font-medium text-sm pointer-events-none">₹</span>
                <input
                  type="text" inputMode="decimal" placeholder="0.00" value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
                    setAmount(v);
                  }}
                  className="w-full pl-7 pr-3 py-3 rounded-xl text-sm text-[#2C1F0E] placeholder-[#BFB4A6] outline-none transition-all focus:ring-2 focus:ring-[#C4894B]/20"
                  style={inputBase}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-sm text-[#2C1F0E] outline-none transition-all focus:ring-2 focus:ring-[#C4894B]/20"
                style={inputBase} />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 mt-5">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Description</label>
            <input type="text" placeholder="e.g. Monthly Studio Lease" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-[#2C1F0E] placeholder-[#BFB4A6] outline-none transition-all focus:ring-2 focus:ring-[#C4894B]/20"
              style={inputBase} />
          </div>

         
          <div className="flex gap-4 mt-5">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  const selected = categories.find(c => c.id === e.target.value);
                  setCategoryId(e.target.value);
                  setCategory(selected?.name ?? "");
                }}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#2C1F0E] outline-none appearance-none cursor-pointer transition-all focus:ring-2 focus:ring-[#C4894B]/20"
                style={selectStyle}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Method</label>
              <select
                value={methodId}
                onChange={(e) => {
                  const selected = methods.find(m => m.id === e.target.value);
                  setMethodId(e.target.value);
                  setMethod(selected?.name ?? "");
                }}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#2C1F0E] outline-none appearance-none cursor-pointer transition-all focus:ring-2 focus:ring-[#C4894B]/20"
                style={selectStyle}>
                  <option value="">Select method</option>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* People Involved — now from DB */}
          <div className="flex flex-col gap-3 mt-5">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">People Involved</label>

            {people.length > 0 && (
              <div className="flex flex-col gap-2">
                {people.map((person, i) => {
                  const owesNum = parseFloat(person.owes) || 0;
                  return (
                    <div key={person.name}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
                      style={{ background: "#F0EBE3" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: person.isYou ? "#8B5E2E" : AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length] }}>
                        {getInitials(person.name)}
                      </div>
                      <span className="text-[13px] font-medium text-[#3D2B1A] flex-1 min-w-0 truncate">
                        {person.name}
                        {person.isYou && (
                          <span className="ml-1.5 text-[10px] font-semibold tracking-wide uppercase text-[#C4894B]">you</span>
                        )}
                      </span>
                      <span className="text-[10px] font-medium flex-shrink-0 transition-colors"
                        style={{ color: owesNum < 0 ? "#2563eb" : "#9B8672" }}>
                        {owesNum < 0 ? "you owe" : "owes"}
                      </span>
                      <div className="relative flex-shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none"
                          style={{ color: owesNum < 0 ? "#2563eb" : isOver ? "#dc2626" : "#9B8672" }}>₹</span>
                        <input
                          type="text" inputMode="decimal" defaultValue="0" value={person.owes||0}
                          onChange={(e) => updateOwes(person.name, e.target.value)}
                          className="w-24 pl-5 pr-2 py-1.5 rounded-lg text-[12px] placeholder-[#C9B9A8] outline-none transition-all focus:ring-2"
                          style={{
                            background: owesNum < 0 ? "#eff6ff" : isOver ? "#fef2f2" : "#E8E0D4",
                            border: `1.5px solid ${owesNum < 0 ? "#93c5fd" : isOver ? "#fca5a5" : "transparent"}`,
                            color: owesNum < 0 ? "#1d4ed8" : "#2C1F0E",
                          }}
                        />
                      </div>
                      <button onClick={() => removeParticipant(person.name)}
                        className="text-[#9B8672] hover:text-[#C4894B] text-lg leading-none transition-colors flex-shrink-0 ml-0.5">
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* Balance bar */}
                {totalAmount > 0 && people.length > 0 && (
                  <div className="rounded-xl px-4 py-3 flex items-center justify-between mt-1"
                    style={{
                      background: isBalanced ? "#f0fdf4" : isOver ? "#fef2f2" : "#fefce8",
                      border: `1.5px solid ${isBalanced ? "#86efac" : isOver ? "#fca5a5" : "#fde68a"}`,
                    }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{isBalanced ? "✅" : isOver ? "⚠️" : "⏳"}</span>
                      <span className="text-[12px] font-semibold"
                        style={{ color: isBalanced ? "#16a34a" : isOver ? "#dc2626" : "#92400e" }}>
                        {isBalanced ? "Amounts balanced perfectly"
                          : isOver ? `Over by ₹${(participantTotal - totalAmount).toFixed(2)}`
                          : `₹${remaining.toFixed(2)} still unassigned`}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#9B8672]">
                        <span style={{ color: isOver ? "#dc2626" : "#3D2B1A" }} className="font-semibold">₹{participantTotal.toFixed(2)}</span>
                        <span className="mx-1">/</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="w-28 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: "#E8E0D4" }}>
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((participantTotal / totalAmount) * 100, 100)}%`,
                            background: isBalanced ? "#22c55e" : isOver ? "#ef4444" : "#f59e0b",
                          }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Participant dropdown — options from DB people */}
            <div className="relative self-start">
              {showParticipantDropdown ? (
                <select autoFocus defaultValue=""
                  onChange={(e) => addParticipant(e.target.value)}
                  onBlur={() => setShowParticipantDropdown(false)}
                  className="rounded-full px-3 py-1.5 text-[13px] text-[#3D2B1A] outline-none cursor-pointer"
                  style={{ background: "#F0EBE3", border: "1.5px dashed #C9B9A8" }}>
                  <option value="" disabled>Select person</option>
                  {!youAlreadyAdded && (
                    <option value="__you__">⭐ {currentUser} (You)</option>
                  )}
                  {available.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setShowParticipantDropdown(true)}
                  disabled={!hasOptions}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-[#8B7355] hover:text-[#C4894B] hover:bg-[#C4894B]/5 transition-all disabled:opacity-40"
                  style={{ border: "1.5px dashed #C9B9A8" }}>
                  <span className="text-base leading-none">+</span> Add Participant
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 mt-5">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-[#9B8672]">Extra Notes</label>
            <textarea placeholder="Additional context for auditing..." value={notes}
              onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-[#2C1F0E] placeholder-[#BFB4A6] outline-none resize-none transition-all focus:ring-2 focus:ring-[#C4894B]/20"
              style={inputBase} />
          </div>

          {saveError && (
            <div className="mt-4 px-4 py-2.5 rounded-xl text-[12px] text-red-700 font-medium"
              style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
              ⚠️ {saveError}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={onClose}
              className="flex-1 py-3.5 rounded-xl text-sm font-medium text-[#6B5744] hover:bg-[#EDE8DF] transition-colors"
              style={{ border: "1.5px solid #D4C4B4" }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saveSuccess || (people.length > 0 && totalAmount > 0 && !isBalanced)}
              className="flex-1 py-3.5 rounded-xl text-sm font-medium text-[#FFF8F0] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              style={{ background: saveSuccess ? "#16a34a" : "#8B5E2E", boxShadow: "0 4px 16px rgba(139,94,46,0.28)" }}>
              {saving ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" /> Saving…</>
              ) : saveSuccess ? "✓ Saved!" : "Save Transaction"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}