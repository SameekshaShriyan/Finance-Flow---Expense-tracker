import { useState, useEffect } from "react";
import AdminLayout from "../../components/adminLayout";
import { Card, Input, Button, Badge, Toast } from "../../components/UI";
import API from "../../services/api";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      // GET /api/admin/categories  → array of strings e.g. ["Food","Transport",...]
      const res = await API.get("/admin/categories");
      setCategories(res.data || []);
    } catch {}
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    setLoading(true);
    try {
      // POST /api/admin/categories  — body: { name }  → { message, categories }
      const res = await API.post("/admin/categories", { name: newCat.trim() });
      setCategories(res.data.categories || [...categories, newCat.trim()]);
      setNewCat("");
      setToast({ message: "Category added!", type: "success" });
    } catch {
      setToast({ message: "Failed to add category", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Category Management">
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Add Category</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Category Name" placeholder="e.g. Medical" value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCategory()} />
            <Button onClick={addCategory} loading={loading}>Add Category</Button>
          </div>
          <div style={{ marginTop: 20, padding: 14, background: "var(--bg3)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text3)" }}>
            <strong style={{ color: "var(--text2)" }}>Tip:</strong> Categories appear in the expense form for users.
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>All Categories</h3>
            <Badge>{categories.length} total</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {categories.map((cat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{cat.name || cat}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
