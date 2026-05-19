import { useState } from "react";

interface Collection {
  id: number;
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const collections: Collection[] = [
  {
    id: 1,
    category: "DAILY EXPENSES",
    title: "Personal Ledger",
    description: "Active tracking for daily discretionary spending and lifestyle maintenance.",
    icon: <PersonIcon />,
  },
  {
    id: 2,
    category: "OPERATIONS",
    title: "Business 2024",
    description: "Strategic financial oversight for Sienna Folio LLC operational costs.",
    icon: <BriefcaseIcon />,
  },
  {
    id: 3,
    category: "GLOBAL MARKETS",
    title: "Investment Portfolio",
    description: "Long-term wealth accumulation and diversified asset management tracking.",
    icon: <TrendingIcon />,
  },
];

const CollectionCard = ({ collection }: { collection: Collection }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid #e8e2db",
        borderRadius: "16px",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        cursor: "pointer",
        transition: "box-shadow 0.25s ease, transform 0.2s ease",
        boxShadow: hovered
          ? "0 8px 32px rgba(160, 130, 100, 0.13)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        minHeight: "280px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background tint on hover */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(180,155,120,0.04) 0%, transparent 60%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
        borderRadius: "16px",
        pointerEvents: "none",
      }} />

      {/* Category Label + Icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: "#f3ede6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a07850",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}>
          {collection.icon}
        </div>
        <span style={{
          fontSize: "11px",
          fontFamily: "'DM Mono', 'Courier New', monospace",
          letterSpacing: "0.12em",
          color: "#b0a090",
          fontWeight: 500,
          textTransform: "uppercase",
        }}>
          {collection.category}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "26px",
        fontWeight: 700,
        color: "#1a1714",
        margin: "0 0 12px",
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
      }}>
        {collection.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        color: "#8a7e74",
        lineHeight: 1.65,
        margin: 0,
        flex: 1,
      }}>
        {collection.description}
      </p>

      {/* Divider */}
      <div style={{
        height: "1px",
        background: "#ede8e2",
        margin: "24px 0 18px",
      }} />

      {/* View Sheets Link */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: hovered ? "#8a5c35" : "#b07040",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13.5px",
        fontWeight: 500,
        letterSpacing: "0.01em",
        transition: "color 0.2s ease",
      }}>
        <span>View Sheets</span>
        <span style={{
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.2s ease",
          display: "flex",
          alignItems: "center",
        }}>
          <ChevronRight />
        </span>
      </div>
    </div>
  );
};

const CreateCard = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1.5px dashed #d4ccc4",
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        cursor: "pointer",
        background: hovered ? "rgba(180,155,120,0.04)" : "transparent",
        transition: "background 0.2s ease, border-color 0.2s ease",
        borderColor: hovered ? "#b09070" : "#d4ccc4",
        minHeight: "200px",
      }}
    >
      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: hovered ? "#e8ddd4" : "#ede8e2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#a07850",
        transition: "background 0.2s ease",
      }}>
        <PlusIcon />
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        color: "#8a7e74",
        letterSpacing: "0.01em",
      }}>
        Create New Collection
      </span>
    </div>
  );
};

export default function Collections() {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        background: "#f7f2ec",
        padding: "48px 40px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "36px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "34px",
              fontWeight: 700,
              color: "#1a1714",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}>
             Collections
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: "#9a8f85",
              margin: 0,
            }}>
              Curated ledgers for your specific lifestyle goals.
            </p>
          </div>

          <button style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#b07040",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13.5px",
            fontWeight: 500,
            padding: "6px 0",
            letterSpacing: "0.01em",
          }}>
            View All Collections
            <ChevronRight />
          </button>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
          <CreateCard />
        </div>
      </div>
    </>
  );
}