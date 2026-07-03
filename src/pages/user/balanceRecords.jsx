import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPaymentHistory } from "../../lib/api";
import Sidebar from "../../componenets/shared/Sidebar";
import { Printer, X } from "lucide-react";

export default function BalanceRecords() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await getPaymentHistory(user.id);
        setPayments(data);
      } catch (err) {
        setError(err.message || "Could not load payment history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const totalPaid = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar active="History" />

      <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-500 mt-0.5">Every dues payment you've made, with receipts.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Paid</p>
            <p className="text-xl font-extrabold text-green-700">GHS {totalPaid}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {loading ? (
            <p className="text-sm text-gray-400 p-6 text-center">Loading history...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-400 p-6 text-center">No payments yet.</p>
          ) : (
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-semibold">Date</th>
                  <th className="text-left px-6 py-3 font-semibold">Category</th>
                  <th className="text-left px-6 py-3 font-semibold">Receipt No.</th>
                  <th className="text-left px-6 py-3 font-semibold">Amount</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{p.dues_categories?.name ?? "Dues Payment"}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{p.receipt_number ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">GHS {p.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full
                        ${p.status === "success" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {p.status === "success" ? "Paid" : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === "success" && (
                        <button
                          onClick={() => setActiveReceipt(p)}
                          className="text-xs font-semibold text-green-700 hover:underline"
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── RECEIPT MODAL ── */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Receipt</h3>
            <div id="receipt-printable" className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Receipt No.</span>
                <span className="font-semibold text-gray-800">{activeReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold text-gray-800">{new Date(activeReceipt.paid_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Member</span>
                <span className="font-semibold text-gray-800">{user?.full_name} ({user?.member_id})</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold text-gray-800">{activeReceipt.dues_categories?.name}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-500 font-semibold">Amount Paid</span>
                <span className="font-bold text-green-700">GHS {activeReceipt.amount}</span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}