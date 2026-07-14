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

const FONTS = (
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
);

const BG = "#f7f2ec";

// ── Category Card (budget view) ───────────────────────────────────
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

// ── Simple Category Card (no budget) ─────────────────────────────
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

// ── View All Button ───────────────────────────────────────────────
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

// ── All Categories Modal ──────────────────────────────────────────
function AllCategoriesModal({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,23,20,0.35)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 200,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, width: 480, maxHeight: "78vh",
        padding: "28px 28px 20px", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(60,35,10,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9a8e84", margin: "0 0 4px", fontWeight: 500 }}>
              FINANCIAL ARCHITECTURE
            </p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, color: "#1a1714", margin: 0 }}>
              All Categories
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: "#f5f0eb", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#9a8e84",
          }}>
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
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: pct >= 100 ? "rgba(192,57,43,0.08)" : "#ede8e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: pct >= 100 ? "#C0392B" : ACCENT,
                  }}>
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
                    <div style={{ height: 3, background: "#ddd8d0", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: getBarColor(pct), borderRadius: 2, transition: "width 0.4s ease" }} />
                    </div>
                    <p style={{ fontSize: 10, letterSpacing: "0.08em", color: getStatusColor(pct), margin: 0, fontWeight: 500 }}>
                      {getStatusLabel(pct)}
                    </p>
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

// ── Payment Method Bar ────────────────────────────────────────────
function PaymentMethodBar({ methods }: { methods: { name: string; total: number }[] }) {
  if (!methods?.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 32px 20px", background: BG }}>
      {methods.map(m => (
        <div key={m.name} style={{
          padding: "5px 14px", borderRadius: 20,
          background: "#f0ebe3", border: "none",
          fontSize: 12, color: "#5a4a3a",
        }}>
          <span style={{ fontWeight: 600, color: "#9a8f84", marginRight: 4 }}>
            {m.name.toUpperCase()}:
          </span>
          <span style={{ fontWeight: 700, color: "#1a1714" }}>₹{m.total.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Row ──────────────────────────────────────────────────────
function StatRow({ stats }: { stats: { label: string; value: string; dark?: boolean; red?: boolean }[] }) {
  return (
    <div style={{ display: "flex", gap: 28, marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8e2db", flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label}>
          <p style={{ fontSize: 9, color: "#9a8f84", margin: "0 0 3px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {s.label}
          </p>
          <p style={{
            fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.5px",
            color: s.red ? "#C0392B" : s.dark ? "#1a1714" : "#8B5E1A",
          }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function FinancialArchitecture({ summary }: { summary: BudgetSummary | null }) {
  const [showModal, setShowModal] = useState(false);

  if (!summary) return null;

  const {
    totalSpent, totalBudget, budgetEnabled, remaining,
    returns, owes, categories, transactionCategories,
  } = summary;
  const paymentMethods = (summary as any).paymentMethods || [];

  // ── No budget view ────────────────────────────────────────────
  if (!budgetEnabled || categories.length === 0) {
    const top3 = transactionCategories.slice(0, 3);
    const emptySlots = Math.max(0, 3 - top3.length);
    const modalCats: Category[] = transactionCategories.map((c, i) => ({
      id: String(i), name: c.name, categoryId: "", limitAmount: 0, spent: c.spent, pct: 0,
    }));

    return (
      <>
        {FONTS}
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: BG, padding: "28px 32px", boxSizing: "border-box" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#9a8f84", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase" }}>
            Financial Architecture
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", margin: "0 0 20px", textTransform: "uppercase" }}>
            Total Spend Overview
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left — white box */}
            <div style={{
              background: "#edeae4", borderRadius: 20, padding: "28px 30px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, lineHeight: 1 }}>
                  <span style={{ fontSize: 13, color: "#9a8f84", fontWeight: 500, marginBottom: 12 }}>₹</span>
                  <span style={{ fontSize: 96, fontWeight: 700, color: "#1a1714", letterSpacing: "-6px", lineHeight: 1 }}>
                    {totalSpent >= 1000 ? `${Math.round(totalSpent / 1000)}k` : Math.round(totalSpent)}
                  </span>
                </div>
              </div>
              <StatRow stats={[
                { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, dark: true },
                { label: "Owes", value: `₹${Math.abs(owes).toLocaleString()}` },
                { label: "Returns", value: `₹${Math.abs(returns).toLocaleString()}` },
              ]} />
            </div>

            {/* Right — 2x2 grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {top3.map((cat, i) => <SimpleCategoryCard key={i} cat={cat} />)}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={i} style={{ borderRadius: 16, background: "#eeebe4", opacity: 0.4 }} />
              ))}
              <ViewAllBtn count={transactionCategories.length} onClick={() => setShowModal(true)} />
            </div>
          </div>
        </div>

        <PaymentMethodBar methods={paymentMethods} />
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
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: BG, padding: "28px 32px", boxSizing: "border-box" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#9a8f84", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase" }}>
          Financial Architecture
        </p>
        <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", margin: "0 0 20px", textTransform: "uppercase" }}>
          Monthly Budget Utilization
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Left — white box with % */}
          <div style={{
            background: "#fff", borderRadius: 20, padding: "28px 30px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
                <span style={{ fontSize: 96, fontWeight: 700, color: "#1a1714", letterSpacing: "-6px", lineHeight: 1 }}>
                  {totalPct}
                </span>
                <span style={{ fontSize: 32, fontWeight: 600, color: "#1a1714", marginTop: 14, marginLeft: 4 }}>%</span>
              </div>
            </div>
            <StatRow stats={[
              { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, dark: true },
              { label: "Owes", value: `₹${Math.abs(owes).toLocaleString()}` },
              { label: "Returns", value: `₹${Math.abs(returns).toLocaleString()}` },
              { label: "Allocated", value: `₹${totalBudget.toLocaleString()}` },
              {
                label: "Remaining",
                value: remaining < 0 ? `-₹${Math.abs(remaining).toLocaleString()}` : `₹${remaining.toLocaleString()}`,
                red: remaining < 0,
              },
            ]} />
          </div>

          {/* Right — 2x2 grid: 3 category cards + view all */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {top3[0] && <CategoryCard cat={top3[0]} />}
            {top3[1] && <CategoryCard cat={top3[1]} />}
            {top3[2] && <CategoryCard cat={top3[2]} />}
            <ViewAllBtn count={categories.length} onClick={() => setShowModal(true)} />
          </div>
        </div>
      </div>

      <PaymentMethodBar methods={paymentMethods} />
      {showModal && <AllCategoriesModal categories={categories} onClose={() => setShowModal(false)} />}
    </>
  );
}