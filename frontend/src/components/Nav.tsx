import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  tabs: readonly Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Nav({ tabs, activeTab, onTabChange }: Props) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto flex items-center h-[50px] px-5 gap-1">
        <div className="font-bold text-sm text-ch flex items-center gap-1.5 shrink-0">
          ⚡ <span className="text-pri">Terralink</span> Tesorería
        </div>

        <div className="flex gap-px ml-4 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1",
                activeTab === t.id
                  ? "bg-pri-light text-pri font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] text-slate-400">{new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-full bg-pri flex items-center justify-center text-[10px] font-bold text-white"
            title="Cerrar sesión"
          >
            {user?.initials || "??"}
          </button>
        </div>
      </div>
    </nav>
  );
}
