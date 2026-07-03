import { useState, useEffect } from "react";
import { getAllPayments, approvePayment, rejectPayment } from "../../../lib/api";
import { useToast } from "../../../context/ToastContext";
import { CheckCircle2, XCircle, Loader2, Inbox } from "lucide-react";

export default function ApprovalsPage({ onPendingCountChange }) {
  const { toastSuccess, toastError } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const all = await getAllPayments();
      setPending(all.filter((p) => p.status === "pending"));
    } catch (err) {
      toastError(err.message || "Could not load pending payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await approvePayment(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
      onPendingCountChange?.();
      toastSuccess("Payment approved.");
    } catch (err) {
      toastError(err.message || "Could not approve payment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await rejectPayment(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
      onPendingCountChange?.();
      toastSuccess("Payment rejected.");
    } catch (err) {
      toastError(err.message || "Could not reject payment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-400 mt-0.5">Payments awaiting manual review.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-400 p-6 text-center">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Inbox size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">Nothing waiting on approval</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Paystack payments confirm instantly, so this queue only fills up if a payment is
              manually marked pending — for example a reported bank transfer awaiting verification.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.profiles?.full_name ?? "Unknown member"}</p>
                  <p className="text-xs text-gray-400">
                    {p.dues_categories?.name ?? "Dues Payment"} · GHS {p.amount} · {new Date(p.paid_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={busyId === p.id}
                  className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 px-3 py-1.5 rounded-lg transition"
                >
                  {busyId === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(p.id)}
                  disabled={busyId === p.id}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 px-3 py-1.5 rounded-lg transition"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}