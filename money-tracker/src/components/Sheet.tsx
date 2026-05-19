
import Overview from "./Overview";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadTransactions } from "../services/transactionService"; 
import TransactionTable from "./TransactionTable";
import PaymentMethodOverview from "./PaymentMethodOverview";
import AddTransactionModal from "./AddTransactionModal";


export default function Sheet() {

  const location = useLocation();
  const { sheetName } = location.state || {};
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
        async function fetchData() {
        try {
            const res = await loadTransactions(sheetName);
    
    
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
            
            setTransactions(cleaned);
                
        } catch (error) {
            
        }
        
        
        }
    
        fetchData();
    }, []);
  return (
    <>
      <Overview transactions={transactions}/>
      <TransactionTable sheetname={sheetName} transactions={transactions} setTransactions={setTransactions} setModal={setShowModal} />
      <div>
      </div>
      <PaymentMethodOverview transactions={transactions}/>
      {showModal && (
          <AddTransactionModal
            sheetName={sheetName}
            onClose={() => setShowModal(false)}
            onSaved={(newTx: any) => {
              // const cleaned = {
              //     id: newTx.id,
              //     date: newTx.date,
              //     description: newTx.description,
              //     category: newTx.category,
              //     amount: Number(newTx.amount),
              //     method: newTx.method,
              //     returnAmount: Number(newTx.returnAmount || 0),
              //     people: (newTx.people || []).map((p) => ({
              //       ...p,
              //       owes: Number(p.owes),
              //     })),
              //   };
              setTransactions((prev) => [ ...prev,newTx]);
              // setShowModal(false);
            }}
          />
       )}
    </>
  );
}