import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSheet } from "../services/sheetService"; // adjust import path

type Props = {
  sheet: { name: string; status?: "ongoing" | "creating" | "statement" };
  onDeleted?: (name: string) => void;
  onCancel?: () => void;
};

export default function CollectionCard({ sheet, onDeleted, onCancel }: Props) {
  const [hovered, setHovered] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const confirmRef = useRef<HTMLDivElement>(null);

  const isCreating = sheet.status === "creating";

  const subtitleMap = {
    statement: "MONTHLY STATEMENT",
    ongoing: "ONGOING LEDGER",
    creating: "SETTING UP YOUR NEW JOURNAL",
  };
  const subtitle = subtitleMap[sheet.status ?? "ongoing"];

  // Close confirmation if clicked outside
  useEffect(() => {
    if (!confirming) return;
    const handler = (e: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [confirming]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeleting(true);
      await deleteSheet(sheet.name);
      onDeleted?.(sheet.name);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirming(false); }}
      onClick={() => { if (!isCreating && !confirming) navigate("/sheet", { state: { sheetName: sheet.name ,sheetId:sheet.id} }); }}
      style={{
        background: "#fff",
        border: isCreating ? "2px solid #8C5A3C" : "1px solid #e8e2db",
        borderRadius: "16px",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: isCreating ? "default" : "pointer",
        transition: "box-shadow 0.25s ease, transform 0.2s ease",
        boxShadow: hovered && !isCreating ? "0 8px 32px rgba(160,130,100,0.13)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered && !isCreating ? "translateY(-2px)" : "translateY(0)",
        minHeight: "220px",
        position: "relative",
      }}
    >
      {/* Delete button — shown on hover */}
      {!isCreating && hovered && (
        <div
          ref={confirmRef}
          style={{ position: "absolute", top: "14px", right: "14px" }}
          onClick={e => e.stopPropagation()}
        >
          {!confirming ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              DELETE
            </button>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff",
              border: "1px solid #e8e2db",
              borderRadius: "10px",
              padding: "6px 10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}>
              <span style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap" }}>Sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "..." : "YES"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 6px",
                  cursor: "pointer",
                }}
              >
                NO
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creating badge */}
      {isCreating && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{
            background: "#8C5A3C", color: "#fff",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
            padding: "4px 10px", borderRadius: "6px",
          }}>CREATING</span>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "#8C5A3C", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {!isCreating && <div style={{ height: "40px" }} />}

      {/* Name */}
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "clamp(22px, 4vw, 32px)",
        fontWeight: 700, color: "#1a1714",
        margin: "0 0 10px", lineHeight: 1.1, letterSpacing: "-0.01em",
      }}>
        {sheet.name}
      </h3>

      <div style={{ borderTop: "1px solid #e8e2db", margin: "8px 0 12px" }} />

      <p style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
        color: isCreating ? "#1a1714" : "#8C5A3C", margin: "0 0 auto",
      }}>
        {subtitle}
      </p>

      {/* Footer */}
      <div style={{ marginTop: "24px" }}>
        {isCreating ? (
          <p style={{ fontSize: "13px", color: "#bbb", margin: 0 }}>
            Modified 2m ago
            <button
              onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#8C5A3C", fontWeight: 700, fontSize: "13px", padding: 0, marginLeft: "2px",
              }}
            >CANCEL</button>
          </p>
        ) : (
          <p style={{
            fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em",
            color: "#1a1714", margin: 0, display: "flex", alignItems: "center", gap: "6px",
          }}>
            VIEW LEDGER <span style={{ fontSize: "16px" }}>→</span>
          </p>
        )}
      </div>
    </div>
  );
}