import { useState } from "react";

const categories = [
  {
    id: 1,
    icon: "🍴",
    name: "Food & Dining",
    spent: 1240,
    cap: 1500,
    status: "82% OF MONTHLY CAP REACHED",
    pct: 82,
  },
  {
    id: 2,
    icon: "✈",
    name: "Travel & Leisure",
    spent: 890,
    cap: 2000,
    status: "44% OF MONTHLY CAP REACHED",
    pct: 44,
  },
  {
    id: 3,
    icon: "🏠",
    name: "Housing",
    spent: 3200,
    cap: 3200,
    status: "CAP FULLY UTILIZED",
    pct: 100,
    full: true,
  },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProgressBar({ pct, full }: { pct: number; full?: boolean }) {
  return (
    <div
      style={{
        height: 3,
        background: "#e8e3dc",
        borderRadius: 2,
        marginTop: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: full ? "#8B4513" : "#b07035",
          borderRadius: 2,
          transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

export default function FinancialArchitecture() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        background: "#f5f0ea",
        padding: "28px 32px",
        minHeight: "33vh",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
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
        {/* LEFT — Big spend card */}
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
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "#9a8f84",
                margin: "0 0 6px",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Monthly Budget Spent
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}>
              <span
                style={{
                  fontSize: 80,
                  fontWeight: 700,
                  color: "#8B5E1A",
                  letterSpacing: "-4px",
                  lineHeight: 1,
                }}
              >
                64
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#8B5E1A",
                  marginTop: 10,
                  marginLeft: 2,
                }}
              >
                %
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #d9d3cb",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "#9a8f84",
                  margin: "0 0 3px",
                  letterSpacing: "0.04em",
                }}
              >
                Total Capital Allocated
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2e2a24",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                ₹{fmt(12450)}
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
                ₹{fmt(4482)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: "#edeae4",
                borderRadius: 14,
                padding: "16px 16px 14px",
                cursor: "default",
                transition: "box-shadow 0.2s",
                boxShadow:
                  hovered === cat.id ? "0 4px 18px rgba(120,80,20,0.10)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      fontSize: 13,
                      background: "#e0dbd2",
                      borderRadius: 7,
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {cat.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#2e2a24",
                      letterSpacing: "-0.1px",
                    }}
                  >
                    {cat.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#2e2a24",
                    whiteSpace: "nowrap",
                    marginLeft: 4,
                  }}
                >
                  ${cat.spent.toLocaleString()} /{" "}
                  <span style={{ color: "#9a8f84", fontWeight: 400 }}>
                    ${cat.cap.toLocaleString()}
                  </span>
                </span>
              </div>
              <ProgressBar pct={cat.pct} full={cat.full} />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  color: cat.full ? "#8B5E1A" : "#9a8f84",
                  margin: "7px 0 0",
                  textTransform: "uppercase",
                  fontWeight: cat.full ? 600 : 400,
                }}
              >
                {cat.status}
              </p>
            </div>
          ))}

          {/* View All Categories tile */}
          <div
            onMouseEnter={() => setHovered(99)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === 99 ? "#e5e0d8" : "#e8e3db",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: "pointer",
              transition: "background 0.18s, box-shadow 0.18s",
              boxShadow: hovered === 99 ? "0 4px 18px rgba(120,80,20,0.10)" : "none",
              padding: "16px",
            }}
          >
            {/* Grid icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#b07035" />
              <rect x="13" y="2" width="7" height="7" rx="1.5" fill="#b07035" />
              <rect x="2" y="13" width="7" height="7" rx="1.5" fill="#b07035" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" fill="#b07035" />
            </svg>
            <p
              style={{
                fontSize: 9.5,
                letterSpacing: "0.15em",
                color: "#8B5E1A",
                fontWeight: 700,
                textTransform: "uppercase",
                margin: 0,
                textAlign: "center",
              }}
            >
              View All
              <br />
              Categories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}