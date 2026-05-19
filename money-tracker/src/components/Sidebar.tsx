import { NavLink } from "react-router-dom";

export default function Sidebar() {

  const navItems = [
  { path: "/", label: "DASHBOARD" },
  { path: "/report", label: "REPORT" },
  { path: "/budgets", label: "BUDGETS" },
  { path: "/settings", label: "SETTINGS" },
];

  return (
    <div className="h-full p-6 flex flex-col justify-between">
      
      <div>
        <div className="mb-10">
          <h1 className="text-lg font-semibold text-[#8C5A3C]">
            THE LEDGER
          </h1>
          <p className="text-xs text-gray-400">
            FINANCIAL EDITORIAL
          </p>
        </div>

        <nav className="space-y-4 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
              `block text-left w-full
                ${isActive
                  ? "text-[#8C5A3C] font-medium"
                  : "text-gray-400"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}