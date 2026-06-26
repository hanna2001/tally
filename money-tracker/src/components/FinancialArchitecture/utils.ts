export const ACCENT = "#8C5A3C";

export function getBarColor(pct: number) {
  if (pct >= 100) return "#C0392B";
  if (pct >= 80) return "#D4813A";
  return ACCENT;
}

export function getStatusLabel(pct: number) {
  if (pct >= 100) return "CAP FULLY UTILIZED";
  return `${Math.round(pct)}% OF MONTHLY CAP REACHED`;
}

export function getStatusColor(pct: number) {
  if (pct >= 100) return "#C0392B";
  if (pct >= 80) return "#D4813A";
  return "#9a8e84";
}

export function getCatIconKey(name = ""): string {
  const key = name.toLowerCase();
  const map: Record<string, string> = {
    food: "food", dining: "food", lunch: "food", restaurant: "food",
    travel: "travel", trip: "travel", flight: "travel",
    housing: "home", rent: "home", home: "home", bills: "home",
    shopping: "shopping", shop: "shopping",
  };
  for (const k in map) {
    if (key.includes(k)) return map[k];
  }
  return "grid";
}