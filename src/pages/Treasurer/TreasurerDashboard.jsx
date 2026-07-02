import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTreasurerStats } from "../../lib/api";
import { LogOut } from "lucide-react";

function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function TreasurerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getTreasurerStats();
        setStats(data);
      } catch (err) {
        setError(err.message || "Could not load treasurer stats.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const maxMonth = stats?.monthlyBreakdown?.length
    ? Math.max(...stats.monthlyBreakdown.map((m) => m.amount))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 bottom-0 z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">NexisPay</p>
              <p className="text-xs text-green-600 font-semibold mt-0.5">TREASURER</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-4">
          <p className="text-sm text-gray-500">Welcome, {user?.full_name ?? "Treasurer"}</p>
        </div>
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Treasurer Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Collections and outstanding dues at a glance.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon="💰" iconBg="bg-green-50" label="Total Money Collected" value={`GHS ${stats.totalCollected}`} />
              <StatCard icon="✅" iconBg="bg-blue-50" label="Members Paid" value={stats.membersPaid} sub={`of ${stats.totalMembers} total`} />
              <StatCard icon="⏳" iconBg="bg-red-50" label="Members Unpaid" value={stats.membersUnpaid} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Monthly Collections</h2>
              {stats.monthlyBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">No payments recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.monthlyBreakdown.map((m) => (
                    <div key={m.month} className="flex items-center gap-4">
                      <span className="w-20 text-xs text-gray-500 shrink-0">{m.month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: maxMonth ? `${(m.amount / maxMonth) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-24 text-right text-xs font-semibold text-gray-700 shrink-0">GHS {m.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
