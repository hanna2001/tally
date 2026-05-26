import { useState, useRef, useEffect } from "react";

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

type Props = {
  onCreate: (name: string) => Promise<void>;
};

export default function CreateCard({ onCreate }: Props) {
  const [hovered, setHovered] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const handleConfirm = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate(name.trim());
      setCreating(false);
      setName("");
    } catch (err: any) {
      alert("Failed to create: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCreating(false);
    setName("");
  };

  if (creating) {
    return (
      <div style={{
        background: "#fff",
        border: "2px solid #8C5A3C",
        borderRadius: "16px",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
      }}>
        {/* Badge */}
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

        {/* Inline name input styled like the card title */}
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") handleCancel(); }}
          placeholder="Sheet name..."
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 700, color: "#1a1714",
            border: "none", outline: "none",
            borderBottom: "1px solid #e8e2db",
            background: "transparent",
            width: "100%",
            padding: "0 0 8px",
            margin: "0 0 12px",
            lineHeight: 1.1,
          }}
        />

        <p style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
          color: "#1a1714", margin: "0 0 auto",
        }}>SETTING UP YOUR NEW JOURNAL</p>

        {/* Footer */}
        <div style={{ marginTop: "24px" }}>
          <p style={{ fontSize: "13px", color: "#bbb", margin: 0 }}>
            Press Enter to save
            <button
              onClick={handleCancel}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#8C5A3C", fontWeight: 700, fontSize: "13px",
                padding: 0, marginLeft: "6px",
              }}
            >CANCEL</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setCreating(true)}
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
        minHeight: "220px",
      }}
    >
      <div style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: hovered ? "#e8ddd4" : "#ede8e2",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#a07850", transition: "background 0.2s ease",
      }}>
        <PlusIcon />
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px", fontWeight: 500,
        color: "#8a7e74", letterSpacing: "0.01em",
      }}>
        New Journal
      </span>
      <span style={{
        fontSize: "11px", fontWeight: 600,
        letterSpacing: "0.1em", color: "#c4b8ae",
      }}>
        START FRESH ENTRY
      </span>
    </div>
  );
}