import { useState, useEffect } from "react";
import {
  getAllDuesCategories, addDuesCategory, updateDuesCategory,
  getCommunityProjects, createCommunityProject, updateCommunityProject,
} from "../../../lib/api";
import { Plus, Loader2, Layers, Landmark } from "lucide-react";

export default function SystemUpdatePage() {
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCat, setNewCat] = useState({ name: "", amount: "", dueDate: "" });
  const [addingCat, setAddingCat] = useState(false);

  const [newProject, setNewProject] = useState({ title: "", description: "", targetAmount: "" });
  const [addingProject, setAddingProject] = useState(false);

  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      const [cats, projs] = await Promise.all([getAllDuesCategories(), getCommunityProjects()]);
      setCategories(cats);
      setProjects(projs);
    } catch (err) {
      setError(err.message || "Could not load configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.amount) return;
    setAddingCat(true);
    setError("");
    try {
      const created = await addDuesCategory({
        name: newCat.name,
        amount: Number(newCat.amount),
        dueDate: newCat.dueDate || null,
      });
      setCategories((prev) => [created, ...prev]);
      setNewCat({ name: "", amount: "", dueDate: "" });
    } catch (err) {
      setError(err.message || "Could not add dues category.");
    } finally {
      setAddingCat(false);
    }
  };

  const toggleCategoryActive = async (cat) => {
    setSavingId(cat.id);
    try {
      const updated = await updateDuesCategory(cat.id, { active: !cat.active });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      setError(err.message || "Could not update category.");
    } finally {
      setSavingId(null);
    }
  };

  const updateCategoryAmount = async (cat, amount) => {
    if (!amount || Number(amount) === cat.amount) return;
    setSavingId(cat.id);
    try {
      const updated = await updateDuesCategory(cat.id, { amount: Number(amount) });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      setError(err.message || "Could not update amount.");
    } finally {
      setSavingId(null);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.targetAmount) return;
    setAddingProject(true);
    setError("");
    try {
      const created = await createCommunityProject({
        title: newProject.title,
        description: newProject.description,
        targetAmount: Number(newProject.targetAmount),
      });
      setProjects((prev) => [{ ...created, percentFunded: 0 }, ...prev]);
      setNewProject({ title: "", description: "", targetAmount: "" });
    } catch (err) {
      setError(err.message || "Could not add community project.");
    } finally {
      setAddingProject(false);
    }
  };

  const updateProjectRaised = async (project, raisedAmount) => {
    if (raisedAmount === "" || Number(raisedAmount) === project.raised_amount) return;
    setSavingId(project.id);
    try {
      const updated = await updateCommunityProject(project.id, { raisedAmount: Number(raisedAmount) });
      const percentFunded = updated.target_amount > 0
        ? Math.min(100, Math.round((updated.raised_amount / updated.target_amount) * 100))
        : 0;
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...updated, percentFunded } : p)));
    } catch (err) {
      setError(err.message || "Could not update project funding.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Update</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage dues categories and community impact projects.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* DUES CATEGORIES */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-green-700" />
          <h2 className="font-bold text-gray-900">Dues Categories</h2>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-lg px-4 py-2.5">
              <span className="flex-1 min-w-[120px] text-sm font-medium text-gray-800">{cat.name}</span>
              <span className="text-xs text-gray-400">GHS</span>
              <input
                type="number"
                defaultValue={cat.amount}
                onBlur={(e) => updateCategoryAmount(cat, e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-600"
              />
              <span className="text-xs text-gray-400">
                {cat.due_date ? `Due ${new Date(cat.due_date).toLocaleDateString()}` : "No due date"}
              </span>
              <button
                onClick={() => toggleCategoryActive(cat)}
                disabled={savingId === cat.id}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition disabled:opacity-50
                  ${cat.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {savingId === cat.id ? <Loader2 size={12} className="animate-spin" /> : cat.active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-gray-400">No dues categories yet.</p>}
        </div>

        <form onSubmit={handleAddCategory} className="flex flex-wrap items-end gap-2 pt-3 border-t border-gray-100">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="e.g. Sports Fee"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div className="w-full sm:w-28">
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
            <input
              type="number"
              value={newCat.amount}
              onChange={(e) => setNewCat({ ...newCat, amount: e.target.value })}
              placeholder="GHS"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
            <input
              type="date"
              value={newCat.dueDate}
              onChange={(e) => setNewCat({ ...newCat, dueDate: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <button
            type="submit"
            disabled={addingCat}
            className="flex items-center justify-center gap-1.5 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition w-full sm:w-auto"
          >
            <Plus size={15} /> Add
          </button>
        </form>
      </div>

      {/* COMMUNITY PROJECTS */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={18} className="text-yellow-600" />
          <h2 className="font-bold text-gray-900">Community Impact Projects</h2>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {projects.map((p) => (
            <div key={p.id} className="border border-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                <p className="text-xs font-bold text-green-700">{p.percentFunded}% funded</p>
              </div>
              <p className="text-xs text-gray-400 mb-2">{p.description}</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${p.percentFunded}%` }} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">Raised: GHS</span>
                <input
                  type="number"
                  defaultValue={p.raised_amount}
                  onBlur={(e) => updateProjectRaised(p, e.target.value)}
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-600"
                />
                <span className="text-xs text-gray-400">of GHS {p.target_amount} target</span>
                {savingId === p.id && <Loader2 size={12} className="animate-spin text-gray-400" />}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-gray-400">No community projects yet.</p>}
        </div>

        <form onSubmit={handleAddProject} className="flex flex-wrap items-end gap-2 pt-3 border-t border-gray-100">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Project Title</label>
            <input
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder="e.g. Library Renovation"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Short description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-gray-500 mb-1">Target GHS</label>
            <input
              type="number"
              value={newProject.targetAmount}
              onChange={(e) => setNewProject({ ...newProject, targetAmount: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            />
          </div>
          <button
            type="submit"
            disabled={addingProject}
            className="flex items-center justify-center gap-1.5 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition w-full sm:w-auto"
          >
            <Plus size={15} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}