import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTreasurerStats, getAllPayments } from "../../lib/api";
import {
  LayoutDashboard, Users, CreditCard, Search, RefreshCw,
  CheckCircle2, Megaphone, ClipboardList, Settings,
  Banknote, Clock, LogOut, Menu, X,
} from "lucide-react";

// Reusing Admin's tested tab components — Treasurer and Admin share the
// same database permissions (both are "staff" in RLS policies), so there's
// no need to duplicate these pages.
import MembersPage from "../admin/tabs/MembersPage";
import PaymentsPage from "../admin/tabs/PaymentsPage";
import SystemQueryPage from "../admin/tabs/SystemQueryPage";
import SystemUpdatePage from "../admin/tabs/SystemUpdatePage";
import ApprovalsPage from "../admin/tabs/ApprovalsPage";
import AnnouncementsPage from "../admin/tabs/AnnouncementsPage";
import ReportsPage from "../admin/tabs/ReportsPage";
import SettingsPage from "../admin/tabs/SettingsPage";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, badge: null },
  { label: "Members",       icon: Users,           badge: null },
  { label: "Payments",      icon: CreditCard,      badge: null },
  { label: "System Query",  icon: Search,          badge: null },
  { label: "System Update", icon: RefreshCw,       badge: null },
  { label: "Approvals",     icon: CheckCircle2,    badge: null },
  { label: "Announcements", icon: Megaphone,       badge: null },
  { label: "Reports",       icon: ClipboardList,   badge: null },
  { label: "Settings",      icon: Settings,        badge: null },
];

// ── STAT CARD ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function Sidebar({ active, setActive, pendingCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "TR";

  const handleNavClick = (label) => {
    setActive(label);
    setOpen(false);
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 relative z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <p className="font-bold text-gray-900 text-sm">NexisPay</p>
        </div>
        <button onClick={() => setOpen(true)} className="text-gray-700">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-full md:h-screen w-64 md:w-56 bg-white border-r border-gray-100 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">NexisPay</p>
              <p className="text-xs text-green-600 font-semibold mt-0.5">TREASURER</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = active === item.label;
            const badgeValue = item.label === "Approvals" ? pendingCount : item.badge;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <item.icon size={17} className={isActive ? "text-green-700" : "text-gray-500"} />
                <span className="flex-1">{item.label}</span>
                {!!badgeValue && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name ?? "Treasurer"}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role ?? "treasurer"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ── OVERVIEW PAGE ─────────────────────────────────────────────────
function OverviewPage() {
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

  const maxMonth = stats?.monthlyBreakdown?.length
    ? Math.max(...stats.monthlyBreakdown.map((m) => m.amount))
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Treasurer Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">Collections and outstanding dues at a glance.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : !stats ? (
        <p className="text-sm text-gray-400">Could not load stats. Try refreshing the page.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Banknote} iconBg="bg-green-50" iconColor="text-green-700" label="Total Money Collected" value={`GHS ${stats.totalCollected}`} />
            <StatCard icon={CheckCircle2} iconBg="bg-blue-50" iconColor="text-blue-700" label="Members Paid" value={stats.membersPaid} sub={`of ${stats.totalMembers} total`} />
            <StatCard icon={Clock} iconBg="bg-red-50" iconColor="text-red-600" label="Members Unpaid" value={stats.membersUnpaid} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Monthly Collections</h2>
            {stats.monthlyBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.monthlyBreakdown.map((m) => (
                  <div key={m.month} className="flex flex-wrap items-center gap-3">
                    <span className="w-16 text-xs text-gray-500 shrink-0">{m.month}</span>
                    <div className="flex-1 min-w-[100px] bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: maxMonth ? `${(m.amount / maxMonth) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs font-semibold text-gray-700 shrink-0">GHS {m.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
function TreasurerMembersPage() {
  return <MembersPage canManage={false} />;
}


const pageComponents = {
  Dashboard:       OverviewPage,
  Members:        TreasurerMembersPage,
  Payments:        PaymentsPage,
  "System Query":  SystemQueryPage,
  "System Update": SystemUpdatePage,
  Approvals:       ApprovalsPage,
  Announcements:   AnnouncementsPage,
  Reports:         ReportsPage,
  Settings:        SettingsPage,
};

// ── APP ROOT ──────────────────────────────────────────────────────
export default function TreasurerDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = async () => {
    try {
      const all = await getAllPayments();
      setPendingCount(all.filter((p) => p.status === "pending").length);
    } catch (err) {
      console.error("Failed to load pending approvals count:", err);
    }
  };

  useEffect(() => { refreshPendingCount(); }, []);

  const ActivePage = pageComponents[activePage] ?? OverviewPage;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col md:flex-row">
      <Sidebar active={activePage} setActive={setActivePage} pendingCount={pendingCount} />

      <main className="flex-1 p-4 sm:p-6 md:p-8 min-h-screen overflow-x-hidden">
        {activePage === "Approvals"
          ? <ActivePage onPendingCountChange={refreshPendingCount} />
          : <ActivePage />
        }
      </main>
    </div>
  );
}