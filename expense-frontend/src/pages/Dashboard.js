import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { StatCard, Card } from "../components/UI";
import API from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#6c63ff", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171"];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalExpense:0, totalIncome:0, categoryData:[], monthlyData:[], recentExpenses:[] });
  const [alerts, setAlerts] = useState([]);
  const [, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes, budgetRes, billRes] = await Promise.all([
        API.get("/expenses/all").catch(() => ({ data:[] })),
        API.get("/income/all").catch(() => ({ data:[] })),
        API.get("/budgets/all").catch(() => ({ data:[] })),
        API.get("/bills/all").catch(() => ({ data:[] })),
      ]);

      const expenses = expRes.data || [];
      const income   = incRes.data || [];
      const budgets  = budgetRes.data || [];
      const bills    = billRes.data || [];

      const totalExpense = expenses.reduce((s,e) => s + Number(e.amount||0), 0);
      const totalIncome  = income.reduce((s,i) => s + Number(i.amount||0), 0);

      const catMap = {};
      expenses.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + Number(e.amount||0); });
      const categoryData = Object.entries(catMap).map(([name,value]) => ({ name, value }));

      const monthMap = {};
      expenses.forEach(e => {
        const m = new Date(e.date).toLocaleString("default", { month:"short" });
        monthMap[m] = (monthMap[m]||0) + Number(e.amount||0);
      });
      const monthlyData = Object.entries(monthMap).map(([month,amount]) => ({ month, amount }));

      // Alerts
      const newAlerts = [];
      const today = new Date(); today.setHours(0,0,0,0);
      const now = new Date();
      const thisMonth = now.getMonth() + 1;
      const thisYear  = now.getFullYear();

      bills.forEach(bill => {
        const due = new Date(bill.dueDate); due.setHours(0,0,0,0);
        const diff = Math.ceil((due - today) / (1000*60*60*24));
        if (diff === 0) {
          newAlerts.push({ type:"danger", msg:`🔔 Bill due today: "${bill.billName}" — ₹${Number(bill.amount).toLocaleString()}` });
        }
      });

      const monthExp = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth()+1 === thisMonth && d.getFullYear() === thisYear;
      });

      budgets.forEach(budget => {
        const spent = monthExp
          .filter(e => e.category === budget.category)
          .reduce((s,e) => s + Number(e.amount||0), 0);
        const limit = Number(budget.limit);
        if (spent > limit) {
          newAlerts.push({ type:"danger", msg:`🚨 "${budget.category}" budget exceeded! Spent ₹${spent.toLocaleString()} of ₹${limit.toLocaleString()}` });
        } else if (limit > 0 && (spent/limit) >= 0.8) {
          newAlerts.push({ type:"warning", msg:`⚠️ "${budget.category}" budget at ${((spent/limit)*100).toFixed(0)}% — ₹${(limit-spent).toLocaleString()} left` });
        }
      });

      setAlerts(newAlerts);
      setStats({ totalExpense, totalIncome, categoryData, monthlyData, recentExpenses: expenses.slice(-5).reverse() });
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const balance    = stats.totalIncome - stats.totalExpense;
  const budget     = 10000;
  const budgetUsed = ((stats.totalExpense / budget) * 100).toFixed(1);

  return (
    <Layout>
      {/* Alert banners */}
      {alerts.length > 0 && (
        <div style={{ marginBottom:20, display:"flex", flexDirection:"column", gap:8 }}>
          {alerts.map((a,i) => (
            <div key={i} style={{
              padding:"12px 16px", borderRadius:"var(--radius-sm)",
              background: a.type==="danger" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
              border:`1px solid ${a.type==="danger" ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`,
              color: a.type==="danger" ? "var(--red)" : "var(--yellow)",
              fontSize:13, fontWeight:500,
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span>{a.msg}</span>
              <Link to="/notifications" style={{ fontSize:11, color:"inherit", opacity:0.7, textDecoration:"underline" }}>View all →</Link>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span style={{ color:"var(--accent2)" }}>{user?.name?.split(" ")[0] || "there"} 👋</span>
        </h1>
        <p style={{ color:"var(--text2)", marginTop:4, fontSize:14 }}>Here's your financial overview</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:28 }}>
        <StatCard label="Total Balance"   value={`₹${balance.toLocaleString()}`}            icon="⬡" color={balance >= 0 ? "var(--green)" : "var(--red)"} sub="Income − Expenses" />
        <StatCard label="Total Income"    value={`₹${stats.totalIncome.toLocaleString()}`}  icon="↓" color="var(--green)" />
        <StatCard label="Total Expenses"  value={`₹${stats.totalExpense.toLocaleString()}`} icon="↑" color="var(--red)" />
        <StatCard label="Budget Used"     value={`${budgetUsed}%`}                          icon="◎" color="var(--yellow)" sub={`of ₹${budget.toLocaleString()}`} />
      </div>

      {/* Budget bar */}
      <Card style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text2)" }}>Monthly Budget</div>
          <div style={{ fontSize:13, fontWeight:600, color: Number(budgetUsed) > 80 ? "var(--red)" : "var(--green)" }}>{budgetUsed}% used</div>
        </div>
        <div style={{ height:8, background:"var(--bg3)", borderRadius:999, overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:999,
            width:`${Math.min(budgetUsed,100)}%`,
            background: Number(budgetUsed) > 80 ? "var(--red)" : Number(budgetUsed) > 60 ? "var(--yellow)" : "var(--green)",
            transition:"width 0.8s ease",
          }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:12, color:"var(--text3)" }}>₹{stats.totalExpense.toLocaleString()} spent</span>
          <span style={{ fontSize:12, color:"var(--text3)" }}>₹{budget.toLocaleString()} budget</span>
        </div>
      </Card>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>Spending by Category</h3>
          {stats.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.categoryData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40}>
                  {stats.categoryData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text3)", fontSize:13 }}>No expense data yet</div>
          )}
        </Card>

        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>Monthly Trend</h3>
          {stats.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.08)" />
                <XAxis dataKey="month" tick={{ fill:"var(--text3)", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis                 tick={{ fill:"var(--text3)", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text)" }} />
                <Area type="monotone" dataKey="amount" stroke="#6c63ff" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text3)", fontSize:13 }}>No monthly data yet</div>
          )}
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Recent Expenses</h3>
        {stats.recentExpenses.length === 0 ? (
          <div style={{ padding:"24px 0", textAlign:"center", color:"var(--text3)", fontSize:13 }}>
            No expenses yet. <Link to="/add-expense" style={{ color:"var(--accent2)" }}>Add one →</Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {stats.recentExpenses.map((exp,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"var(--bg3)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{exp.title || "Expense"}</div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{exp.category} • {new Date(exp.date).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--red)" }}>−₹{Number(exp.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}