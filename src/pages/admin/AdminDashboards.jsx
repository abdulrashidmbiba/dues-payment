import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getTreasurerStats, getAllMembers, getAllPayments } from "../../lib/api";
import {
  LayoutDashboard, Users, CreditCard, Search, RefreshCw,
  CheckCircle2, Megaphone, ClipboardList, Settings,
  Banknote, Clock, Zap, Construction, LogOut, Menu, X,
} from "lucide-react";
import MembersPage from "./tabs/MembersPage";
import PaymentsPage from "./tabs/PaymentsPage";
import SystemQueryPage from "./tabs/SystemQueryPage";
import SystemUpdatePage from "./tabs/SystemUpdatePage";
import ApprovalsPage from "./tabs/ApprovalsPage";
import AnnouncementsPage from "./tabs/AnnouncementsPage";
import ReportsPage from "./tabs/ReportsPage";
import SettingsPage from "./tabs/SettingsPage";

// ── DATA ─────────────────────────────────────────────────────────
const collectionData = [
  { month: "Oct", value: 1200 },
  { month: "Nov", value: 2100 },
  { month: "Dec", value: 2400 },
  { month: "Jan", value: 3800 },
  { month: "Feb", value: 4200 },
  { month: "Mar", value: 10500 },
];

const paymentMethods = [
  { name: "MoMo", value: 70, color: "#15803d" },
  { name: "Bank", value: 30, color: "#60a5fa" },
];

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, active: true,  badge: null },
  { label: "Members",       icon: Users,           active: false, badge: null },
  { label: "Payments",      icon: CreditCard,      active: false, badge: null },
  { label: "System Query",  icon: Search,          active: false, badge: null },
  { label: "System Update", icon: RefreshCw,       active: false, badge: null },
  { label: "Approvals",     icon: CheckCircle2,    active: false, badge: null },
  { label: "Announcements", icon: Megaphone,       active: false, badge: null },
  { label: "Reports",       icon: ClipboardList,   active: false, badge: null },
  { label: "Settings",      icon: Settings,        active: false, badge: null },
];

const recentActivity = [
  {
    avatar: "KA",
    avatarBg: "bg-gray-200",
    name: "Kwame Asante",
    action: "paid",
    highlight: "GHS 50.00",
    sub: "Science Lab Maintenance • Mobile Money",
    subColor: "text-gray-400",
    time: "10 min ago",
  },
  {
    avatarIcon: RefreshCw,
    avatarBg: "bg-orange-100",
    isIcon: true,
    name: "Treasurer",
    action: "updated dues",
    highlight: null,
    sub: "Pending Approval • Department Week Fee",
    subColor: "text-orange-500",
    time: "45 min ago",
  },
  {
    avatar: "AS",
    avatarBg: "bg-pink-200",
    name: "Ama Serwaa",
    action: "paid",
    highlight: "GHS 150.00",
    sub: "Annual Membership Fee • Bank Transfer",
    subColor: "text-gray-400",
    time: "2 hours ago",
  },
  {
    avatarIcon: Megaphone,
    avatarBg: "bg-blue-100",
    isIcon: true,
    name: "New Announcement",
    action: "broadcasted",
    highlight: null,
    sub: "Title: Semester 2 Dues Deadline Extended",
    subColor: "text-gray-400",
    time: "5 hours ago",
  },
];

// ── STAT CARD ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, tag, tagColor, label, value, valueClass = "text-gray-900", urgent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={20} className="text-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          {urgent && (
            <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-0.5 rounded-full">URGENT</span>
          )}
          {tag && (
            <span className={`text-xs font-semibold ${tagColor}`}>{tag}</span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>
          {value}
          {urgent && <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2 align-middle" />}
        </p>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function Sidebar({ active, setActive, pendingCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "AD";

  const handleNavClick = (label) => {
    setActive(label);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 relative z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <p className="font-bold text-gray-900 text-sm">NexisPay</p>
        </div>
        <button onClick={() => setOpen(true)} className="text-gray-700">
          <Menu size={22} />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}

      {/* Drawer on mobile, static sidebar on desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-full md:h-screen w-64 md:w-56 bg-white border-r border-gray-100 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* brand */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">NexisPay</p>
              <p className="text-xs text-green-600 font-semibold mt-0.5">ADMIN</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* nav */}
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

        {/* user */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name ?? "Admin"}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role ?? "administrator"}</p>
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

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-green-700">GHS {payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ── CUSTOM DONUT LABEL ────────────────────────────────────────────
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────
function DashboardPage({ onNavigate }) {
  const [chartRange, setChartRange] = useState("Last 6 Months");
  const [liveStats, setLiveStats] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [treasurerStats, members] = await Promise.all([
          getTreasurerStats(),
          getAllMembers(),
        ]);
        setLiveStats({
          totalMembers: members.length,
          totalCollected: treasurerStats.totalCollected,
          membersPaid: treasurerStats.membersPaid,
        });
      } catch (err) {
        console.error("Failed to load live admin stats:", err);
      }
    })();
  }, []);

  const handleExportReport = () => {
    if (!liveStats) {
      toastError("Stats are still loading — try again in a moment.");
      return;
    }
    const rows = [
      ["Metric", "Value"],
      ["Total Members", liveStats.totalMembers],
      ["Members Paid", liveStats.membersPaid],
      ["Total Revenue (GHS)", liveStats.totalCollected],
      ["Generated At", new Date().toLocaleString()],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexispay-overview-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toastSuccess("Report downloaded.");
  };

  const goTo = (label) => {
    setActionMenuOpen(false);
    onNavigate?.(label);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back. Here's what's happening with NexisPay today.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"/>
            </svg>
            Export Report
          </button>
          <div className="relative">
            <button
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              New Action
            </button>
            {actionMenuOpen && (
              <>
                <div onClick={() => setActionMenuOpen(false)} className="fixed inset-0 z-10" />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => goTo("Announcements")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Post Announcement
                  </button>
                  <button
                    onClick={() => goTo("System Update")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50"
                  >
                    Add Dues Category
                  </button>
                  <button
                    onClick={() => goTo("Members")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50"
                  >
                    Manage Members
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} iconBg="bg-blue-50"
          label="Total Members" value={liveStats ? liveStats.totalMembers : "…"}
        />
        <StatCard
          icon={CheckCircle2} iconBg="bg-green-50"
          label="Members Paid" value={liveStats ? liveStats.membersPaid : "…"}
        />
        <StatCard
          icon={Banknote} iconBg="bg-yellow-50"
          label="Total Revenue" value={liveStats ? `GHS ${liveStats.totalCollected}` : "…"}
        />
        <StatCard
          icon={Clock} iconBg="bg-red-50"
          urgent={true}
          label="Pending Approvals" value="2"
          valueClass="text-gray-900"
        />
      </div>

      {/* recent activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
          </div>
          <button className="text-sm font-semibold text-green-700 hover:underline">View Stream</button>
        </div>
        <div className="flex flex-col divide-y divide-gray-50">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 py-3.5">
              {/* avatar */}
              <div className={`w-10 h-10 rounded-full ${a.avatarBg} flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0`}>
                {a.isIcon ? <a.avatarIcon size={16} className="text-gray-600" /> : a.avatar}
              </div>
              {/* text */}
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{a.name}</span>{" "}
                  <span>{a.action}</span>{" "}
                  {a.highlight && <span className="font-semibold">{a.highlight}</span>}
                </p>
                <p className={`text-xs mt-0.5 ${a.subColor}`}>{a.sub}</p>
              </div>
              {/* time */}
              <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <h2 className="font-bold text-gray-900">Collection over time</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue trends for the current academic cycle.</p>
            </div>
            <button className="text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition">
              {chartRange}
            </button>
          </div>
          <div className="mt-4" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v === 0 ? "0" : `${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="value"
                  stroke="#15803d" strokeWidth={2.5}
                  fill="url(#greenGrad)"
                  dot={{ r: 3, fill: "#15803d", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#15803d" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* donut chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900">Payment Methods</h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-2">Breakdown of preferred channels.</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  dataKey="value"
                  labelLine={false}
                  label={DonutLabel}
                  startAngle={90} endAngle={-270}
                >
                  {paymentMethods.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-5 mt-1">
            {paymentMethods.map(m => (
              <span key={m.name} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: m.color }} />
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PLACEHOLDER PAGE (fallback only, shouldn't normally be reached) ──
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Construction className="mx-auto mb-2 text-gray-400" size={28} />
        <p className="text-gray-500 font-medium">{title} page coming soon</p>
      </div>
    </div>
  );
}

const pageComponents = {
  Dashboard:       DashboardPage,
  Members:         MembersPage,
  Payments:        PaymentsPage,
  "System Query":  SystemQueryPage,
  "System Update": SystemUpdatePage,
  Approvals:       ApprovalsPage,
  Announcements:   AnnouncementsPage,
  Reports:         ReportsPage,
  Settings:        SettingsPage,
};

// ── APP ROOT ──────────────────────────────────────────────────────
export default function AdminDashboard() {
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

  const ActivePage = pageComponents[activePage] ?? (() => <PlaceholderPage title={activePage} />);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col md:flex-row">
      <Sidebar active={activePage} setActive={setActivePage} pendingCount={pendingCount} />

      {/* main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-h-screen overflow-x-hidden">
        {activePage === "Approvals"
          ? <ActivePage onPendingCountChange={refreshPendingCount} />
          : activePage === "Dashboard"
          ? <ActivePage onNavigate={setActivePage} />
          : <ActivePage />
        }
      </main>
    </div>
  );
}