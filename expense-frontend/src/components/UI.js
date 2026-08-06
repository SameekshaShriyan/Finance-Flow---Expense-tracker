// Shared reusable UI primitives

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 24,
      ...style
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, color = "var(--accent)", sub }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 22,
      transition: "transform 0.2s, border-color 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)" }}>{label}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", letterSpacing: "0.04em" }}>{label}</label>}
      <input
        style={{
          background: "var(--bg3)",
          border: `1px solid ${error ? "var(--red)" : "var(--border2)"}`,
          borderRadius: "var(--radius-sm)",
          padding: "11px 14px",
          color: "var(--text)",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          width: "100%",
        }}
        onFocus={e => e.target.style.borderColor = "var(--accent)"}
        onBlur={e => e.target.style.borderColor = error ? "var(--red)" : "var(--border2)"}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

export function Select({ label, children, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", letterSpacing: "0.04em" }}>{label}</label>}
      <select
        style={{
          background: "var(--bg3)",
          border: `1px solid ${error ? "var(--red)" : "var(--border2)"}`,
          borderRadius: "var(--radius-sm)",
          padding: "11px 14px",
          color: "var(--text)",
          fontSize: 14,
          outline: "none",
          cursor: "pointer",
          width: "100%",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

export function Button({ children, variant = "primary", loading, style = {}, ...props }) {
  const styles = {
    primary: { background: "linear-gradient(135deg, var(--accent), var(--accent2))", color: "#fff", border: "none" },
    secondary: { background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border2)" },
    danger: { background: "rgba(248,113,113,0.1)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.2)" },
  };

  return (
    <button
      style={{
        padding: "11px 24px",
        borderRadius: "var(--radius-sm)",
        fontSize: 14, fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 8,
        transition: "all 0.2s",
        opacity: loading ? 0.7 : 1,
        ...styles[variant],
        ...style,
      }}
      disabled={loading}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
      {...props}
    >
      {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display:"inline-block" }} />}
      {children}
    </button>
  );
}

export function Badge({ children, color = "var(--accent)" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      background: `${color}20`,
      color,
      border: `1px solid ${color}40`,
    }}>{children}</span>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const colors = { success: "var(--green)", error: "var(--red)", info: "var(--accent3)" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "var(--surface2)",
      border: `1px solid ${colors[type]}40`,
      borderRadius: "var(--radius-sm)",
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 12,
      animation: "fadeUp 0.3s ease",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[type], boxShadow: `0 0 8px ${colors[type]}` }} />
      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 16, marginLeft: 8 }}>×</button>
    </div>
  );
}
