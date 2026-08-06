import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, Input, Select, Button, Toast } from "../components/UI";
import API from "../services/api";

const SOURCES = ["Salary", "Freelance", "Business", "Investments", "Rental", "Gift", "Other"];

export default function AddIncome() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.source) e.source = "Source is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      // POST /api/income/add  — fields: source, amount, date
      await API.post("/income/add", {
        source: form.source,
        amount: Number(form.amount),
        date: form.date,
      });
      setToast({ message: "Income added successfully!", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to add income", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Add Income">
      <div style={{ maxWidth: 560 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--green)" }}>↓</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Record Income</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>Add an income entry</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Select label="Income Source" value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })} error={errors.source}>
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Amount (₹)" type="number" placeholder="0.00" min="0" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} error={errors.amount} />
              <Input label="Date" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Button type="submit" loading={loading}>Add Income</Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
