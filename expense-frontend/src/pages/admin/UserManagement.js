import { useState, useEffect } from "react";
import AdminLayout from "../../components/adminLayout";
import { Card, Badge, Toast } from "../../components/UI";
import API from "../../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      // GET /api/admin/users  → array of { id, name, email, role }
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="User Management">
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text2)" }}>
          {filtered.length} users
        </div>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>No users found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["User", "Email", "Role"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id || user._id || i} style={{ borderBottom: "1px solid rgba(108,99,255,0.06)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {(user.name || user.email || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text2)" }}>{user.email}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge color={user.role === "admin" ? "var(--accent2)" : "var(--accent3)"}>{user.role || "user"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
