import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-green-800">Nexis</span>
            <span className="text-yellow-500">Pay</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-900 mt-3">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sent
              ? "Check your inbox for the reset link."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              If an account exists for <span className="font-semibold text-gray-700">{email}</span>, a reset link is on its way. It can take a minute to arrive.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="user@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-green-700 font-semibold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}