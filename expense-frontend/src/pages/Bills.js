import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Card, Input, Button, Badge, Toast } from "../components/UI";
import API from "../services/api";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ billName: "", amount: "", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try {
      // GET /api/bills/all
      const res = await API.get("/bills/all");
      setBills(res.data || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.billName || !form.amount || !form.dueDate) return;
    setLoading(true);
    try {
      // POST /api/bills/add  — fields: billName, amount, dueDate
      await API.post("/bills/add", {
        billName: form.billName,
        amount: Number(form.amount),
        dueDate: form.dueDate,
      });
      setToast({ message: "Bill reminder added!", type: "success" });
      setForm({ billName: "", amount: "", dueDate: "" });
      fetchBills();
    } catch {
      setToast({ message: "Failed to add bill", type: "error" });
    } finally { setLoading(false); }
  };

  const getDaysUntil = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  const getStatus = (days) => {
    if (days < 0) return { label: "Overdue", color: "var(--red)" };
    if (days <= 3) return { label: "Due Soon", color: "var(--yellow)" };
    return { label: "Upcoming", color: "var(--green)" };
  };

  const upcomingTotal = bills.filter(b => getDaysUntil(b.dueDate) >= 0).reduce((s, b) => s + Number(b.amount || 0), 0);

  return (
    <Layout title="Bill Reminders">
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Add Bill Reminder</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Bill Name" placeholder="e.g. Electricity Bill" value={form.billName}
                onChange={e => setForm({ ...form, billName: e.target.value })} required />
              <Input label="Amount (₹)" type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
              <Input label="Due Date" type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              <Button type="submit" loading={loading}>Add Bill</Button>
            </form>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Upcoming Bills Total</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--yellow)", fontFamily: "'Syne',sans-serif" }}>₹{upcomingTotal.toLocaleString()}</div>
          </Card>
        </div>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Your Bills</h3>
          {bills.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No bills added yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bills.map((bill, i) => {
                const days = getDaysUntil(bill.dueDate);
                const status = getStatus(days);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", background: "var(--bg3)", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${days < 0 ? "rgba(248,113,113,0.2)" : "var(--border)"}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{bill.billName}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>Due: {new Date(bill.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>₹{Number(bill.amount).toLocaleString()}</div>
                      <Badge color={status.color}>{status.label}{days >= 0 ? ` (${days}d)` : ""}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
