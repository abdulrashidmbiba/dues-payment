import { useState, useEffect } from "react";
import { getCommunityProjects } from "../../lib/api";
import Sidebar from "../../componenets/shared/Sidebar";

export default function ImpactPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getCommunityProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message || "Could not load community projects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar active="Impact" />

      <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">Community Impact</h2>
        <p className="text-sm text-gray-500 mb-6">See how member contributions are making a difference.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-12">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No community projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map((p, i) => (
              <div key={p.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{p.title}</p>
                  <p className={`text-sm font-bold ${i % 2 === 0 ? "text-green-600" : "text-yellow-500"}`}>
                    {p.percentFunded}% Funded
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                  <div
                    className={`${i % 2 === 0 ? "bg-green-500" : "bg-yellow-400"} h-2.5 rounded-full transition-all`}
                    style={{ width: `${p.percentFunded}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-2">{p.description}</p>
                <p className="text-xs text-gray-400">
                  GHS {p.raised_amount} raised of GHS {p.target_amount} target
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}