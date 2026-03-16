import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/Card";
import { cartolaApi, movementApi } from "@/api/client";

function fmt(n: number): string {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function Cartolas() {
  const { data: filters } = useQuery({ queryKey: ["filters"], queryFn: movementApi.filters });
  const [bankId, setBankId] = useState("");

  const params: Record<string, string | number> = {};
  if (bankId) params.bank_id = bankId;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["cartolas", params],
    queryFn: () => cartolaApi.list(params),
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Todos los bancos</option>
          {filters?.banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span className="text-[10px] text-slate-400 self-center ml-2">{entries.length} entradas</span>
      </div>

      <Card title="Cartolas Bancarias" subtitle="movimientos de cuenta corriente">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[800px]">
            <thead>
              <tr className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                <th className="py-2 px-2">Fecha</th>
                <th className="py-2 px-2">Banco</th>
                <th className="py-2 px-2">Documento</th>
                <th className="py-2 px-2">Descripción</th>
                <th className="py-2 px-2 text-right">Cargo</th>
                <th className="py-2 px-2 text-right">Abono</th>
                <th className="py-2 px-2 text-right">Saldo</th>
                <th className="py-2 px-2">Conciliado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Cargando...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400">Sin entradas de cartola</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-2 whitespace-nowrap">{e.date}</td>
                    <td className="py-2 px-2 font-medium">{e.bank_name}</td>
                    <td className="py-2 px-2 font-mono text-slate-500">{e.document || "—"}</td>
                    <td className="py-2 px-2 max-w-[250px] truncate">{e.description || "—"}</td>
                    <td className="py-2 px-2 text-right font-mono text-err">{Number(e.debit) > 0 ? fmt(Number(e.debit)) : "—"}</td>
                    <td className="py-2 px-2 text-right font-mono text-ok">{Number(e.credit) > 0 ? fmt(Number(e.credit)) : "—"}</td>
                    <td className="py-2 px-2 text-right font-mono font-semibold">{e.balance != null ? fmt(Number(e.balance)) : "—"}</td>
                    <td className="py-2 px-2">
                      {e.movement_id ? (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold bg-ok-light text-ok">Sí</span>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold bg-warn-light text-[#F59E0B]">Pendiente</span>
                      )}
                    </td>
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
