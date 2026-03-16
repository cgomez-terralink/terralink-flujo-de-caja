import clsx from "clsx";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}

export default function FilterBar({ options, value, onChange }: Props) {
  return (
    <div className="flex gap-0.5 overflow-x-auto pb-0.5 mb-3.5 scrollbar-hide">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "px-3 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap transition-all",
            value === o.value
              ? "bg-pri-light text-pri border-pri"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
