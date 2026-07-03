import { useState, useEffect, useMemo } from "react";
import { getAllMembers, getPaymentHistory } from "../../../lib/api";
import { Search, User } from "lucide-react";

export default function SystemQueryPage() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch (err) {
        setError(err.message || "Could not load members.");
      } finally {
        setLoadingMembers(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter((m) =>
        m.full_name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.member_id?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [members, query]);

  const selectMember = async (member) => {
    setSelected(member);
    setQuery("");
    setLoadingHistory(true);
    setError("");
    try {
      const data = await getPaymentHistory(member.id);
      setHistory(data);
    } catch (err) {
      setError(err.message || "Could not load this member's payment history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const totalPaid = history
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Query</h1>
        <p className="text-sm text-gray-400 mt-0.5">Look up any member's full record by name, email, or member ID.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loadingMembers ? "Loading members..." : "Search by name, email, or member ID"}
          disabled={loadingMembers}
          className="pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm w-full outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:opacity-50"
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMember(m)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition"
              >
                <p className="text-sm font-medium text-gray-800">{m.full_name}</p>
                <p className="text-xs text-gray-400">{m.member_id} · {m.email}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {selected && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
              <User size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{selected.full_name}</p>
              <p className="text-xs text-gray-400">{selected.member_id} · {selected.email} · role: {selected.role}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Paid</p>
              <p className="text-lg font-extrabold text-green-700">GHS {totalPaid}</p>
            </div>
          </div>

          {loadingHistory ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading payment history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No payments recorded for this member.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left pb-2 font-semibold">Date</th>
                  <th className="text-left pb-2 font-semibold">Category</th>
                  <th className="text-left pb-2 font-semibold">Amount</th>
                  <th className="text-left pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-gray-500 text-xs">{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className="py-2.5 text-gray-700">{p.dues_categories?.name ?? "—"}</td>
                    <td className="py-2.5 font-semibold text-gray-900">GHS {p.amount}</td>
                    <td className="py-2.5 text-xs text-gray-500">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}