import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold">
          <span className="text-green-800">Nexis</span>
          <span className="text-yellow-500">Pay</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-medium text-white bg-green-800 rounded-full hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gray-50 px-8 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">

          {/* Left copy */}
          <div className="flex-1">
            {/* Ghana badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 mb-6">
              <span>🇬🇭</span> BUILT FOR GHANAIAN ORGANIZATIONS
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Simple. Transparent.<br />
              <span className="text-green-700">Secure.</span>
            </h2>

            <p className="text-gray-500 text-base mb-8 max-w-sm">
              Track your dues, payments, and community projects in one place.
              The ultimate transparency platform for associations.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <Link
                to="/register"
                className="px-6 py-3 bg-green-800 text-white font-semibold rounded-full hover:bg-green-700 transition text-sm"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition text-sm"
              >
                Login
              </Link>
            </div>

            <p className="text-xs text-gray-400">Trusted by 500+ local organizations and alumni groups</p>
          </div>

          {/* Right card */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs">
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">PAID</span>
              </div>

              <p className="text-xs text-gray-400 mb-1">Member Dues · Q3 2024</p>
              <p className="text-2xl font-extrabold text-gray-900 mb-4">GHS 450.00</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Alumni Project Goal</span>
                  <span className="text-xs font-bold text-yellow-500">82%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "82%" }} />
                </div>
              </div>

              {/* Verified member */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                  KM
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Kwame Mensah</p>
                  <p className="text-xs text-gray-400">Secretary Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Instant Payments",
              desc: "Pay your dues via Mobile Money or Bank Card and get instant confirmation.",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ),
              title: "Full Transparency",
              desc: "Every cedi is tracked. View organization statements and project spending in real-time.",
            },
            {
              icon: (
                <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
              title: "Earn Badges",
              desc: "Get recognized for consistent contributions and project support within your group.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHERE EVERY CEDI GOES ── */}
      <section className="bg-gray-900 px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-3">See Where Every Cedi Goes</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Track the real-world impact of your contributions toward community development goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              {
                title: "Projector Purchase",
                sub: "Primary School Hall Project",
                raised: "GHS 12,500",
                goal: "GHS 18,000",
                pct: 70,
                badge: "ACTIVE",
                badgeColor: "bg-yellow-500",
                barColor: "bg-yellow-400",
                avatars: 12,
              },
              {
                title: "Classroom Repair",
                sub: "JHS Block Renovation",
                raised: "GHS 8,200",
                goal: "GHS 25,000",
                pct: 45,
                badge: "URGENT",
                badgeColor: "bg-red-500",
                barColor: "bg-yellow-400",
                avatars: 5,
              },
            ].map((p) => (
              <div key={p.title} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{p.sub}</p>
                <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
                  <span>{p.raised} of {p.goal}</span>
                  <span className="font-bold text-yellow-400">{p.pct}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div className={`${p.barColor} h-2 rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
                {/* Avatar stack */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, p.avatars) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-green-600 border-2 border-gray-800 -ml-1 first:ml-0 flex items-center justify-center text-xs text-white font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  {p.avatars > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-gray-800 -ml-1 flex items-center justify-center text-xs text-white">
                      +{p.avatars - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition text-sm"
            >
              Join Your Organization
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-green-900 px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h1 className="text-xl font-bold mb-3">
              <span className="text-white">Nexis</span>
              <span className="text-yellow-400">Pay</span>
            </h1>
            <p className="text-green-200 text-sm mb-4">
              Empowering Ghanaian associations with modern financial tools and radical transparency.
            </p>
            <div className="flex gap-3">
              {["f", "t", "in"].map((s) => (
                <div key={s} className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-green-600 transition">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { heading: "Product",  links: ["How it works", "For Associations", "For Members", "Pricing"] },
            { heading: "Company",  links: ["About Us", "Careers", "Contact", "Impact Blog"] },
            { heading: "Legal",    links: ["Privacy Policy", "Terms of Service", "Compliance"] },
          ].map((col) => (
            <div key={col.heading}>
              <h3 className="text-white font-semibold mb-3 text-sm">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-green-200 text-sm hover:text-white transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-green-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-green-300 text-xs">© 2024 NexisPay Financial Services. All rights reserved.</p>
          <p className="text-green-300 text-xs">Licensed by Bank of Ghana</p>
        </div>
      </footer>

    </div>
  );
}