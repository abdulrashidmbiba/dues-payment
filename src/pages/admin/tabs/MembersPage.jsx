import { useState, useEffect, useMemo } from "react";
import { getAllMembers, updateMemberRole, removeMember } from "../../../lib/api";
import { Search, Trash2, Loader2 } from "lucide-react";

const ROLES = ["member", "treasurer", "admin"];

const roleBadgeStyle = {
  admin:     "bg-purple-50 text-purple-700",
  treasurer: "bg-blue-50 text-blue-700",
  member:    "bg-gray-100 text-gray-600",
};

export default function MembersPage({ canManage = true }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      m.full_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.member_id?.toLowerCase().includes(q)
    );
  }, [members, query]);

  const handleRoleChange = async (id, role) => {
    setBusyId(id);
    setError("");
    try {
      await updateMemberRole(id, role);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    } catch (err) {
      setError(err.message || "Could not update role.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This deletes their profile permanently.`)) return;
    setBusyId(id);
    setError("");
    try {
      await removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message || "Could not remove member.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-400 mt-0.5">{members.length} total · manage roles and access.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or member ID"
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm w-full sm:w-72 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-400 p-6 text-center">Loading members...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">No members match your search.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold">Member</th>
                <th className="text-left px-5 py-3 font-semibold">Member ID</th>
                <th className="text-left px-5 py-3 font-semibold">Program / Level</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-left px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{m.full_name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{m.member_id}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {m.level && m.program ? `${m.level} · ${m.program}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {canManage ? (
                      <select
                        value={m.role}
                        disabled={busyId === m.id}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer disabled:opacity-50 ${roleBadgeStyle[m.role] ?? roleBadgeStyle.member}`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${roleBadgeStyle[m.role] ?? roleBadgeStyle.member}`}>
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {canManage && (
                      <button
                        onClick={() => handleRemove(m.id, m.full_name)}
                        disabled={busyId === m.id}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition"
                      >
                        {busyId === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}