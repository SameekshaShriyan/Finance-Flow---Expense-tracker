import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Button, Select } from "../components/UI";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)",
      backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.15), transparent)",
    }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(108,99,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.04) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }} />

      <div style={{ width:"100%", maxWidth:420, padding:24, animation:"fadeUp 0.5s ease", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 16px",
            background:"linear-gradient(135deg, var(--accent), var(--accent2))",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, fontWeight:800, boxShadow:"0 0 32px rgba(108,99,255,0.4)" }}>₹</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Welcome back</h1>
          <p style={{ color:"var(--text2)", marginTop:6, fontSize:14 }}>Sign in to FinanceFlow</p>
        </div>

        <div style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:32, boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Input label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Select label="Login as" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="user">👤 User</option>
              <option value="admin">🛡️ Admin</option>
            </Select>

            {error && (
              <div style={{ padding:"10px 14px", borderRadius:"var(--radius-sm)", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"var(--red)", fontSize:13 }}>
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} style={{ marginTop:4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:20, color:"var(--text3)", fontSize:13 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color:"var(--accent2)", fontWeight:600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
