import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/Card";
import FilterBar from "@/components/FilterBar";
import { movementApi } from "@/api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from "recharts";

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString("es-CL")}`;
}

export default function FlujoCaja() {
  const { data: filters } = useQuery({ queryKey: ["filters"], queryFn: movementApi.filters });
  const [year, setYear] = useState<string>("");
  const [bankId, setBankId] = useState<string>("");
  const [businessCenter, setBusinessCenter] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const params: Record<string, string | number> = {};
  if (year) params.year = year;
  if (bankId) params.bank_id = bankId;
  if (businessCenter) params.business_center = businessCenter;
  if (status) params.status = status;

  const { data: summary = [] } = useQuery({
    queryKey: ["cashflow-period", params],
    queryFn: () => movementApi.summaryByPeriod(params),
  });

  const { data: bankSummary = [] } = useQuery({
    queryKey: ["cashflow-bank", params],
    queryFn: () => movementApi.summaryByBank(params),
  });

  const chartData = summary.map((s) => ({
    name: s.period,
    Ingresos: Number(s.total_inflows),
    Egresos: Number(s.total_outflows),
    Neto: Number(s.net),
  }));

  // Cumulative net for trend line
  let cumulative = 0;
  const trendData = summary.map((s) => {
    cumulative += Number(s.net);
    return { name: s.period, Acumulado: cumulative };
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Todos los años</option>
          {filters?.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Todos los bancos</option>
          {filters?.banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={businessCenter} onChange={(e) => setBusinessCenter(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Todos los centros</option>
          {filters?.business_centers.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <FilterBar
          options={[
            { value: "", label: "Todos" },
            { value: "Real", label: "Real" },
            { value: "Proyectado", label: "Proyectado" },
          ]}
          value={status}
          onChange={setStatus}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3.5">
        {/* Bar chart - inflows vs outflows */}
        <Card title="Ingresos vs Egresos" subtitle="por período">
          <div className="h-[260px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Ingresos" fill="#34A853" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Egresos" fill="#E85D5D" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </Card>

        {/* Trend line - cumulative */}
        <Card title="Flujo Neto Acumulado">
          <div className="h-[260px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Line type="monotone" dataKey="Acumulado" stroke="#37ADE3" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sin datos</div>
            )}
          </div>
        </Card>
      </div>

      {/* Summary table by period */}
      <Card title="Detalle por Período" subtitle="tipo FC TL Total">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                <th className="py-2 px-2.5">Período</th>
                <th className="py-2 px-2.5 text-right">Ingresos</th>
                <th className="py-2 px-2.5 text-right">Egresos</th>
                <th className="py-2 px-2.5 text-right">Neto</th>
                <th className="py-2 px-2.5 text-right">Movimientos</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.period} className="border-t border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <td className="py-2 px-2.5 font-semibold">{s.period}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-ok">{fmt(Number(s.total_inflows))}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-err">{fmt(Number(s.total_outflows))}</td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold">{fmt(Number(s.net))}</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{s.movement_count}</td>
                </tr>
              ))}
              {summary.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin datos — carga movimientos</td></tr>
              )}
            </tbody>
            {summary.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-bold bg-slate-50">
                  <td className="py-2 px-2.5">Total</td>
                  <td className="py-2 px-2.5 text-right font-mono text-ok">{fmt(summary.reduce((s, r) => s + Number(r.total_inflows), 0))}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-err">{fmt(summary.reduce((s, r) => s + Number(r.total_outflows), 0))}</td>
                  <td className="py-2 px-2.5 text-right font-mono">{fmt(summary.reduce((s, r) => s + Number(r.net), 0))}</td>
                  <td className="py-2 px-2.5 text-right text-slate-500">{summary.reduce((s, r) => s + r.movement_count, 0)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* By bank */}
      <Card title="Resumen por Banco">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                <th className="py-2 px-2.5">Banco</th>
                <th className="py-2 px-2.5 text-right">Ingresos</th>
                <th className="py-2 px-2.5 text-right">Egresos</th>
                <th className="py-2 px-2.5 text-right">Neto</th>
                <th className="py-2 px-2.5 text-right">#</th>
              </tr>
            </thead>
            <tbody>
              {bankSummary.map((b) => (
                <tr key={b.bank_id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="py-2 px-2.5 font-semibold">{b.bank_name}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-ok">{fmt(Number(b.total_inflows))}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-err">{fmt(Number(b.total_outflows))}</td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold">{fmt(Number(b.net))}</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{b.movement_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
