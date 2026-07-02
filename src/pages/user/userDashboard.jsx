import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMemberPaymentStatus, getPaymentHistory, getCommunityProjects } from "../../lib/api";
import {
  LayoutDashboard, CreditCard, History, Leaf,
  Award, Bell, Settings, LogOut, Trophy
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, to: "/dashboard" },
  { label: "Pay Dues",      icon: CreditCard,       to: "/dashboard/pay" },
  { label: "History",       icon: History,          to: "/dashboard/history" },
  { label: "Impact",        icon: Leaf,             to: "/dashboard" },
  { label: "Badges",        icon: Award,            to: "/dashboard" },
  { label: "Notifications", icon: Bell,             to: "/dashboard" },
  { label: "Settings",      icon: Settings,         to: "/dashboard" },
];

// Badges are static for now — see SETUP.md, cut for tonight's deadline.
const badges = [
  { label: "EARLY BIRD", icon: "🏅", unlocked: true },
  { label: "CONSISTENT", icon: "⭐", unlocked: true },
  { label: "IMPACT MAKER", icon: "🚀", unlocked: true },
  { label: "LOCKED",      icon: "🔒", unlocked: false },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active] = useState("Dashboard");

  const [status, setStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;

    (async () => {
      try {
        const [statusData, historyData, projectsData] = await Promise.all([
          getMemberPaymentStatus(user.id),
          getPaymentHistory(user.id),
          getCommunityProjects(),
        ]);
        if (!active) return;
        setStatus(statusData);
        setRecentPayments(historyData.slice(0, 3));
        setProjects(projectsData.slice(0, 2));
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user?.id]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] ?? "Member";
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ME";

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── SIDEBAR ── */}
      <aside className="w-48 bg-gray-900 flex flex-col py-6 px-4 shrink-0">
        <h1 className="text-lg font-bold mb-8 px-2">
          <span className="text-green-400">Nexis</span>
          <span className="text-yellow-400">Pay</span>
        </h1>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${active === label
                  ? "bg-green-800 text-white border-l-4 border-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {greeting}, {firstName} 👋
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.program && user?.level ? `${user.level} · ${user.program}` : "Here's your payment summary."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Bell size={16} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-4 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.full_name ?? "Member"}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400 py-12 text-center">Loading your dashboard...</div>
        ) : (
          <>
            {/* Deadline banner */}
            {status && !status.isPaid && status.daysUntilDue !== null && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold text-sm">!</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Your dues deadline is in {status.daysUntilDue} day{status.daysUntilDue !== 1 ? "s" : ""}.
                    </p>
                    <p className="text-xs text-gray-500">Avoid late payment penalties by settling your balance today.</p>
                  </div>
                </div>
                <Link
                  to="/dashboard/pay"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full transition"
                >
                  Pay Now
                </Link>
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-5 mb-6">
              {/* Payment Status */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Status</p>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status?.isPaid ? "bg-green-50" : "bg-red-50"}`}>
                    <div className={`w-3 h-3 rounded-full ${status?.isPaid ? "bg-green-400" : "bg-red-400"}`} />
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
                  ${status?.isPaid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  <span className={`w-2 h-2 rounded-full inline-block ${status?.isPaid ? "bg-green-500" : "bg-red-500"}`} />
                  {status?.isPaid ? "PAID" : "NOT PAID"}
                </span>
                <p className="text-xs text-gray-400 mt-2">Current Semester</p>
              </div>

              {/* Next Due Date */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Due Date</p>
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-red-500 text-sm">📅</span>
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {status?.daysUntilDue ?? "—"} <span className="text-base font-medium text-gray-500">days remaining</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {status?.nextDueDate ? `Next payment: ${new Date(status.nextDueDate).toLocaleDateString()}` : "No dues scheduled"}
                </p>
              </div>

              {/* Total Paid */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Paid</p>
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <span className="text-green-600 text-sm">💳</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">GHS {status?.totalPaid ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">Across all contributions</p>
              </div>
            </div>

            {/* Annual Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Annual Dues Progress</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tracking your total contributions</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-yellow-500">{status?.percentPaid ?? 0}%</p>
                  <p className="text-xs text-gray-400">GHS {status?.totalPaid ?? 0} of GHS {status?.totalDue ?? 0} goal</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-yellow-400 h-3 rounded-full transition-all" style={{ width: `${status?.percentPaid ?? 0}%` }} />
              </div>
            </div>

            {/* Recent Payments + Badges */}
            <div className="grid grid-cols-3 gap-5 mb-6">
              {/* Recent Payments */}
              <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Payments</h3>
                  <Link to="/dashboard/history" className="text-sm text-green-700 font-semibold hover:underline">View All</Link>
                </div>
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No payments yet. Head to Pay Dues to get started.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="text-left pb-3 font-semibold">Date</th>
                        <th className="text-left pb-3 font-semibold">Description</th>
                        <th className="text-left pb-3 font-semibold">Amount</th>
                        <th className="text-left pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 text-gray-400 text-xs">{new Date(p.paid_at).toLocaleDateString()}</td>
                          <td className="py-3 text-gray-700 font-medium">{p.dues_categories?.name ?? "Dues Payment"}</td>
                          <td className="py-3 text-gray-900 font-semibold">GHS {p.amount}</td>
                          <td className="py-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full
                              ${p.status === "success" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                              {p.status === "success" ? "Completed" : p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Badges */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">My Achievements</h3>
                  <Trophy size={18} className="text-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.label}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 text-center
                        ${b.unlocked ? "bg-gray-50" : "bg-gray-50 opacity-50"}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg
                        ${b.unlocked ? "bg-green-100" : "bg-gray-200"}`}>
                        {b.icon}
                      </div>
                      <p className={`text-xs font-bold tracking-wide ${b.unlocked ? "text-gray-700" : "text-gray-400"}`}>
                        {b.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Impact */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">Community Impact</h3>
                  <p className="text-xs text-gray-400 mt-0.5">See how your contributions are making a difference</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {projects.map((p, i) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                      <p className={`text-sm font-bold ${i === 0 ? "text-green-600" : "text-yellow-500"}`}>
                        {p.percentFunded}% Funded
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div className={`${i === 0 ? "bg-green-500" : "bg-yellow-400"} h-2 rounded-full`} style={{ width: `${p.percentFunded}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
