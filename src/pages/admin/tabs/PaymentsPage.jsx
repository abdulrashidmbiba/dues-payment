import { useState, useEffect, useMemo } from "react";
import { getAllPayments } from "../../../lib/api";
import { useToast } from "../../../context/ToastContext";
import { Search } from "lucide-react";

const statusStyle = {
  success: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  failed:  "bg-red-50 text-red-700",
};

export default function PaymentsPage() {
  const { toastError } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllPayments();
        setPayments(data);
      } catch (err) {
        toastError(err.message || "Could not load payments.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      p.profiles?.full_name?.toLowerCase().includes(q) ||
      p.profiles?.member_id?.toLowerCase().includes(q) ||
      p.receipt_number?.toLowerCase().includes(q)
    );
  }, [payments, query]);

  const totalSuccess = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-400 mt-0.5">{payments.length} total transactions.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-2 text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Total Collected</p>
            <p className="text-lg font-extrabold text-green-700">GHS {totalSuccess}</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member or receipt no."
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm w-full sm:w-64 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-400 p-6 text-center">Loading payments...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">No payments found.</p>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Member</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Receipt No.</th>
                <th className="text-left px-5 py-3 font-semibold">Amount</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(p.paid_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{p.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{p.profiles?.member_id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{p.dues_categories?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{p.receipt_number ?? "—"}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">GHS {p.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[p.status] ?? statusStyle.pending}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}