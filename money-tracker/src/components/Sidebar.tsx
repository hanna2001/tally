import { useState } from "react";

export default function Sidebar({ onAdd }) {
  return (
    <div className="h-full p-6 flex flex-col justify-between">
      
      <div>
        <div className=" mb-10">
          <h1 className="text-lg font-semibold text-[#8C5A3C]">THE LEDGER</h1>
          <p className="text-xs text-gray-400">FINANCIAL EDITORIAL</p>
        </div>
        

        <nav className="space-y-4 text-sm text-[#8C5A3C]">
          <p className="font-medium">DASHBOARD</p>
          <p className="text-gray-400">REPORT</p>
          <p className="text-gray-400">BUDGETS</p>
          <p className="text-gray-400">SETTINGS</p>
        </nav>
      </div>

      <div className="border-b-[#8C5A3C]-600">
        <button onClick={onAdd} className="bg-transparent text-sm text-[#8C5A3C] p-4 rounded-xl">
        +  TRANSACTION
      </button>
      </div>
      

    </div>
  );
}