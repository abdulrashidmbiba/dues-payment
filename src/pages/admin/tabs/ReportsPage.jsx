import { useState, useEffect } from "react";
import { getTreasurerStats, getAllMembers, getAllPayments } from "../../../lib/api";
import { Download, FileText } from "lucide-react";

function downloadCsv(filename, rows) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, m, p] = await Promise.all([getTreasurerStats(), getAllMembers(), getAllPayments()]);
        setStats(s);
        setMembers(m);
        setPayments(p);
      } catch (err) {
        setError(err.message || "Could not load report data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const exportMembersCsv = () => {
    const rows = [
      ["Member ID", "Full Name", "Email", "Program", "Level", "Role", "Joined"],
      ...members.map((m) => [m.member_id, m.full_name, m.email, m.program, m.level, m.role, m.created_at]),
    ];
    downloadCsv("nexispay-members.csv", rows);
  };

  const exportPaymentsCsv = () => {
    const rows = [
      ["Date", "Member", "Member ID", "Category", "Amount", "Status", "Receipt No."],
      ...payments.map((p) => [
        p.paid_at, p.profiles?.full_name, p.profiles?.member_id,
        p.dues_categories?.name, p.amount, p.status, p.receipt_number,
      ]),
    ];
    downloadCsv("nexispay-payments.csv", rows);
  };

  const collectionPercent = stats && stats.totalMembers > 0
    ? Math.round((stats.membersPaid / stats.totalMembers) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Summary stats and exportable data.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">GHS {stats.totalCollected}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Outstanding Dues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.membersUnpaid} members</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{collectionPercent}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-green-700" />
              <h2 className="font-bold text-gray-900">Export Data</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportMembersCsv}
                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-lg transition"
              >
                <Download size={15} /> Export Members (CSV)
              </button>
              <button
                onClick={exportPaymentsCsv}
                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-lg transition"
              >
                <Download size={15} /> Export Payments (CSV)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}