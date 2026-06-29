import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const id = "NEX-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    setMemberId(id);
    setStep("success");
  };

  const Field = ({ label, name, type = "text", placeholder, showToggle, show, onToggle }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={showToggle ? (show ? "text" : "password") : type}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition
            ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-700"}
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
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

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
            Go to Dashboard
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="First Name"        name="firstName"       placeholder="Enter your first name" />
          <Field label="Last Name"         name="lastName"        placeholder="Enter your last name" />
          <Field label="Email Address"     name="email"           placeholder="user@example.com" />
          <Field
            label="Password"
            name="password"
            placeholder="Minimum 6 characters"
            showToggle
            show={showPw}
            onToggle={() => setShowPw(!showPw)}
          />
          <Field
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            showToggle
            show={showCf}
            onToggle={() => setShowCf(!showCf)}
          />

          <button
            type="submit"
            className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
          >
            Create Account
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