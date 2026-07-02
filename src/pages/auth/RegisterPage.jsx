import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerMember } from "../../lib/auth";

// Moved OUTSIDE the RegisterPage component on purpose. Defining this inside
// RegisterPage meant it was recreated as a brand-new component on every
// keystroke, so React unmounted/remounted the <input> each time and the
// field lost focus after every letter. Living at module scope fixes that.
function Field({ label, name, type = "text", placeholder, showToggle, show, onToggle, value, error, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={showToggle ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100
  ${error ? "border-red-400 bg-red-50" : "border-gray-300"}
  ${showToggle ? "pr-11" : ""}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState("form"); // "form" | "success"
  const [memberId, setMemberId] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [form, setForm]       = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())                       e.firstName = "First name is required";
    if (!form.lastName.trim())                        e.lastName  = "Last name is required";
    if (!form.email.includes("@"))                    e.email     = "Enter a valid email";
    if (form.password.length < 6)                     e.password  = "Minimum 6 characters";
    if (form.password !== form.confirmPassword)       e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    try {
      const { profile } = await registerMember({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });
      setMemberId(profile.member_id);
      setStep("success");
    } catch (err) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to NexisPay!</h2>
          <p className="text-sm text-gray-500 mb-6">Your account has been successfully created.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Your Member ID</p>
            <p className="text-lg font-bold text-green-700">{memberId}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Registration form ──
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-green-800">Nexis</span>
            <span className="text-yellow-500">Pay</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Create Your Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join your organization today</p>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="First Name" name="firstName" placeholder="Enter your first name"
            value={form.firstName} error={errors.firstName} onChange={handleChange}
          />
          <Field
            label="Last Name" name="lastName" placeholder="Enter your last name"
            value={form.lastName} error={errors.lastName} onChange={handleChange}
          />
          <Field
            label="Email Address" name="email" placeholder="user@example.com"
            value={form.email} error={errors.email} onChange={handleChange}
          />
          <Field
            label="Password"
            name="password"
            placeholder="Minimum 6 characters"
            showToggle
            show={showPw}
            onToggle={() => setShowPw(!showPw)}
            value={form.password}
            error={errors.password}
            onChange={handleChange}
          />
          <Field
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            showToggle
            show={showCf}
            onToggle={() => setShowCf(!showCf)}
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}