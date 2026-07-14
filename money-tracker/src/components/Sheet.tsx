import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadTransactions, getBudgetSummary } from "../services/transactionService";
import AddTransactionModal from "./AddTransactionModal";
import FinancialArchitecture from "./FinancialArchitecture/";
import TransactionTable from "./TransactionTable";

export default function Sheet() {
  const location = useLocation();
  const sheetName = location.state.sheetName || {};
  const sheetId = location.state.sheetId || {};

  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: null, search: null });

  async function fetchTransactions(p = 1, f = filters) {
    try {
      const res = await loadTransactions(sheetId, p, 20, f);
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
    fetchTransactions(page, filters);
    fetchSummary();
  }, [page, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <>
      <FinancialArchitecture summary={summary} />

      <TransactionTable
        sheetname={sheetName}
        sheetId={sheetId}
        transactions={transactions}
        setTransactions={setTransactions}
        setModal={setShowModal}
        pagination={pagination}
        page={page}
        setPage={setPage}
        filters={filters}
        onFilterChange={handleFilterChange}
        summary={summary}
        onMutated={() => {
          fetchTransactions(page, filters);
          fetchSummary();
        }}
      />

      {showModal && (
        <AddTransactionModal
          sheetId={sheetId}
          sheetName={sheetName}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            fetchTransactions(page, filters);
            fetchSummary();
          }}
        />
      )}
    </>
  );
}


