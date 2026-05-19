import { useState,useEffect } from "react"; 
import { deleteTransaction } from "../services/transactionService";
import RecordTransaction from "./AddTransactionModal"; // CHANGES: import modal

export default function TransactionTable({sheetname,transactions,setTransactions,setModal}) {

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this transaction?")) return;
  try {
    setDeletingId(id);
    await deleteTransaction(sheetname, id);
    setTransactions((prev) => prev.filter((t) => String(t.id) !== String(id)));
  } catch (err) {
    alert("Failed to delete: " + err.message);
  } finally {
    setDeletingId(null);
  }
};
 
  useEffect(() => {
  if (!editingTransaction) {

  }
}, [transactions, editingTransaction]);

  const formatPeople = (people)=>{
  return people?.map(p => `${p.name} (₹${p.owes})`)
          .join(", ")

  }

    return (
    <div className="px-10">

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">RECENT ACTIVITY</h3>
        <div className="text-sm text-gray-500 tracking-widest">
          <button
                    onClick={() => setModal(true)}
                    className=" bg-transparent text-sm text-[#8C5A3C] p-4 rounded-xl border border-[#8C5A3C]/20 hover:bg-[#8C5A3C]/10"
                  >
                    + TRANSACTION
                  </button>
        </div>
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
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-200/50 last:border-none ">
                    <td className="py-5">{new Date(t.date).toLocaleDateString()}</td>

                    <td className="py-5">{t.description}</td>

                    <td className="py-5 text-gray-500">{t.category}</td>

                    <td className="py-5 font-medium">
                      ₹{t.amount.toLocaleString()}
                    </td>

                    <td className="py-5">
                      ₹{t.returnAmount}
                    </td>

                    <td className="p-5 text-gray-500">{formatPeople(t.people)}</td>

                    <td className="p-5 text-gray-500">{t.method}</td>

                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
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
          sheetName={sheetname}
          initialData={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={(updated) => {
            const normalized = {
              ...updated,
              amount: Number(updated.amount),
              returnAmount: Number(updated.returnAmount || 0),

              people: (updated.people || []).map((p) => ({
                ...p,
                owes: Number(p.owes),
              })),
            };
            setTransactions((prev) =>
              prev.map((t) =>
                String(t.id) === String(normalized.id)
                  ? { ...t, ...normalized }
                  : t
              )
            );

            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

