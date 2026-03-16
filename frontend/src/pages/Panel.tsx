import { useQuery } from "@tanstack/react-query";
import KPI from "@/components/KPI";
import Card from "@/components/Card";
import { movementApi, cartolaApi } from "@/api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString("es-CL")}`;
}

interface Props {
  onNavigate: (tab: string) => void;
}

export default function Panel({ onNavigate }: Props) {
  const { data: summary = [] } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => movementApi.summaryByPeriod({ year: new Date().getFullYear() }),
  });

  const { data: bankSummary = [] } = useQuery({
    queryKey: ["bank-summary"],
    queryFn: () => movementApi.summaryByBank({ year: new Date().getFullYear() }),
  });

  const { data: reconSummary } = useQuery({
    queryKey: ["recon-summary"],
    queryFn: () => cartolaApi.reconciliationSummary(),
  });

  const totalInflows = summary.reduce((s, r) => s + Number(r.total_inflows), 0);
  const totalOutflows = summary.reduce((s, r) => s + Number(r.total_outflows), 0);
  const totalNet = totalInflows - totalOutflows;
  const totalMov = summary.reduce((s, r) => s + r.movement_count, 0);

  const chartData = summary.map((s) => ({
    name: s.period,
    Ingresos: Number(s.total_inflows),
    Egresos: Number(s.total_outflows),
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <KPI label="Total Ingresos" value={fmt(totalInflows)} subtitle={`${totalMov} movimientos`} color="ok" onClick={() => onNavigate("flujo")} />
        <KPI label="Total Egresos" value={fmt(totalOutflows)} color="err" onClick={() => onNavigate("flujo")} />
        <KPI label="Neto" value={fmt(totalNet)} color={totalNet >= 0 ? "ok" : "err"} onClick={() => onNavigate("flujo")} />
        <KPI
          label="Conciliación"
          value={reconSummary ? `${reconSummary.reconciliation_rate}%` : "—"}
          subtitle={reconSummary ? `${reconSummary.reconciled}/${reconSummary.total_entries} conciliados` : ""}
          color="pri"
          onClick={() => onNavigate("conciliacion")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3.5">
        <Card title="Flujo de Caja" subtitle={`${new Date().getFullYear()}`}>
          <div className="h-[220px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Ingresos" fill="#BBF7D0" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#FECACA" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos — carga movimientos primero</div>
            )}
          </div>
        </Card>

        <Card title="Resumen por Banco">
          {bankSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                    <th className="py-1.5 px-2">Banco</th>
                    <th className="py-1.5 px-2 text-right">Ingresos</th>
                    <th className="py-1.5 px-2 text-right">Egresos</th>
                    <th className="py-1.5 px-2 text-right">Neto</th>
                    <th className="py-1.5 px-2 text-right">#</th>
                  </tr>
                </thead>
                <tbody>
                  {bankSummary.map((b) => (
                    <tr key={b.bank_id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-2 font-semibold">{b.bank_name}</td>
                      <td className="py-2 px-2 text-right font-mono text-ok">{fmt(Number(b.total_inflows))}</td>
                      <td className="py-2 px-2 text-right font-mono text-err">{fmt(Number(b.total_outflows))}</td>
                      <td className="py-2 px-2 text-right font-mono font-semibold">{fmt(Number(b.net))}</td>
                      <td className="py-2 px-2 text-right text-slate-400">{b.movement_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-slate-400 text-sm text-center py-8">Sin datos</div>
          )}
        </Card>
      </div>
    </>
  );
}
