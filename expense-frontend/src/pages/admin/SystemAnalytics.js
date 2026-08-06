import { useEffect, useState } from "react";
import AdminLayout from "../../components/adminLayout";
import { StatCard, Card } from "../../components/UI";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const COLORS = ["#6c63ff", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171"];

export default function SystemAnalytics() {
  const [data, setData] = useState({ monthly: [], categoryData: [], totalExpense: 0, totalIncome: 0, balance: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        // GET /api/analytics  → { totalIncome, totalExpense, balance }
        // GET /api/expenses/all for monthly breakdown
        const [analyticsRes, expRes] = await Promise.all([
          API.get("/analytics"),
          API.get("/expenses/all").catch(() => ({ data: [] })),
        ]);

        const { totalIncome, totalExpense, balance } = analyticsRes.data;
        const expenses = expRes.data || [];

        const monthMap = {};
        expenses.forEach(e => {
          const m = new Date(e.date).toLocaleString("default", { month: "short" });
          if (!monthMap[m]) monthMap[m] = { name: m, transactions: 0, amount: 0 };
          monthMap[m].transactions++;
          monthMap[m].amount += Number(e.amount || 0);
        });

        const catMap = {};
        expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0); });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        setData({ totalIncome, totalExpense, balance, monthly: Object.values(monthMap), categoryData });
      } catch (err) { console.error(err); }
    };
    fetch();
  }, []);

  return (
    <AdminLayout title="System Analytics">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Income" value={`₹${(data.totalIncome || 0).toLocaleString()}`} icon="↓" color="var(--green)" />
        <StatCard label="Total Expenses" value={`₹${(data.totalExpense || 0).toLocaleString()}`} icon="↑" color="var(--red)" />
        <StatCard label="Net Balance" value={`₹${(data.balance || 0).toLocaleString()}`} icon="⬡" color="var(--accent2)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Monthly Transactions</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
              <Bar dataKey="transactions" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Category Distribution</h3>
          {data.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.categoryData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45} paddingAngle={2}>
                  {data.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text2)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>No data yet</div>
          )}
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Volume Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
            <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
            <Line type="monotone" dataKey="amount" stroke="#6c63ff" strokeWidth={2} dot={{ fill: "#6c63ff", r: 4, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </AdminLayout>
  );
}
