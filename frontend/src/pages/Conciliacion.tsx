import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import KPI from "@/components/KPI";
import Card from "@/components/Card";
import { cartolaApi, movementApi } from "@/api/client";

export default function Conciliacion() {
  const { data: filters } = useQuery({ queryKey: ["filters"], queryFn: movementApi.filters });
  const [bankId, setBankId] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["recon-summary", bankId],
    queryFn: () => cartolaApi.reconciliationSummary(bankId ? Number(bankId) : undefined),
  });

  const { data: pendingEntries = [] } = useQuery({
    queryKey: ["cartolas-pending", bankId],
    queryFn: () => cartolaApi.list({ reconciled: "false" as any, ...(bankId ? { bank_id: bankId } : {}) }),
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white">
          <option value="">Todos los bancos</option>
          {filters?.banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <KPI
          label="Tasa Conciliación"
          value={summary ? `${summary.reconciliation_rate}%` : "—"}
          color={summary && summary.reconciliation_rate >= 70 ? "ok" : "warn"}
        />
        <KPI label="Conciliados" value={summary ? `${summary.reconciled}` : "—"} color="ok" />
        <KPI label="Pendientes" value={summary ? `${summary.pending}` : "—"} color="warn" />
        <KPI label="Auto-match" value={summary ? `${summary.auto_matched}` : "—"} subtitle="conciliación automática" color="pri" />
      </div>

      <div className="grid md:grid-cols-2 gap-3.5">
        <Card title="Conciliación Automática" subtitle="resumen">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center shrink-0">
              <div className="text-[32px] font-bold font-mono text-ok">{summary ? `${summary.reconciliation_rate}%` : "—"}</div>
              <div className="text-[9px] text-slate-400">Auto-conciliados</div>
            </div>
            <div className="flex-1 text-[10px] text-slate-500 leading-relaxed min-w-[150px]">
              {summary ? (
                <>
                  {summary.reconciled} de {summary.total_entries} entradas conciliadas.<br />
                  {summary.pending} sin match.<br />
                  <strong>Meta: &gt;70%</strong> →{" "}
                  <span className={`font-semibold ${summary.reconciliation_rate >= 70 ? "text-ok" : "text-err"}`}>
                    {summary.reconciliation_rate >= 70 ? "Cumplida" : "Pendiente"}
                  </span>
                </>
              ) : (
                "Cargando..."
              )}
            </div>
          </div>
        </Card>

        <Card title="Entradas Pendientes" subtitle={`${pendingEntries.length} sin conciliar`}>
          <div className="max-h-[300px] overflow-y-auto">
            {pendingEntries.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">Todo conciliado</div>
            ) : (
              pendingEntries.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 text-[11px]">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{e.bank_name} · {e.date}</div>
                    <div className="text-slate-400 truncate">{e.description || "Sin descripción"}</div>
                  </div>
                  <div className="font-mono font-semibold shrink-0">
                    {Number(e.credit) > 0 ? (
                      <span className="text-ok">+${Number(e.credit).toLocaleString("es-CL")}</span>
                    ) : (
                      <span className="text-err">-${Number(e.debit).toLocaleString("es-CL")}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
