import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, Input, Select, Button, Toast } from "../components/UI";
import API from "../services/api";

// Categories matching what admin can manage
const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Utilities", "Rent", "Other"];

export default function AddExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.title) e.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (!form.category) e.category = "Category is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      // POST /api/expenses/add  — fields: title, amount, category, date
      await API.post("/expenses/add", {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
      });
      setToast({ message: "Expense added successfully!", type: "success" });
      setForm({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] });
      setTimeout(() => navigate("/history"), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to add expense", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Add Expense">
      <div style={{ maxWidth: 560 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--red)" }}>↑</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>New Expense</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>Record a new expense entry</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Input label="Expense Title" placeholder="e.g. Grocery shopping" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} error={errors.title} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Amount (₹)" type="number" placeholder="0.00" min="0" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} error={errors.amount} />
              <Input label="Date" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <Select label="Category" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} error={errors.category}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Button type="submit" loading={loading}>Add Expense</Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
