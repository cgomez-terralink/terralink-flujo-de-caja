import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, subtitle, actions, children }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-3.5 shadow-sm">
      <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-1.5">
        <div className="text-xs font-bold text-ch">
          {title}
          {subtitle && <span className="text-slate-500 font-normal text-[11px] ml-1">{subtitle}</span>}
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
