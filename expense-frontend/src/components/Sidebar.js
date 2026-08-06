import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const userNav = [
  { group: "Overview", items: [
    { label: "Dashboard",      path: "/dashboard",      icon: "⬡" },
    { label: "Monthly Report", path: "/monthly-report", icon: "📅" },
  ]},
  { group: "Transactions", items: [
    { label: "Add Expense", path: "/add-expense", icon: "↑" },
    { label: "Add Income",  path: "/income",      icon: "↓" },
    { label: "History",     path: "/history",     icon: "⊡" },
  ]},
  { group: "Planning", items: [
    { label: "Budget & Goals", path: "/budget", icon: "◎" },
    { label: "Bill Reminders", path: "/bills",  icon: "◷" },
  ]},
  { group: "Insights", items: [
    { label: "Analytics", path: "/analytics", icon: "◈" },
  ]},
];

const adminNav = [
  { group: "Admin", items: [
    { label: "Dashboard",       path: "/admin",            icon: "⬡" },
    { label: "User Management", path: "/admin/users",      icon: "◉" },
    { label: "Categories",      path: "/admin/categories", icon: "◫" },
    { label: "Analytics",       path: "/admin/analytics",  icon: "◈" },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const nav = user?.role === "admin" ? adminNav : userNav;
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user?.role !== "user") return;
    const checkAlerts = async () => {
      try {
        const [budgetRes, billRes, expRes] = await Promise.all([
          API.get("/budgets/all").catch(() => ({ data: [] })),
          API.get("/bills/all").catch(() => ({ data: [] })),
          API.get("/expenses/all").catch(() => ({ data: [] })),
        ]);
        let count = 0;
        const today = new Date(); today.setHours(0,0,0,0);
        const now = new Date();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();

        (billRes.data || []).forEach(bill => {
          const due = new Date(bill.dueDate); due.setHours(0,0,0,0);
          const diff = Math.ceil((due - today) / (1000*60*60*24));
          if (diff >= 0 && diff <= 3) count++;
        });

        const expenses = expRes.data || [];
        const monthExp = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth()+1 === thisMonth && d.getFullYear() === thisYear;
        });
        (budgetRes.data || []).forEach(budget => {
          const spent = monthExp
            .filter(e => e.category === budget.category)
            .reduce((s,e) => s + Number(e.amount||0), 0);
          const pct = Number(budget.limit) > 0 ? (spent / Number(budget.limit)) * 100 : 0;
          if (pct >= 80) count++;
        });

        setAlertCount(count);
      } catch {}
    };
    checkAlerts();
  }, [user]);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <aside style={{
        position:"fixed", top:0, left:0,
        width: collapsed ? 72 : 260,
        height:"100vh",
        background:"var(--bg2)",
        borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        padding:"24px 0",
        transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex:100, overflow:"hidden",
      }}>
        {/* Logo */}
        <div style={{ padding:"0 20px 28px", borderBottom:"1px solid var(--border)", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,var(--accent),var(--accent2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, flexShrink:0, boxShadow:"0 0 16px rgba(108,99,255,0.4)" }}>₹</div>
            {!collapsed && (
              <div>
                <div style={{ fontSize:15, fontFamily:"'Syne',sans-serif", fontWeight:700, color:"var(--text)", lineHeight:1.2 }}>FinanceFlow</div>
                <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500 }}>{user?.role === "admin" ? "Admin Panel" : "Personal Finance"}</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav links */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 12px" }}>
          {nav.map(group => (
            <div key={group.group} style={{ marginBottom:24 }}>
              {!collapsed && (
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:"var(--text3)", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>
                  {group.group}
                </div>
              )}
              {group.items.map(item => (
                <Link key={item.path} to={item.path} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius:"var(--radius-sm)", marginBottom:4,
                  color: isActive(item.path) ? "var(--accent2)" : "var(--text2)",
                  background: isActive(item.path) ? "rgba(108,99,255,0.12)" : "transparent",
                  border: isActive(item.path) ? "1px solid rgba(108,99,255,0.2)" : "1px solid transparent",
                  fontSize:14, fontWeight: isActive(item.path) ? 600 : 400,
                  transition:"all 0.2s", textDecoration:"none", whiteSpace:"nowrap",
                }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Notifications bell — user only */}
          {user?.role === "user" && (
            <div style={{ marginBottom:24 }}>
              {!collapsed && (
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:"var(--text3)", textTransform:"uppercase", padding:"0 8px", marginBottom:8 }}>
                  Alerts
                </div>
              )}
              <Link to="/notifications" style={{
                display:"flex", alignItems:"center", gap:12,
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius:"var(--radius-sm)",
                color: isActive("/notifications") ? "var(--accent2)" : "var(--text2)",
                background: isActive("/notifications") ? "rgba(108,99,255,0.12)" : "transparent",
                border: isActive("/notifications") ? "1px solid rgba(108,99,255,0.2)" : "1px solid transparent",
                fontSize:14, fontWeight: isActive("/notifications") ? 600 : 400,
                transition:"all 0.2s", textDecoration:"none",
              }}>
                <span style={{ fontSize:16, flexShrink:0, position:"relative" }}>
                  🔔
                  {alertCount > 0 && (
                    <span style={{
                      position:"absolute", top:-6, right:-6,
                      width:16, height:16, borderRadius:"50%",
                      background:"var(--red)", color:"#fff",
                      fontSize:9, fontWeight:800,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:"2px solid var(--bg2)",
                    }}>{alertCount}</span>
                  )}
                </span>
                {!collapsed && (
                  <span style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    Notifications
                    {alertCount > 0 && (
                      <span style={{ background:"var(--red)", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:999 }}>{alertCount}</span>
                    )}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* User + Logout */}
        <div style={{ padding:"16px 12px 0", borderTop:"1px solid var(--border)" }}>
          {!collapsed && (
            <div style={{ padding:"10px 12px", borderRadius:"var(--radius-sm)", background:"var(--surface)", marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || user?.email}</div>
              <div style={{ fontSize:11, color:"var(--accent2)", textTransform:"capitalize", fontWeight:500 }}>{user?.role}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width:"100%", padding:"10px 12px", borderRadius:"var(--radius-sm)",
            background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)",
            color:"var(--red)", fontSize:13, fontWeight:500, cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
            justifyContent: collapsed ? "center" : "flex-start",
            transition:"all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(248,113,113,0.08)"}>
            <span>⏻</span>{!collapsed && "Logout"}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} style={{
          position:"absolute", top:24, right:-12,
          width:24, height:24, borderRadius:"50%",
          background:"var(--surface2)", border:"1px solid var(--border2)",
          color:"var(--text2)", fontSize:10, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {collapsed ? "›" : "‹"}
        </button>
      </aside>
      <div style={{ width: collapsed ? 72 : 260, flexShrink:0, transition:"width 0.3s" }} />
    </>
  );
}