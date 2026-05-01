import { useState } from "react"; 
import { deleteTransaction } from "../services/transactionService";
import RecordTransaction from "./AddTransactionModal"; // CHANGES: import modal

export default function TransactionTable({transactions}) {
  // CHANGES: state for edit modal and delete confirmation
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [localTransactions, setLocalTransactions] = useState(transactions);

   const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      setDeletingId(id);
      await deleteTransaction(id);
      setLocalTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };
 
  if (transactions !== localTransactions && !editingTransaction) {
    setLocalTransactions(transactions);
  }


    return (
    <div className="px-10">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">RECENT ACTIVITY</h3>
        <div className="text-sm text-gray-500 tracking-widest">FILTER | EXPORT</div>
      </div>

      <div className="bg-transparent shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs tracking-widest text-gray-400 uppercase">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Return Amount</th>
                  <th className="p-4 text-left">People</th>
                  <th className="p-4 text-left">Method</th>
                  <th className="p-4 text-left"></th>
                </tr>
              </thead>

              <tbody>
                {localTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-200/50 last:border-none">
                    <td className="py-5">{new Date(t.date).toLocaleDateString()}</td>

                    <td className="py-5">{t.description}</td>

                    <td className="py-5 text-gray-500">{t.category}</td>

                    <td className="py-5 font-medium">
                      ₹{t.amount.toLocaleString()}
                    </td>

                    <td className="py-5">
                      ₹{t.returnAmount}
                    </td>

                    <td className="p-5 text-gray-500">{t.people}</td>

                    <td className="p-5 text-gray-500">{t.method}</td>

                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                          console.log("EDIT initialData:", JSON.stringify(t, null, 2)); // CHANGES: debug — remove after confirming shape
                          setEditingTransaction(t);
                        }}
                          className="text-xs font-semibold tracking-wide uppercase transition-colors"
                          style={{ color: "#C4894B" }}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="text-xs font-semibold tracking-wide uppercase transition-colors disabled:opacity-40"
                          style={{ color: "#ef4444" }}
                          title="Delete"
                        >
                          {deletingId === t.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        
      </div>
      {editingTransaction && (
        <RecordTransaction
          initialData={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={(updated) => {
            setLocalTransactions((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            );
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

