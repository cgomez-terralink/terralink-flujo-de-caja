import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/Card";
import { movementApi } from "@/api/client";

function fmt(n: number): string {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function Movimientos() {
  const { data: filters } = useQuery({ queryKey: ["filters"], queryFn: movementApi.filters });
  const [bankId, setBankId] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [businessCenter, setBusinessCenter] = useState("");
  const [movementType, setMovementType] = useState("");

  const params: Record<string, string | number> = {};
  if (bankId) params.bank_id = bankId;
  if (year) params.year = year;
  if (status) params.status = status;
  if (businessCenter) params.business_center = businessCenter;
  if (movementType) params.movement_type = movementType;

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["movements", params],
    queryFn: () => movementApi.list(params),
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Año</option>
          {filters?.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Banco</option>
          {filters?.banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={businessCenter} onChange={(e) => setBusinessCenter(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Centro de negocio</option>
          {filters?.business_centers.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Tipo</option>
          <option value="Ingreso">Ingreso</option>
          <option value="Egreso">Egreso</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Estado</option>
          {filters?.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-[10px] text-slate-400 self-center ml-2">{movements.length} movimientos</span>
      </div>

      <Card title="Movimientos BBDD" subtitle={`${movements.length} filas`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                <th className="py-2 px-2">Fecha</th>
                <th className="py-2 px-2">Tipo</th>
                <th className="py-2 px-2">Banco</th>
                <th className="py-2 px-2">Proveedor/Cliente</th>
                <th className="py-2 px-2">Concepto</th>
                <th className="py-2 px-2">Centro</th>
                <th className="py-2 px-2 text-right">Monto FC</th>
                <th className="py-2 px-2">Estado</th>
                <th className="py-2 px-2">Período</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">Cargando...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">Sin movimientos</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-2 whitespace-nowrap">{m.date}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${m.movement_type === "Ingreso" ? "bg-ok-light text-ok" : "bg-err-light text-err"}`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium">{m.bank_name}</td>
                    <td className="py-2 px-2 max-w-[150px] truncate">{m.provider || "—"}</td>
                    <td className="py-2 px-2 max-w-[150px] truncate">{m.concept || "—"}</td>
                    <td className="py-2 px-2 text-slate-500">{m.business_center || "—"}</td>
                    <td className={`py-2 px-2 text-right font-mono font-semibold ${Number(m.cashflow_amount) >= 0 ? "text-ok" : "text-err"}`}>
                      {fmt(Number(m.cashflow_amount))}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${m.status === "Real" ? "bg-ok-light text-ok" : "bg-pri-light text-pri"}`}>
                        {m.status || "—"}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-400">{m.month_year || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
