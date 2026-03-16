import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Nav from "@/components/Nav";
import Panel from "@/pages/Panel";
import FlujoCaja from "@/pages/FlujoCaja";
import Cartolas from "@/pages/Cartolas";
import Conciliacion from "@/pages/Conciliacion";
import Movimientos from "@/pages/Movimientos";

const TABS = [
  { id: "panel", label: "Panel", icon: "📊" },
  { id: "flujo", label: "Flujo de Caja", icon: "💰" },
  { id: "movimientos", label: "Movimientos", icon: "📋" },
  { id: "cartolas", label: "Cartolas", icon: "🏦" },
  { id: "conciliacion", label: "Conciliación", icon: "✅" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<TabId>("panel");

  if (!isAuthenticated) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav tabs={TABS} activeTab={tab} onTabChange={(t) => setTab(t as TabId)} />
      <main className="max-w-[1280px] mx-auto p-5">
        {tab === "panel" && <Panel onNavigate={(t) => setTab(t as TabId)} />}
        {tab === "flujo" && <FlujoCaja />}
        {tab === "movimientos" && <Movimientos />}
        {tab === "cartolas" && <Cartolas />}
        {tab === "conciliacion" && <Conciliacion />}
      </main>
    </div>
  );
}
