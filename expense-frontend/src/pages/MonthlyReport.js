import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, StatCard } from "../components/UI";
import API from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MonthlyReport() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({ bestMonth:"—", avgExpense:0, totalSaved:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        API.get("/expenses/all").catch(() => ({ data: [] })),
        API.get("/income/all").catch(() => ({ data: [] })),
      ]);
      const expenses = expRes.data || [];
      const incomes = incRes.data || [];
      const year = new Date().getFullYear();

      const map = {};
      MONTHS.forEach((m, idx) => { map[m] = { month:m, monthIdx:idx, income:0, expense:0, savings:0 }; });

      expenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getFullYear() === year) {
          const m = MONTHS[d.getMonth()];
          map[m].expense += Number(e.amount || 0);
        }
      });

      incomes.forEach(i => {
        const d = new Date(i.date);
        if (d.getFullYear() === year) {
          const m = MONTHS[d.getMonth()];
          map[m].income += Number(i.amount || 0);
        }
      });

      const data = Object.values(map).map(m => ({ ...m, savings: m.income - m.expense }));

      const activeMonths = data.filter(m => m.expense > 0);
      const avgExpense = activeMonths.length > 0
        ? Math.round(activeMonths.reduce((s,m) => s + m.expense, 0) / activeMonths.length) : 0;
      const bestMonth = data.reduce((best,m) => m.savings > (best.savings ?? -Infinity) ? m : best, {});
      const totalSaved = data.reduce((s,m) => s + m.savings, 0);

      setMonthlyData(data);
      setSummary({ bestMonth: bestMonth.month || "—", avgExpense, totalSaved });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const currentMonth = MONTHS[new Date().getMonth()];
  const currentData = monthlyData.find(m => m.month === currentMonth) || {};
  const lastMonthIdx = new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1;
  const lastData = monthlyData.find(m => m.month === MONTHS[lastMonthIdx]) || {};
  const expenseDiff = (currentData.expense || 0) - (lastData.expense || 0);

  return (
    <Layout title="Monthly Report">
      {loading ? (
        <Card><div style={{ padding:40, textAlign:"center", color:"var(--text3)" }}>Loading report...</div></Card>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:16, marginBottom:28 }}>
            <StatCard label="This Month Expense" value={`₹${(currentData.expense||0).toLocaleString()}`} icon="↑" color="var(--red)" />
            <StatCard label="This Month Income" value={`₹${(currentData.income||0).toLocaleString()}`} icon="↓" color="var(--green)" />
            <StatCard label="vs Last Month"
              value={expenseDiff === 0 ? "Same" : `${expenseDiff > 0 ? "+" : ""}₹${Math.abs(expenseDiff).toLocaleString()}`}
              icon={expenseDiff > 0 ? "↑" : "↓"}
              color={expenseDiff > 0 ? "var(--red)" : "var(--green)"}
              sub={expenseDiff > 0 ? "Spent more" : "Spent less"} />
            <StatCard label="Avg Monthly Expense" value={`₹${summary.avgExpense.toLocaleString()}`} icon="◈" color="var(--accent2)" />
            <StatCard label="Total Saved (Year)" value={`₹${summary.totalSaved.toLocaleString()}`} icon="◎"
              color={summary.totalSaved >= 0 ? "var(--green)" : "var(--red)"} />
            <StatCard label="Best Savings Month" value={summary.bestMonth} icon="🏆" color="var(--yellow)" />
          </div>

          <Card style={{ marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>All Months — {new Date().getFullYear()}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
                <XAxis dataKey="month" tick={{ fill:"var(--text3)", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"var(--text3)", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text)" }}
                  formatter={val => `₹${Number(val).toLocaleString()}`}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"var(--text2)" }} />
                <Bar dataKey="income"  name="Income"  fill="#34d399" radius={[4,4,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4,4,0,0]} />
                <Bar dataKey="savings" name="Savings" fill="#6c63ff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Month-by-Month Breakdown</h3>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    {["Month","Income","Expense","Savings","Status"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, i) => (
                    <tr key={i}
                      style={{ borderBottom:"1px solid rgba(108,99,255,0.06)", background: m.month === currentMonth ? "rgba(108,99,255,0.05)" : "" }}
                      onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
                      onMouseLeave={e => e.currentTarget.style.background = m.month === currentMonth ? "rgba(108,99,255,0.05)" : ""}>
                      <td style={{ padding:"12px 14px", fontSize:13, fontWeight: m.month === currentMonth ? 700 : 400, color: m.month === currentMonth ? "var(--accent2)" : "var(--text)" }}>
                        {m.month} {m.month === currentMonth ? "← now" : ""}
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:13, color:"var(--green)", fontWeight:600 }}>
                        {m.income > 0 ? `₹${m.income.toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:13, color:"var(--red)", fontWeight:600 }}>
                        {m.expense > 0 ? `₹${m.expense.toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color: m.savings >= 0 ? "var(--green)" : "var(--red)" }}>
                        {m.income > 0 || m.expense > 0 ? `₹${m.savings.toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        {m.expense === 0 && m.income === 0
                          ? <span style={{ fontSize:11, color:"var(--text3)" }}>No data</span>
                          : m.savings >= 0
                            ? <span style={{ fontSize:11, color:"var(--green)", fontWeight:600 }}>✓ Saved</span>
                            : <span style={{ fontSize:11, color:"var(--red)", fontWeight:600 }}>✗ Deficit</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </Layout>
  );
}