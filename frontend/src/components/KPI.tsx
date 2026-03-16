import clsx from "clsx";

interface Props {
  label: string;
  value: string;
  subtitle?: string;
  color?: "pri" | "err" | "warn" | "ok";
  onClick?: () => void;
}

const borderColors = {
  pri: "border-t-pri",
  err: "border-t-err",
  warn: "border-t-warn",
  ok: "border-t-ok",
};

const textColors = {
  pri: "text-pri",
  err: "text-err",
  warn: "text-[#F59E0B]",
  ok: "text-ok",
};

export default function KPI({ label, value, subtitle, color = "pri", onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm border-t-[3px] cursor-pointer transition-shadow hover:shadow-md",
        borderColors[color],
      )}
    >
      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{label}</div>
      <div className={clsx("text-[22px] font-bold font-mono tracking-tight", textColors[color])}>{value}</div>
      {subtitle && <div className="text-[10px] text-slate-500 mt-0.5" dangerouslySetInnerHTML={{ __html: subtitle }} />}
    </div>
  );
}
