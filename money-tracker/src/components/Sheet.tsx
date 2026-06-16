
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadTransactions } from "../services/transactionService"; 
import { getBudget } from "../services/sheetService"; 
import TransactionTable from "./TransactionTable";
import PaymentMethodOverview from "./PaymentMethodOverview";
import AddTransactionModal from "./AddTransactionModal";
import FinancialArchitecture from "./FinancialArchitecture";


export default function Sheet() {


  const location = useLocation();
  const sheetName  = location.state.sheetName || {};
  const sheetId  = location.state.sheetId || {};
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  
  useEffect(() => {
    
        async function fetchData() {
          try {
              const res = await loadTransactions(sheetName);
              setTransactions(res);

                  
          } catch (error) {
              
          }
        
        
        }

        async function fetchBudgetData(sheetId){
          try {
            const res = await getBudget(sheetId);
            setBudgetData(res);
          } catch (error) {
              
          }
        }


    
        fetchData();
        fetchBudgetData(sheetId);
    }, []);
  return (
    <>
      <FinancialArchitecture transactions={transactions} budgetData={budgetData} totalBudget={36000}/>
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