import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMemberPaymentStatus, getPaymentHistory } from "../../lib/api";
import { computeBadges } from "../../lib/badges";
import Sidebar from "../../componenets/shared/Sidebar";
import { Trophy } from "lucide-react";

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [status, payments] = await Promise.all([
          getMemberPaymentStatus(user.id),
          getPaymentHistory(user.id),
        ]);
        setBadges(computeBadges(payments, status));
      } catch (err) {
        setError(err.message || "Could not load badges.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar active="Badges" />

      <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Achievements</h2>
          <Trophy size={22} className="text-yellow-500" />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {loading ? "Loading..." : `${unlockedCount} of ${badges.length} badges unlocked`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">{error}</div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {badges.map((b) => (
              <div
                key={b.label}
                className={`bg-white rounded-2xl p-6 border shadow-sm flex items-start gap-4
                  ${b.unlocked ? "border-green-100" : "border-gray-100 opacity-70"}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0
                  ${b.unlocked ? "bg-green-100" : "bg-gray-100"}`}>
                  <b.icon size={26} className={b.unlocked ? "text-green-700" : "text-gray-400"} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-bold tracking-wide ${b.unlocked ? "text-gray-800" : "text-gray-400"}`}>
                      {b.label}
                    </p>
                    {b.unlocked && (
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Unlocked</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}