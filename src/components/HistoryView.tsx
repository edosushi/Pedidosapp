import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Users,
} from 'lucide-react';
import { OrderHistoryEntry } from '../types/orders';
import {
  buildBossWhatsAppMessage,
  buildWhatsAppPickerUrl,
} from '../utils/whatsapp';
import { ConfirmSheet } from './ConfirmSheet';

interface HistoryViewProps {
  history: OrderHistoryEntry[];
  onRepeatOrder: (entry: OrderHistoryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onGoToOrder: () => void;
}

function formatDateEs(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onRepeatOrder,
  onDeleteEntry,
  onGoToOrder,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    history[0]?.id || null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderHistoryEntry | null>(null);

  const handleCopy = async (entry: OrderHistoryEntry) => {
    try {
      const text = buildBossWhatsAppMessage(entry.suppliers, entry.deliveryDay);
      await navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === entry.id ? null : curr));
      }, 1800);
    } catch {
      // ignore
    }
  };

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-8 text-center">
          <h2 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
            Sin pedidos guardados
          </h2>
          <p className="mt-2 text-sm text-[#6c6c66] dark:text-[#9a9991]">
            Cuando completes un pedido desde la pestaña Enviar y pulses &laquo;Guardar en historial y limpiar&raquo;, aparecerá aquí para poder repetirlo más adelante.
          </p>
          <button
            type="button"
            onClick={onGoToOrder}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-5 py-2.5 text-sm font-medium text-white dark:text-[#1a1a18] hover:opacity-90 cursor-pointer"
          >
            Hacer primer pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
            Historial de pedidos
          </h2>
          <p className="text-xs text-[#6c6c66] dark:text-[#9a9991] tabular-nums">
            {history.length} {history.length === 1 ? 'pedido guardado' : 'pedidos guardados'} localmente
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const isCopied = copiedId === entry.id;

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="flex w-full min-h-[64px] items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-black/2 dark:hover:bg-white/2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                    Entrega: {entry.deliveryDay}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
                    <span>{formatDateEs(entry.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {entry.suppliers.length}{' '}
                      {entry.suppliers.length === 1 ? 'proveedor' : 'proveedores'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.totalUnits} uds.</span>
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#7a7a74]">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-black/6 dark:border-white/6 px-4 sm:px-5 py-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {entry.suppliers.map((sup) => (
                      <div
                        key={sup.supplierId}
                        className="rounded-xl bg-[#f9f8f5] dark:bg-[#141413] p-3 border border-black/6 dark:border-white/6"
                      >
                        <div className="text-xs font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                          {sup.supplierName}
                        </div>
                        <ul className="mt-1.5 space-y-1 text-xs text-[#4a4a45] dark:text-[#b5b4ac]">
                          {sup.sections.map((sec, idx) => (
                            <React.Fragment key={idx}>
                              {sec.label && (
                                <li className="pt-1 text-[11px] font-semibold text-[#7a7a74]">
                                  {sec.label}
                                </li>
                              )}
                              {sec.items.map((item) => (
                                <li
                                  key={item.productId}
                                  className="flex items-baseline justify-between gap-2"
                                >
                                  <span className="truncate">
                                    {item.code && (
                                      <span className="mr-1.5 font-mono-code text-[11px] text-[#7a7a74]">
                                        {item.code}
                                      </span>
                                    )}
                                    {item.name}
                                  </span>
                                  <span className="font-mono-code font-semibold text-[#2a8549] dark:text-[#4cc376] tabular-nums shrink-0">
                                    x{item.qty}
                                  </span>
                                </li>
                              ))}
                            </React.Fragment>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onRepeatOrder(entry)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-xs font-medium text-white dark:text-[#1a1a18] hover:opacity-90 cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Cargar en pedido actual</span>
                    </button>

                    <a
                      href={buildWhatsAppPickerUrl(
                        buildBossWhatsAppMessage(entry.suppliers, entry.deliveryDay)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#2a8549] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#23703d] transition-colors"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Enviar a grupo</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(entry)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-black/12 dark:border-white/12 px-3.5 py-2 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#2a8549] dark:text-[#4cc376]" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar resumen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(entry)}
                      className="ml-auto inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ConfirmSheet
        open={Boolean(deleteTarget)}
        title="¿Eliminar este pedido del historial?"
        description="Esta acción eliminará el registro guardado de este dispositivo."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) onDeleteEntry(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
