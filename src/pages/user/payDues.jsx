import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDuesCategories } from "../../lib/api";
import { payWithPaystack, recordSuccessfulPayment } from "../../lib/paystack";
import {
  LayoutDashboard, CreditCard, History, Leaf,
  Award, Bell, Settings, LogOut, CheckCircle2
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

export default function PayDues() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDuesCategories();
        setCategories(data);
        if (data.length > 0) setSelected(data[0].id);
      } catch (err) {
        setError(err.message || "Could not load dues categories.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const selectedCategory = categories.find((c) => c.id === selected);

  const handlePay = async () => {
    if (!selectedCategory || !user) return;
    setError("");
    setPaying(true);
    try {
      const response = await payWithPaystack({
        email: user.email,
        amount: selectedCategory.amount,
      });
      const payment = await recordSuccessfulPayment({
        reference: response.reference,
        memberId: user.id,
        amount: selectedCategory.amount,
        categoryId: selectedCategory.id,
      });
      setReceipt(payment);
    } catch (err) {
      if (err?.closed) {
        setError("Payment window closed before completing.");
      } else {
        setError(err.message || "Something went wrong recording your payment. Contact the treasurer if you were charged.");
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
                ${label === "Pay Dues"
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

      <main className="flex-1 px-8 py-6 overflow-y-auto max-w-2xl">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Pay Dues</h2>
        <p className="text-sm text-gray-500 mb-6">Select a dues category and pay securely with Paystack.</p>

        {receipt ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful</h3>
            <p className="text-sm text-gray-500 mb-6">Your receipt is below.</p>

            <div id="receipt-printable" className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Receipt No.</span>
                <span className="font-semibold text-gray-800">{receipt.receipt_number}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold text-gray-800">{new Date(receipt.paid_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Member</span>
                <span className="font-semibold text-gray-800">{user?.full_name} ({user?.member_id})</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold text-gray-800">{receipt.dues_categories?.name}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-500 font-semibold">Amount Paid</span>
                <span className="font-bold text-green-700">GHS {receipt.amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-full transition"
              >
                Print / Save as PDF
              </button>
              <Link
                to="/dashboard/history"
                className="flex-1 bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition text-center"
              >
                View History
              </Link>
            </div>
          </div>
        ) : loading ? (
          <p className="text-sm text-gray-400">Loading dues categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-400">No dues categories have been set up yet. Contact your treasurer.</p>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select category</p>
            <div className="flex flex-col gap-3 mb-6">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer transition
                    ${selected === cat.id ? "border-green-600 bg-green-50" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="category"
                      checked={selected === cat.id}
                      onChange={() => setSelected(cat.id)}
                      className="accent-green-700"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                      {cat.due_date && (
                        <p className="text-xs text-gray-400">Due {new Date(cat.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">GHS {cat.amount}</p>
                </label>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying || !selectedCategory}
              className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition"
            >
              {paying ? "Processing..." : selectedCategory ? `Pay GHS ${selectedCategory.amount} Now` : "Select a category"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
