import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Sheet from "./components/Sheet";
import Settings from "./components/Settings";


export default function App() {

  return (
    <div className="flex bg-[#f5efe6]" style={{minHeight: "100vh"}} >
      <aside className="w-64 bg-[#efe7dc]">
        <Sidebar/>
          
      </aside>

      <main className="flex-1">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<Dashboard />} />
          <Route path="/budgets" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sheet" element={<Sheet />}/>
       </Routes>
       
      </main>
    </div>
  );
}
