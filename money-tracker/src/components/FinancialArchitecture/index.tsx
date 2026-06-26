import { useState } from "react";
import type { BudgetSummary, Category, TransactionCategory } from "./types";
import { ACCENT, getBarColor, getStatusLabel, getStatusColor, getCatIconKey } from "./utils";
import { FoodIcon, TravelIcon, HomeIcon, ShoppingIcon, GridIcon, XIcon } from "./Icons";

// ── Icon resolver ─────────────────────────────────────────────────
const ICON_MAP: Record<string, JSX.Element> = {
  food: <FoodIcon />, travel: <TravelIcon />, home: <HomeIcon />,
  shopping: <ShoppingIcon />, grid: <GridIcon />,
};
function CatIcon({ name }: { name: string }) {
  return ICON_MAP[getCatIconKey(name)] ?? <GridIcon />;
}

// ── Shared styles ─────────────────────────────────────────────────
const FONTS = (
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
);
const WRAPPER: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  background: "#f5f0ea",
  padding: "28px 32px",
  minHeight: "33vh",
  boxSizing: "border-box",
};
const SECTION_LABEL: React.CSSProperties = {
  letterSpacing: "0.18em", fontSize: 10.5, color: "#9a8f84",
  fontWeight: 500, margin: "0 0 20px", textTransform: "uppercase",
};

// ── Subcomponents ─────────────────────────────────────────────────
function StatRow({ totalSpent, owes, returns, extra }: {
  totalSpent: number; owes: number; returns: number;
  extra?: { label: string; value: string }[];
}) {
  const stats = [
    { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, dark: true },
    { label: "Owes", value: `₹${Math.abs(owes).toLocaleString()}` },
    { label: "Returns", value: `₹${Math.abs(returns).toLocaleString()}` },
    ...(extra || []).map(e => ({ label: e.label, value: e.value, dark: false })),
  ];
  return (
    <div style={{ display: "flex", gap: 32, marginTop: 18, paddingTop: 16, borderTop: "1px solid #d9d3cb" }}>
      {stats.map(s => (
        <div key={s.label}>
          <p style={{ fontSize: 10, color: "#9a8f84", margin: "0 0 3px", letterSpacing: "0.04em" }}>{s.label}</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: s.dark ? "#2e2a24" : "#8B5E1A", margin: 0, letterSpacing: "-0.5px" }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const pct = cat.limitAmount > 0 ? (cat.spent / cat.limitAmount) * 100 : 0;
  const over = pct >= 100;
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: "0.5px solid #e8e2db", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: over ? "rgba(192,57,43,0.08)" : "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center", color: over ? "#C0392B" : ACCENT }}>
          <CatIcon name={cat.name} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#1a1714", flex: 1 }}>{cat.name}</span>
        <span style={{ fontSize: 11, color: "#1a1714", fontWeight: 500, whiteSpace: "nowrap" }}>
          ₹{cat.spent.toLocaleString()} <span style={{ color: "#9a8e84", fontWeight: 400 }}>/ ₹{cat.limitAmount.toLocaleString()}</span>
        </span>
      </div>
      <div style={{ height: 3, background: "#e8e2db", borderRadius: 2, overflow: "hidden", marginBottom: 7 }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: getBarColor(pct), borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      <p style={{ fontSize: 9, letterSpacing: "0.1em", color: getStatusColor(pct), margin: 0, fontWeight: 500 }}>{getStatusLabel(pct)}</p>
    </div>
  );
}

function SimpleCategoryCard({ cat }: { cat: TransactionCategory }) {
  return (
    <div style={{ background: "#edeae4", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#e0dbd2", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
          <CatIcon name={cat.name} />
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "#2e2a24", flex: 1 }}>{cat.name}</span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#8B5E1A", margin: 0, letterSpacing: "-0.5px" }}>₹{cat.spent.toLocaleString()}</p>
      <p style={{ fontSize: 9, letterSpacing: "0.12em", color: "#9a8f84", margin: "6px 0 0", textTransform: "uppercase" }}>TOTAL SPENT</p>
    </div>
  );
}

function ViewAllBtn({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <div onClick={onClick}
      style={{ background: "#ede8e2", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", border: "0.5px solid #ddd6ce", transition: "background 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#e4ddd5")}
      onMouseLeave={e => (e.currentTarget.style.background = "#ede8e2")}
    >
      <div style={{ color: ACCENT }}><GridIcon /></div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#1a1714", margin: 0, textAlign: "center" }}>VIEW ALL CATEGORIES</p>
      {count > 3 && <p style={{ fontSize: 10, color: "#9a8e84", margin: 0 }}>+{count - 3} more</p>}
    </div>
  );
}

function AllCategoriesModal({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,23,20,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 20, width: 460, maxHeight: "75vh", padding: "28px 28px 20px", overflowY: "auto", boxShadow: "0 32px 80px rgba(60,35,10,0.18)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9a8e84", margin: "0 0 4px", fontWeight: 500 }}>FINANCIAL ARCHITECTURE</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, color: "#1a1714", margin: 0 }}>All Categories</h3>
          </div>
          <button onClick={onClose} style={{ background: "#f5f0eb", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8e84" }}>
            <XIcon />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categories.map(cat => {
            const budgetSet = cat.limitAmount > 0;
            const pct = budgetSet ? (cat.spent / cat.limitAmount) * 100 : 0;
            return (
              <div key={cat.id} style={{ padding: "14px 16px", borderRadius: 12, background: "#faf7f4", border: "0.5px solid #e8e2db" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: budgetSet ? 10 : 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: pct >= 100 ? "rgba(192,57,43,0.08)" : "#f0e8e0", display: "flex", alignItems: "center", justifyContent: "center", color: pct >= 100 ? "#C0392B" : ACCENT }}>
                    <CatIcon name={cat.name} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1a1714" }}>{cat.name}</span>
                  <span style={{ fontSize: 12, color: "#1a1714", fontWeight: 500 }}>
                    ₹{cat.spent.toLocaleString()}
                    {budgetSet && <span style={{ color: "#9a8e84", fontWeight: 400 }}> / ₹{cat.limitAmount.toLocaleString()}</span>}
                  </span>
                </div>
                {budgetSet && (
                  <>
                    <div style={{ height: 3, background: "#e8e2db", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: getBarColor(pct), borderRadius: 2, transition: "width 0.4s ease" }} />
                    </div>
                    <p style={{ fontSize: 10, letterSpacing: "0.08em", color: getStatusColor(pct), margin: 0, fontWeight: 500 }}>{getStatusLabel(pct)}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function FinancialArchitecture({ summary }: { summary: BudgetSummary | null }) {
  const [showModal, setShowModal] = useState(false);

  if (!summary) return null;

  const { totalSpent, totalBudget, budgetEnabled, remaining, returns, owes, categories, transactionCategories } = summary;

  // ── No budget view ────────────────────────────────────────────
  if (!budgetEnabled || categories.length === 0) {
    const topCats = transactionCategories.slice(0, 3);
    const emptySlots = Math.max(0, 3 - topCats.length);
    const modalCats: Category[] = transactionCategories.map((c, i) => ({
      id: String(i), name: c.name, categoryId: "", limitAmount: 0, spent: c.spent, pct: 0,
    }));

    return (
      <>
        {FONTS}
        <div style={WRAPPER}>
          <p style={SECTION_LABEL}>Financial Architecture</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "#edeae4", borderRadius: 16, padding: "28px 30px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "#9a8f84", margin: "0 0 6px", textTransform: "uppercase", fontWeight: 500 }}>Total Spend</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#9a8f84", marginBottom: 8 }}>₹</span>
                  <span style={{ fontSize: 80, fontWeight: 700, color: "#8B5E1A", letterSpacing: "-4px", lineHeight: 1 }}>
                    {totalSpent >= 1000 ? `${Math.round(totalSpent / 1000)}k` : Math.round(totalSpent)}
                  </span>
                </div>
              </div>
              <StatRow totalSpent={totalSpent} owes={owes} returns={returns} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {topCats.map((cat, i) => <SimpleCategoryCard key={i} cat={cat} />)}
              {Array.from({ length: emptySlots }).map((_, i) => <div key={i} style={{ borderRadius: 14, background: "#edeae4", opacity: 0.3 }} />)}
              <ViewAllBtn count={transactionCategories.length} onClick={() => setShowModal(true)} />
            </div>
          </div>
        </div>
        {showModal && <AllCategoriesModal categories={modalCats} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // ── Budget view ───────────────────────────────────────────────
  const top3 = categories.slice(0, 3);
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <>
      {FONTS}
      <div style={WRAPPER}>
        <p style={SECTION_LABEL}>Financial Architecture</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#edeae4", borderRadius: 16, padding: "28px 30px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "#9a8f84", margin: "0 0 6px", textTransform: "uppercase", fontWeight: 500 }}>MONTHLY BUDGET SPENT</p>
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                <span style={{ fontSize: 80, fontWeight: 700, color: "#8B5E1A", letterSpacing: "-4px", lineHeight: 1 }}>{totalPct}</span>
                <span style={{ fontSize: 28, fontWeight: 600, color: "#8B5E1A", marginTop: 10, marginLeft: 2 }}>%</span>
              </div>
            </div>
            <StatRow totalSpent={totalSpent} owes={owes} returns={returns}
              extra={[
                { label: "Total Capital Allocated", value: `₹${totalBudget.toLocaleString()}` },
                { label: "Remaining", value: `₹${Math.abs(remaining).toLocaleString()}` },
              ]}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {top3[0] && <CategoryCard cat={top3[0]} />}
            {top3[1] && <CategoryCard cat={top3[1]} />}
            {top3[2] && <CategoryCard cat={top3[2]} />}
            <ViewAllBtn count={categories.length} onClick={() => setShowModal(true)} />
          </div>
        </div>
      </div>
      {showModal && <AllCategoriesModal categories={categories} onClose={() => setShowModal(false)} />}
    </>
  );
}