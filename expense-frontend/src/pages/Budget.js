import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Card, Input, Select, Button, Toast, StatCard } from "../components/UI";
import API from "../services/api";

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Utilities", "Rent", "Other"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("category");
  const [form, setForm] = useState({ category: "", limit: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [monthlyForm, setMonthlyForm] = useState({ limit: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ category: "", limit: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [bRes, eRes] = await Promise.all([
        API.get("/budgets/all").catch(() => ({ data: [] })),
        API.get("/expenses/all").catch(() => ({ data: [] })),
      ]);
      setBudgets(bRes.data || []);
      setExpenses(eRes.data || []);
    } catch {}
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.limit) return;
    setLoading(true);
    try {
      await API.post("/budgets/set", {
        category: form.category,
        limit: Number(form.limit),
        month: Number(form.month),
        year: Number(form.year),
      });
      setToast({ message: "Category budget saved!", type: "success" });
      setForm({ category: "", limit: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      fetchAll();
    } catch { setToast({ message: "Failed to save", type: "error" }); }
    finally { setLoading(false); }
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    if (!monthlyForm.limit) return;
    setLoading(true);
    try {
      await API.post("/budgets/set", {
        category: "Overall",
        limit: Number(monthlyForm.limit),
        month: Number(monthlyForm.month),
        year: Number(monthlyForm.year),
      });
      setToast({ message: "Monthly budget saved!", type: "success" });
      fetchAll();
    } catch { setToast({ message: "Failed to save", type: "error" }); }
    finally { setLoading(false); }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setEditForm({ category: b.category, limit: b.limit });
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/budgets/${id}`, { category: editForm.category, limit: Number(editForm.limit) });
      setToast({ message: "Budget updated!", type: "success" });
      setEditingId(null);
      fetchAll();
    } catch { setToast({ message: "Update failed", type: "error" }); }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await API.delete(`/budgets/${id}`);
      setToast({ message: "Budget deleted", type: "success" });
      fetchAll();
    } catch { setToast({ message: "Delete failed", type: "error" }); }
  };

  const getSpent = (budget) => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      const sameMonth = budget.month ? d.getMonth() + 1 === Number(budget.month) : true;
      const sameYear = budget.year ? d.getFullYear() === Number(budget.year) : true;
      const sameCategory = budget.category === "Overall" ? true : e.category === budget.category;
      return sameMonth && sameYear && sameCategory;
    }).reduce((s, e) => s + Number(e.amount || 0), 0);
  };

  const categoryBudgets = budgets.filter(b => b.category !== "Overall");
  const monthlyBudgets = budgets.filter(b => b.category === "Overall");
  const totalLimit = categoryBudgets.reduce((s, b) => s + Number(b.limit || 0), 0);
  const totalSpent = categoryBudgets.reduce((s, b) => s + getSpent(b), 0);

  const tabStyle = (t) => ({
    padding: "9px 20px", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "all 0.2s",
    background: activeTab === t ? "linear-gradient(135deg, var(--accent), var(--accent2))" : "var(--surface2)",
    color: activeTab === t ? "#fff" : "var(--text2)",
  });

  const BudgetCard = ({ b, showCategoryEdit }) => {
    const spent = getSpent(b);
    const limit = Number(b.limit);
    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const isOver = spent > limit;
    const isEditing = editingId === b._id;

    return (
      <div style={{
        padding: "16px", background: "var(--bg3)",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${isOver ? "rgba(248,113,113,0.3)" : "var(--border)"}`,
      }}>
        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {showCategoryEdit && (
              <Select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            )}
            <Input type="number" placeholder="New limit (₹)" value={editForm.limit}
              onChange={e => setEditForm({ ...editForm, limit: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <Button style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => saveEdit(b._id)}>Save</Button>
              <Button variant="secondary" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  {b.category === "Overall" ? `${MONTHS[(b.month || 1) - 1]} ${b.year}` : b.category}
                </span>
                <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>
                  {b.category === "Overall" ? "Overall" : `${MONTHS[(b.month || 1) - 1]} ${b.year}`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? "var(--red)" : "var(--text)" }}>
                  ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}
                </span>
                <button onClick={() => startEdit(b)} style={{
                  background: "var(--surface2)", border: "1px solid var(--border2)",
                  borderRadius: 6, padding: "4px 10px", fontSize: 11,
                  color: "var(--text2)", cursor: "pointer", fontWeight: 600,
                }}>✏ Edit</button>
                <button onClick={() => deleteBudget(b._id)} style={{
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 6, padding: "4px 10px", fontSize: 11,
                  color: "var(--red)", cursor: "pointer", fontWeight: 600,
                }}>✕</button>
              </div>
            </div>

            <div style={{ height: 6, background: "var(--bg2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999, width: `${pct}%`,
                background: isOver ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--green)",
                transition: "width 0.6s ease",
              }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>{pct.toFixed(0)}% used</span>
              {isOver
                ? <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>Over by ₹{(spent - limit).toLocaleString()}</span>
                : <span style={{ fontSize: 11, color: "var(--green)" }}>₹{(limit - spent).toLocaleString()} left</span>
              }
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Layout title="Budget & Goals">

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Budget Set" value={`₹${totalLimit.toLocaleString()}`} icon="◎" color="var(--accent2)" />
        <StatCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} icon="↑" color="var(--red)" />
        <StatCard label="Remaining" value={`₹${(totalLimit - totalSpent).toLocaleString()}`} icon="◈"
          color={totalLimit - totalSpent >= 0 ? "var(--green)" : "var(--red)"} />
        <StatCard label="Categories Set" value={categoryBudgets.length} icon="◫" color="var(--yellow)" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={tabStyle("category")} onClick={() => setActiveTab("category")}>📂 Category Budgets</button>
        <button style={tabStyle("monthly")} onClick={() => setActiveTab("monthly")}>📅 Monthly Budget</button>
      </div>

      {/* Category tab */}
      {activeTab === "category" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Set Category Budget</h3>
            <form onSubmit={handleCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input label="Monthly Limit (₹)" type="number" placeholder="5000" min="1"
                value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </Select>
                <Input label="Year" type="number" value={form.year} min="2020" max="2099"
                  onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
              <Button type="submit" loading={loading}>Save Budget</Button>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Category Budgets</h3>
            {categoryBudgets.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No category budgets set yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {categoryBudgets.map(b => <BudgetCard key={b._id} b={b} showCategoryEdit={true} />)}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Total</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      ₹{totalSpent.toLocaleString()} / ₹{totalLimit.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: totalSpent > totalLimit ? "var(--red)" : "var(--green)" }}>
                      {totalSpent > totalLimit
                        ? `Over by ₹${(totalSpent - totalLimit).toLocaleString()}`
                        : `₹${(totalLimit - totalSpent).toLocaleString()} remaining`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Monthly tab */}
      {activeTab === "monthly" && (
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Set Monthly Overall Budget</h3>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, lineHeight: 1.5 }}>
              Set a single overall spending limit for the entire month across all categories.
            </p>
            <form onSubmit={handleMonthlySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Total Monthly Limit (₹)" type="number" placeholder="20000" min="1"
                value={monthlyForm.limit} onChange={e => setMonthlyForm({ ...monthlyForm, limit: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Month" value={monthlyForm.month} onChange={e => setMonthlyForm({ ...monthlyForm, month: e.target.value })}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </Select>
                <Input label="Year" type="number" value={monthlyForm.year} min="2020" max="2099"
                  onChange={e => setMonthlyForm({ ...monthlyForm, year: e.target.value })} />
              </div>
              <Button type="submit" loading={loading}>Save Monthly Budget</Button>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Monthly Budgets</h3>
            {monthlyBudgets.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No monthly budgets set yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {monthlyBudgets.map(b => <BudgetCard key={b._id} b={b} showCategoryEdit={false} />)}
              </div>
            )}
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}