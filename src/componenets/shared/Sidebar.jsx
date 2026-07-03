import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, CreditCard, History, Leaf, Award, Settings, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Pay Dues",  icon: CreditCard,       to: "/dashboard/pay" },
  { label: "History",   icon: History,          to: "/dashboard/history" },
  { label: "Impact",    icon: Leaf,             to: "/dashboard/impact" },
  { label: "Badges",    icon: Award,            to: "/dashboard/badges" },
  { label: "Settings",  icon: Settings,         to: "/dashboard/settings" },
];

/**
 * Shared member-side sidebar. On mobile it's an animated off-canvas drawer
 * (slides in from the left over a dark backdrop); on desktop (md+) it's a
 * normal static sidebar. Pass `active` as the current page's label.
 */
export default function Sidebar({ active }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 relative z-30">
        <h1 className="text-lg font-bold">
          <span className="text-green-400">Nexis</span><span className="text-yellow-400">Pay</span>
        </h1>
        <button onClick={() => setOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}

      {/* Drawer on mobile, static sidebar on desktop */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 md:w-48 bg-gray-900 flex flex-col py-6 px-4 shrink-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-lg font-bold">
            <span className="text-green-400">Nexis</span><span className="text-yellow-400">Pay</span>
          </h1>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setOpen(false)}
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
    </>
  );
}