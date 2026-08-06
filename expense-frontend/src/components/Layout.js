import Sidebar from "./Sidebar";

export default function Layout({ children, title }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", maxWidth: "calc(100vw - 260px)", animation: "fadeUp 0.4s ease" }}>
        {title && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
