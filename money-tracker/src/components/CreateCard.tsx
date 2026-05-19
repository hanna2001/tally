import { useState } from "react";

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);


type Props = {
    onCreate: Function
}

export default function CreateCard({onCreate}:Props) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={async () => {  await onCreate();}}
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
        Create New Sheet
      </span>
    </div>
  );
};