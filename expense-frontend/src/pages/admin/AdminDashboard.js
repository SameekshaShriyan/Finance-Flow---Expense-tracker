import { useEffect, useState } from "react";
import AdminLayout from "../../components/adminLayout";
import { StatCard, Card } from "../../components/UI";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCategories: 0, totalTransactions: 0 });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // GET /api/admin/stats  → { totalUsers, totalCategories, totalTransactions }
        const [statsRes, expRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/expenses/all").catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);

        const expenses = expRes.data || [];
        const monthMap = {};
        expenses.forEach(e => {
          const m = new Date(e.date).toLocaleString("default", { month: "short" });
          monthMap[m] = (monthMap[m] || 0) + 1;
        });
        setMonthlyData(Object.entries(monthMap).map(([name, transactions]) => ({ name, transactions })));
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Users" value={stats.totalUsers} icon="◉" color="var(--accent2)" />
        <StatCard label="Total Transactions" value={stats.totalTransactions} icon="⊡" color="var(--accent3)" />
        <StatCard label="Categories" value={stats.totalCategories} icon="◫" color="var(--yellow)" />
        <StatCard label="System Status" value="Active" icon="●" color="var(--green)" sub="All services running" />
      </div>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Monthly Transaction Volume</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.07)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text)" }} />
              <Bar dataKey="transactions" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>No transaction data yet</div>
        )}
      </Card>
    </AdminLayout>
  );
}
