import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updatePassword } from "../../lib/auth";
import Sidebar from "../../componenets/shared/Sidebar";
import { KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await updatePassword(password);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar active="Settings" />

      <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto max-w-lg">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Manage your account.</p>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Account</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="font-medium text-gray-800">{user?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Member ID</span><span className="font-medium text-gray-800">{user?.member_id}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="font-medium text-gray-800">{user?.email}</span></div>
            {user?.program && <div className="flex justify-between"><span className="text-gray-400">Program</span><span className="font-medium text-gray-800">{user.program}</span></div>}
            {user?.level && <div className="flex justify-between"><span className="text-gray-400">Level</span><span className="font-medium text-gray-800">{user.level}</span></div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={18} className="text-green-700" />
            <h3 className="font-bold text-gray-900">Change Password</h3>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-green-700 text-sm">Password updated successfully.</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password" value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Re-enter your password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="self-start bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}