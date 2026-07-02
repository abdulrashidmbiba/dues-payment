import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updatePassword } from "../../lib/auth";

// Reached via the link in the password-reset email. Supabase auto-establishes
// a temporary recovery session when the link is clicked, so by the time this
// page renders, useAuth().user should already be populated.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updatePassword(password);
      await logout(); // clear the temporary recovery session
      navigate("/login");
    } catch (err) {
      setError(err.message || "Could not update password. The reset link may have expired.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8 text-center">
          <p className="text-sm text-gray-500">
            This reset link is invalid or has expired. Request a new one from the login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-green-800">Nexis</span>
            <span className="text-yellow-500">Pay</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-900 mt-3">Set a New Password</h2>
          <p className="text-sm text-gray-500 mt-1">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="Re-enter your password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}