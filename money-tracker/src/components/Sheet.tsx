
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
            setTransactions(res);

                
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
              setTransactions((prev) => [ ...prev,newTx]);
              // setShowModal(false);
            }}
          />
       )}
    </>
  );
}