import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./components/Overview";
import TransactionTable from "./components/TransactionTable";
import AddTransactionModal from "./components/AddTransactionModal";

import { useEffect, useState } from "react";
import { loadTransactions } from "./services/transactionService"; 
import PaymentMethodOverview from "./components/PaymentMethodOverview";



export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);



  useEffect(() => {
  console.log("hiii");
  async function fetchData() {
    
    
    const res = await loadTransactions();


    const cleaned = res.map((t) => {
    const amount = Number(t.amount);

    const participants = t.participants || [];
    return {
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.category,
      amount,
      method: t.method,
      returnAmount: t.return,
      people: participants
    };
  });
    console.log("cleaned:",cleaned);
    
    setTransactions(cleaned);
  }

  fetchData();
}, []);

  return (
    <div className="flex h-screen bg-[#f5efe6]">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#efe7dc]">
        <Sidebar onAdd={() => setShowModal(true)} />
          
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Header />
        <Overview transactions={transactions} />
        <TransactionTable transactions={transactions} />
        <PaymentMethodOverview transactions={transactions} />
        {showModal && (
          <AddTransactionModal
            onClose={() => setShowModal(false)}
            // onAdd={(newTx) =>
            //   setTransactions((prev) => [newTx, ...prev])
            // }
          />
        )}
      </main>

    </div>
    
  );
}