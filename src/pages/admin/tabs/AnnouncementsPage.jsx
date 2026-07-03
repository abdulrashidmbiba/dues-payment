import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "../../../lib/api";
import { Megaphone, Trash2, Loader2 } from "lucide-react";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", message: "" });
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Could not load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setPosting(true);
    setError("");
    try {
      const created = await createAnnouncement({
        title: form.title,
        message: form.message,
        createdBy: user.id,
      });
      setAnnouncements((prev) => [{ ...created, profiles: { full_name: user.full_name } }, ...prev]);
      setForm({ title: "", message: "" });
    } catch (err) {
      setError(err.message || "Could not post announcement. Have you run migration_2_announcements.sql yet?");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete announcement.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
       <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-400 mt-0.5">Broadcast updates to your organization.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handlePost} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Announcement title"
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Write your message..."
          rows={3}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 resize-none"
        />
        <button
          type="submit"
          disabled={posting}
          className="self-end flex items-center gap-1.5 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
        >
          {posting ? <Loader2 size={15} className="animate-spin" /> : <Megaphone size={15} />}
          {posting ? "Posting..." : "Post Announcement"}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-400 p-6 text-center">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">No announcements yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={15} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {a.profiles?.full_name ?? "Staff"} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="text-gray-300 hover:text-red-500 disabled:opacity-50 transition shrink-0"
                >
                  {deletingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}