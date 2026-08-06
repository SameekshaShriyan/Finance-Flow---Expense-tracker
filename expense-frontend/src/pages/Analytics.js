import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, StatCard } from "../components/UI";
import API from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend } from "recharts";

const COLORS = ["#6c63ff", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // GET /api/analytics  → { totalIncome, totalExpense, balance }
        // GET /api/expenses/all  → for category breakdown & monthly trend
        const [analyticsRes, expRes, incRes] = await Promise.all([
          API.get("/analytics"),
          API.get("/expenses/all").catch(() => ({ data: [] })),
          API.get("/income/all").catch(() => ({ data: [] })),
        ]);

        const { totalIncome, totalExpense, balance } = analyticsRes.data;
        const expenses = expRes.data || [];
        const incomes = incRes.data || [];

        // Category breakdown from expenses
        const catMap = {};
        expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0); });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        // Monthly comparison
        const monthMap = {};
        expenses.forEach(e => {
          const m = new Date(e.date).toLocaleString("default", { month: "short" });
          if (!monthMap[m]) monthMap[m] = { month: m, expense: 0, income: 0 };
          monthMap[m].expense += Number(e.amount || 0);
        });
        incomes.forEach(i => {
          const m = new Date(i.date).toLocaleString("default", { month: "short" });
          if (!monthMap[m]) monthMap[m] = { month: m, expense: 0, income: 0 };
          monthMap[m].income += Number(i.amount || 0);
        });

        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
        setData({ totalIncome, totalExpense, balance, savingsRate, categoryData, monthlyData: Object.values(monthMap) });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <Layout title="Analytics"><div style={{ color: "var(--text3)", padding: 20 }}>Loading analytics...</div></Layout>;

  return (
    <Layout title="Financial Analytics">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Income" value={`₹${(data?.totalIncome || 0).toLocaleString()}`} icon="↓" color="var(--green)" />
        <StatCard label="Total Expenses" value={`₹${(data?.totalExpense || 0).toLocaleString()}`} icon="↑" color="var(--red)" />
        <StatCard label="Net Balance" value={`₹${(data?.balance || 0).toLocaleString()}`} icon="◎" color="var(--accent2)" />
        <StatCard label="Savings Rate" value={`${data?.savingsRate}%`} icon="◈" color="var(--yellow)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Expenses by Category</h3>
          {data?.categoryData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.categoryData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {data.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text2)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>No data yet</div>}
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Income vs Expenses</h3>
          {data?.monthlyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
                <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text2)" }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>No data yet</div>}
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Financial Trend</h3>
        {data?.monthlyData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyData}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} /><stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
              <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} fill="url(#incGrad)" />
              <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expGrad)" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text2)" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>No data yet</div>}
      </Card>
    </Layout>
  );
}
