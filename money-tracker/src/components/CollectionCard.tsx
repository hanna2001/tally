
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
 sheet : { name: string}
}

export default function CollectionCard ({ sheet }:Props) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={()=>navigate("/sheet", {state: { sheetName: sheet.name }})}
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
        minHeight: "200px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(180,155,120,0.04) 0%, transparent 60%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
        borderRadius: "16px",
        pointerEvents: "none",
      }} />


      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "26px",
        fontWeight: 700,
        color: "#1a1714",
        margin: "0 0 12px",
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
      }}>
        {sheet.name}
      </h3>

    </div>
  );
};