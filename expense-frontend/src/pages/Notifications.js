import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, Badge } from "../components/UI";
import API from "../services/api";

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const [expRes, budgetRes, billRes] = await Promise.all([
        API.get("/expenses/all").catch(() => ({ data: [] })),
        API.get("/budgets/all").catch(() => ({ data: [] })),
        API.get("/bills/all").catch(() => ({ data: [] })),
      ]);

      const expenses = expRes.data || [];
      const budgets = budgetRes.data || [];
      const bills = billRes.data || [];
      const newAlerts = [];

      const today = new Date(); today.setHours(0,0,0,0);
      const now = new Date();
      const thisMonth = now.getMonth() + 1;
      const thisYear = now.getFullYear();

      // Bill due today or soon
      bills.forEach(bill => {
        const due = new Date(bill.dueDate); due.setHours(0,0,0,0);
        const diffDays = Math.ceil((due - today) / (1000*60*60*24));
        if (diffDays === 0) {
          newAlerts.push({
            type:"danger", icon:"⏰",
            title:"Bill Due Today!",
            message:`Your bill "${bill.billName}" of ₹${Number(bill.amount).toLocaleString()} is due today.`,
            time:"Today",
          });
        } else if (diffDays > 0 && diffDays <= 3) {
          newAlerts.push({
            type:"warning", icon:"📅",
            title:"Bill Due Soon",
            message:`"${bill.billName}" of ₹${Number(bill.amount).toLocaleString()} is due in ${diffDays} day${diffDays > 1 ? "s" : ""}.`,
            time:`In ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          });
        }
      });

      // Budget exceeded or 80%+
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth()+1 === thisMonth && d.getFullYear() === thisYear;
      });

      budgets.forEach(budget => {
        const spent = monthExpenses
          .filter(e => e.category === budget.category)
          .reduce((s,e) => s + Number(e.amount||0), 0);
        const limit = Number(budget.limit);
        const percent = limit > 0 ? ((spent/limit)*100).toFixed(0) : 0;

        if (spent > limit) {
          newAlerts.push({
            type:"danger", icon:"🚨",
            title:"Budget Exceeded!",
            message:`You've exceeded your "${budget.category}" budget! Spent ₹${spent.toLocaleString()} of ₹${limit.toLocaleString()} (${percent}%).`,
            time:"This month",
          });
        } else if (Number(percent) >= 80) {
          newAlerts.push({
            type:"warning", icon:"⚠️",
            title:"Budget Warning",
            message:`You've used ${percent}% of your "${budget.category}" budget. ₹${(limit-spent).toLocaleString()} remaining.`,
            time:"This month",
          });
        }
      });

      if (newAlerts.length === 0) {
        newAlerts.push({
          type:"success", icon:"✅",
          title:"All Clear!",
          message:"No budget overruns or upcoming bills. You're on track!",
          time:"Now",
        });
      }

      setAlerts(newAlerts);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const colors = {
    danger:  { bg:"rgba(248,113,113,0.08)",  border:"rgba(248,113,113,0.2)",  badge:"var(--red)",    label:"Alert"   },
    warning: { bg:"rgba(251,191,36,0.08)",   border:"rgba(251,191,36,0.2)",   badge:"var(--yellow)", label:"Warning" },
    success: { bg:"rgba(52,211,153,0.08)",   border:"rgba(52,211,153,0.2)",   badge:"var(--green)",  label:"Good"    },
  };

  return (
    <Layout title="Notifications">
      <div style={{ maxWidth:680 }}>
        {loading ? (
          <Card><div style={{ padding:40, textAlign:"center", color:"var(--text3)" }}>Checking alerts...</div></Card>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {alerts.map((alert, i) => {
              const c = colors[alert.type];
              return (
                <div key={i} style={{
                  background:c.bg, border:`1px solid ${c.border}`,
                  borderRadius:"var(--radius)", padding:"18px 20px",
                  display:"flex", gap:16, alignItems:"flex-start",
                  animation:`fadeUp 0.3s ease ${i*0.08}s both`,
                }}>
                  <div style={{ fontSize:24, flexShrink:0 }}>{alert.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{alert.title}</span>
                      <Badge color={c.badge}>{c.label}</Badge>
                    </div>
                    <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.5, margin:0 }}>{alert.message}</p>
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:8 }}>{alert.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}