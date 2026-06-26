
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadTransactions,getBudgetSummary } from "../services/transactionService"; 
import { getBudget } from "../services/sheetService"; 
import TransactionTable from "./TransactionTable";
import PaymentMethodOverview from "./PaymentMethodOverview";
import AddTransactionModal from "./AddTransactionModal";
import FinancialArchitecture from "./FinancialArchitecture/";


export default function Sheet() {
  const location = useLocation();
  const sheetName = location.state.sheetName || {};
  const sheetId = location.state.sheetId || {};
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null); 
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [page, setPage] = useState(1);

  async function fetchTransactions(p = 1) {
    try {
      const res = await loadTransactions(sheetId, p);
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
        
        
  }

  async function fetchSummary() {
    try {
      const res = await getBudgetSummary(sheetId);
      setSummary(res);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchTransactions(page);
    fetchSummary()
  }, [page]);  

  return (
    <>
      <FinancialArchitecture summary={summary} />
      <TransactionTable
        sheetname={sheetName}
        sheetId={sheetId}  
        transactions={transactions}
        setTransactions={setTransactions}
        setModal={setShowModal}
      />

      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0" }}>
        <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>

      <PaymentMethodOverview transactions={transactions} />

      {showModal && (
        <AddTransactionModal
          sheetId={sheetId}
          sheetName={sheetName}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            fetchTransactions(page);
            fetchSummary();
          }}
        />
      )}
    </>
  );
}