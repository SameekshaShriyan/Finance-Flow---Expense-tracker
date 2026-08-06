import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, Button, Badge, Toast } from "../components/UI";
import API from "../services/api";

const exportCSV = (expenses) => {
  const headers = ["Title", "Category", "Amount", "Date"];
  const rows = expenses.map(e => [
    `"${e.title || ""}"`,
    `"${e.category || ""}"`,
    e.amount,
    new Date(e.date).toLocaleDateString("en-IN"),
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = (expenses) => {
  const total = expenses.reduce((s,e) => s + Number(e.amount||0), 0);
  const byCategory = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category]||0) + Number(e.amount||0); });

  const html = `
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a2e; }
        h1 { color: #6c63ff; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 28px; }
        .summary { display: flex; gap: 24px; margin-bottom: 28px; }
        .stat { background: #f5f5ff; padding: 14px 20px; border-radius: 10px; min-width: 140px; }
        .stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 22px; font-weight: 800; color: #6c63ff; margin-top: 4px; }
        h2 { font-size: 15px; color: #333; margin: 24px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #6c63ff; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; }
        tr:nth-child(even) td { background: #fafaff; }
        .cat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .footer { margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; }
      </style>
    </head>
    <body>
      <h1>💰 Expense Report</h1>
      <div class="sub">Generated on ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</div>
      <div class="summary">
        <div class="stat">
          <div class="stat-label">Total Spent</div>
          <div class="stat-value">₹${total.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${expenses.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Categories</div>
          <div class="stat-value">${Object.keys(byCategory).length}</div>
        </div>
      </div>
      <h2>Monthly Summary</h2>
      ${Object.entries(byCategory).map(([cat,amt]) => `
        <div class="cat-row">
          <span>${cat}</span>
          <span style="font-weight:700;color:#e74c3c">₹${amt.toLocaleString()}</span>
        </div>
      `).join("")}
      <h2>Expense History</h2>
      <table>
        <thead>
          <tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${expenses.map(e => `
            <tr>
              <td>${e.title || "—"}</td>
              <td>${e.category || "—"}</td>
              <td style="color:#e74c3c;font-weight:600">₹${Number(e.amount).toLocaleString()}</td>
              <td>${new Date(e.date).toLocaleDateString("en-IN")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="footer">FinanceFlow — Personal Finance Manager</div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
};

export default function ExpenseHistory() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [toast, setToast]         = useState(null);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses/all");
      setExpenses(res.data || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      setToast({ message:"Expense deleted", type:"success" });
    } catch {
      setToast({ message:"Delete not supported by backend yet", type:"error" });
    }
  };

  const filtered = expenses.filter(e => {
    const matchSearch = !search || (e.title||"").toLowerCase().includes(search.toLowerCase());
    const matchCat    = !filterCat || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))];
  const total      = filtered.reduce((s,e) => s + Number(e.amount||0), 0);

  return (
    <Layout title="Expense History">
      {/* Filters + Export */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <input
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none" }}
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none", cursor:"pointer" }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display:"flex", alignItems:"center", padding:"10px 16px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13, color:"var(--text2)" }}>
          Total: <span style={{ color:"var(--red)", fontWeight:700, marginLeft:8 }}>₹{total.toLocaleString()}</span>
        </div>
        <Button variant="secondary" onClick={() => exportCSV(filtered)} style={{ padding:"10px 16px", fontSize:12 }}>
          ⬇ CSV
        </Button>
        <Button variant="secondary" onClick={() => exportPDF(filtered)} style={{ padding:"10px 16px", fontSize:12 }}>
          ⬇ PDF
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--text3)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:"var(--text3)" }}>No expenses found</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)" }}>
                  {["Title","Category","Amount","Date","Action"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp,i) => (
                  <tr key={exp._id||i}
                    style={{ borderBottom:"1px solid rgba(108,99,255,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
                    onMouseLeave={e => e.currentTarget.style.background=""}>
                    <td style={{ padding:"13px 14px", fontSize:13, fontWeight:500, color:"var(--text)" }}>{exp.title||"—"}</td>
                    <td style={{ padding:"13px 14px" }}><Badge>{exp.category||"—"}</Badge></td>
                    <td style={{ padding:"13px 14px", fontSize:14, fontWeight:700, color:"var(--red)" }}>₹{Number(exp.amount).toLocaleString()}</td>
                    <td style={{ padding:"13px 14px", fontSize:12, color:"var(--text3)" }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding:"13px 14px" }}>
                      <Button variant="danger" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => deleteExpense(exp._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}