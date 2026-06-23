import { useState, useMemo } from "react";

const ACCENT = "#8C5A3C";

const FoodIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
);
const TravelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 3.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ShoppingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CAT_ICONS = {
  food: <FoodIcon />, dining: <FoodIcon />, lunch: <FoodIcon />, restaurant: <FoodIcon />,
  travel: <TravelIcon />, trip: <TravelIcon />, flight: <TravelIcon />,
  housing: <HomeIcon />, rent: <HomeIcon />, home: <HomeIcon />, bills: <HomeIcon />,
  shopping: <ShoppingIcon />, shop: <ShoppingIcon />,
};

function getCatIcon(name = "") {
  const key = name.toLowerCase();
  for (const k in CAT_ICONS) {
    if (key.includes(k)) return CAT_ICONS[k];
  }
  return <GridIcon />;
}

function getBarColor(pct) {
  if (pct >= 100) return "#C0392B";
  if (pct >= 80) return "#D4813A";
  return ACCENT;
}

function getStatusLabel(pct) {
  if (pct >= 100) return "CAP FULLY UTILIZED";
  return `${Math.round(pct)}% OF MONTHLY CAP REACHED`;
}

function getStatusColor(pct) {
  if (pct >= 100) return "#C0392B";
  if (pct >= 80) return "#D4813A";
  return "#9a8e84";
}

// ── All Categories Modal ──────────────────────────────────────────
function AllCategoriesModal({ categories, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(26,23,20,0.35)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        width: "460px", maxHeight: "75vh",
        padding: "28px 28px 20px",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(60,35,10,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#9a8e84", margin: "0 0 4px", fontWeight: 500 }}>FINANCIAL ARCHITECTURE</p>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#1a1714", margin: 0 }}>
              All Categories
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: "#f5f0eb", border: "none", borderRadius: "8px",
            width: "28px", height: "28px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8e84",
          }}><XIcon /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {categories.map(cat => {
            let budgetSet=true
            if(cat.limit==0){
              budgetSet = false
            }
            const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
            return (
              <div key={cat.name} style={{
                padding: "14px 16px", borderRadius: "12px",
                background: "#faf7f4", border: "0.5px solid #e8e2db",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: pct >= 100 ? "rgba(192,57,43,0.08)" : "#f0e8e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: pct >= 100 ? "#C0392B" : ACCENT, flexShrink: 0,
                  }}>{getCatIcon(cat.name)}</div>
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "#1a1714" }}>{cat.name}</span>
                  <span style={{ fontSize: "12px", color: "#1a1714", fontWeight: 500 }}>
                    ₹{cat.spent.toLocaleString()}
                    {budgetSet && <span style={{ color: "#9a8e84", fontWeight: 400 }}> / ₹{cat.limit.toLocaleString()}</span>}
                  </span>
                </div>
                {budgetSet && <div>
                  <div style={{ height: "3px", background: "#e8e2db", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: getBarColor(pct), borderRadius: "2px", transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ fontSize: "10px", letterSpacing: "0.08em", color: getStatusColor(pct), margin: 0, fontWeight: 500 }}>
                    {getStatusLabel(pct)}
                  </p>
                </div>}
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Small Category Card ───────────────────────────────────────────
function CategoryCard({ cat }) {
  const pct = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;

  return (
    <div style={{
      background: "#fff",
      borderRadius: "14px",
      padding: "14px 16px",
      border: "0.5px solid #e8e2db",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      flex: 1,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: pct >= 100 ? "rgba(192,57,43,0.08)" : "#f5f0eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: pct >= 100 ? "#C0392B" : ACCENT, flexShrink: 0,
        }}>{getCatIcon(cat.name)}</div>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#1a1714", flex: 1 }}>{cat.name}</span>
        <span style={{ fontSize: "11px", color: "#1a1714", fontWeight: 500, whiteSpace: "nowrap" }}>
          ₹{cat.spent.toLocaleString()}
          <span style={{ color: "#9a8e84", fontWeight: 400 }}> / ₹{cat.limit.toLocaleString()}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "#e8e2db", borderRadius: "2px", overflow: "hidden", marginBottom: "7px" }}>
        <div style={{
          height: "100%", width: `${Math.min(pct, 100)}%`,
          background: getBarColor(pct), borderRadius: "2px",
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Status */}
      <p style={{ fontSize: "9px", letterSpacing: "0.1em", color: getStatusColor(pct), margin: 0, fontWeight: 500 }}>
        {getStatusLabel(pct)}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
// transactions: [{amount, category, categoryId}] — from sheet state
// budgetData:   [{name, limitAmount, categoryId}] — from GET /api/sheets/:id/budget
// totalBudget:  number — from sheet data
export default function FinancialArchitecture({ transactions = [], budgetData = [], totalBudget = 0 }) {
  const [showModal, setShowModal] = useState(false);
  const categories = useMemo(() => {
    return budgetData.map(b => ({
      name: b?.name,
      categoryId: b?.categoryId,
      limit: parseFloat(b?.limitAmount) || 0,
      spent: transactions
        .filter(t => t?.category === b?.name || t?.categoryId === b?.categoryId)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    }));
  }, [transactions, budgetData]);

  const totalSpent = useMemo(() =>
    transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    [transactions]
  );

  let returns = transactions
    .filter((t: { people: any[]; }) => t.people?.find(p => p.name != "You"))
    .filter((t: { returnAmount: string; }) => parseFloat(t.returnAmount)>0)
    .reduce((sum: number, t: { returnAmount: string; }) => sum + parseFloat(t.returnAmount), 0);

  const noreturns = transactions
    .filter((t: { people: any[]; }) => t.people?.find(p => p.name === "N"))
    .filter((t: { returnAmount: string; }) => parseFloat(t.returnAmount)>0)
    .reduce((sum: number, t: { returnAmount: string; }) => sum + (parseFloat(t.returnAmount) || 0), 0);

  const owes = transactions
    .filter((t: { returnAmount: string; }) => parseFloat(t.returnAmount)<0)
    .reduce((sum: number, t: { returnAmount: string; }) => sum + (parseFloat(t.returnAmount) || 0), 0);

  const remaining = totalBudget - totalSpent;
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Top 3 by spend percentage — highest urgency first
  const top3 = [...categories]
    .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
    .slice(0, 3);

  if (!totalBudget || budgetData.length === 0) {
  const categorySpend = transactions.reduce((acc: Record<string, number>, t: any) => {
    const key = t.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + (parseFloat(t.amount) || 0);
    return acc;
  }, {});

  

  const cats = Object.entries(categorySpend)
    .map(([name, spent], i) => ({ id: i + 1, name, spent: spent as number }))
    .sort((a, b) => b.spent - a.spent)

  const topCats = cats
    .slice(0, 3);
  

  const emptySlots = Math.max(0, 3 - topCats.length);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f5f0ea", padding: "28px 32px", minHeight: "33vh", boxSizing: "border-box" }}>
        <p style={{ letterSpacing: "0.18em", fontSize: 10.5, color: "#9a8f84", fontWeight: 500, margin: "0 0 20px 0", textTransform: "uppercase" }}>
          Financial Architecture
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Left — total spend */}
          <div style={{ background: "#edeae4", borderRadius: 16, padding: "28px 30px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "#9a8f84", margin: "0 0 6px", textTransform: "uppercase", fontWeight: 500 }}>
                Total Spend
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, lineHeight: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#9a8f84", marginBottom: 8 }}>₹</span>
                <span style={{ fontSize: 80, fontWeight: 700, color: "#8B5E1A", letterSpacing: "-4px", lineHeight: 1 }}>
                  {totalSpent >= 1000 ? `${Math.round(totalSpent / 1000)}k` : Math.round(totalSpent)}
                </span>
              </div>
            </div>
            <div style={{display: "flex",
              gap: 32,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #d9d3cb",}}>
              <div>
                <p style={{ fontSize: 10, color: "#9a8f84", margin: "0 0 3px", letterSpacing: "0.04em" }}>Total Transactions Amount</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#2e2a24", margin: 0, letterSpacing: "-0.5px" }}>
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Owes
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(owes).toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Returns
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(returns).toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Actual Returns
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(returns-noreturns).toLocaleString()}
                </p>
              </div>

            </div>
            
          </div>

          {/* Right — top 3 category spend + view all */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {topCats.map(cat => (
              <div key={cat.id} style={{ background: "#edeae4", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#e0dbd2", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, flexShrink: 0 }}>
                    {getCatIcon(cat.name)}
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#2e2a24", flex: 1 }}>{cat.name}</span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#8B5E1A", margin: 0, letterSpacing: "-0.5px" }}>
                  ₹{cat.spent.toLocaleString()}
                </p>
                <p style={{ fontSize: 9, letterSpacing: "0.12em", color: "#9a8f84", margin: "6px 0 0", textTransform: "uppercase" }}>
                  TOTAL SPENT
                </p>
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} style={{ borderRadius: 14, background: "#edeae4", opacity: 0.3 }} />
            ))}

            <div
              onClick={() => setShowModal(true)}  // ← was missing onClick
              style={{ background: "#ede8e2", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer", border: "0.5px solid #ddd6ce", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e4ddd5")}
              onMouseLeave={e => (e.currentTarget.style.background = "#ede8e2")}
            >
              <div style={{ color: ACCENT }}><GridIcon /></div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#1a1714", margin: 0, textAlign: "center" }}>
                VIEW ALL CATEGORIES
              </p>
              {Object.keys(categorySpend).length > 3 && (
                <p style={{ fontSize: "10px", color: "#9a8e84", margin: 0 }}>+{Object.keys(categorySpend).length - 3} more</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <AllCategoriesModal
          categories={cats.map(c => ({ ...c, limit: 0 }))}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

  return (
    <>
      
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        background: "#f5f0ea",
        padding: "28px 32px",
        minHeight: "33vh",
        boxSizing: "border-box",
      }}>
        <p
        style={{
          letterSpacing: "0.18em",
          fontSize: 10.5,
          color: "#9a8f84",
          fontWeight: 500,
          margin: "0 0 20px 0",
          textTransform: "uppercase",
        }}
      >
        Financial Architecture
      </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div
            style={{
              background: "#edeae4",
              borderRadius: 16,
              padding: "28px 30px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "#9a8f84",
                  margin: "0 0 6px",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}>
                MONTHLY BUDGET SPENT
              </p>

              <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1  }}>
                <span style={{
                    fontSize: 80,
                    fontWeight: 700,
                    color: "#8B5E1A",
                    letterSpacing: "-4px",
                    lineHeight: 1,
                  }}>{totalPct}</span>
                <span style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#8B5E1A",
                    marginTop: 10,
                    marginLeft: 2,
                  }}>%</span>
              </div>
            </div>
              

            <div style={{
              display: "flex",
              gap: 32,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #d9d3cb",
            }}>
              <div>
                <p style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}>Total Capital Allocated</p>
                <p style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2e2a24",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}>
                  ₹{totalBudget.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Remaining
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(remaining).toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Owes
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(owes).toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Returns
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(returns).toLocaleString()}
                </p>
              </div>
              <div>
                <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Actual Returns
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                  ₹{Math.abs(returns-noreturns).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {top3[0] && <CategoryCard cat={top3[0]} />}
            {top3[1] && <CategoryCard cat={top3[1]} />}
            {top3[2] && <CategoryCard cat={top3[2]} />}
            <div
              onClick={() => setShowModal(true)}
              style={{
                background: "#ede8e2",
                borderRadius: "14px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "6px", cursor: "pointer",
                border: "0.5px solid #ddd6ce",
                flex: top3[2] ? 1 : 2,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#e4ddd5"}
              onMouseLeave={e => e.currentTarget.style.background = "#ede8e2"}
            >
              <div style={{ color: ACCENT }}><GridIcon /></div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "#1a1714", margin: 0, textAlign: "center" }}>
                VIEW ALL CATEGORIES
              </p>
              {categories.length > 3 && (
                <p style={{ fontSize: "10px", color: "#9a8e84", margin: 0 }}>
                  +{categories.length - 3} more
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AllCategoriesModal
          categories={categories}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}