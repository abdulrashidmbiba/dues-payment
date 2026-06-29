import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, failedAttempts, isLocked, lockoutRemaining } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;
    const result = login(email, password);
    if (result.success) {
      if (result.role === "admin")      navigate("/admin");
      else if (result.role === "treasurer") navigate("/treasurer");
      else navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-green-800">Nexis</span>
            <span className="text-yellow-500">Pay</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-900 mt-3">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your payments</p>
        </div>

        {/* Lockout banner */}
        {isLocked && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-red-500">🔒</span>
            <p className="text-red-600 text-sm">
              Account locked. Try again in {lockoutRemaining} minute{lockoutRemaining !== 1 ? "s" : ""}.
            </p>
          </div>
        )}

        {/* Error banner */}
        {error && !isLocked && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="user@example.com"
              disabled={isLocked}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition
                ${error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-700"}
                ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button type="button" className="text-sm text-green-700 font-medium hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                disabled={isLocked}
                className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm outline-none transition
                  ${error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-700"}
                  ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
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

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-green-700"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
          </div>

          {/* Attempts warning */}
          {failedAttempts > 0 && failedAttempts < 5 && !isLocked && (
            <p className="text-xs text-orange-500">
              {5 - failedAttempts} attempt{5 - failedAttempts !== 1 ? "s" : ""} remaining before lockout.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLocked}
            className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full border border-gray-200 rounded-full py-3 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.9 14.8 48 24 48z"/>
              <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-3 .7-4.3v-6.2H2.7C1 17.4 0 20.6 0 24s1 6.6 2.7 9.1l8.1-4.3z"/>
              <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.4 0 24 0 14.8 0 6.7 5.1 2.7 12.7l8.1 4.3C12.7 11.4 17.9 9.5 24 9.5z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-green-700 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}