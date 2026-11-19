import React, { useMemo, useState } from 'react';
import {
  ArchiveRestore,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquareShare,
  Minus,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { QuantitiesMap, Supplier } from '../types/orders';
import {
  buildActiveSnapshots,
  buildBossWhatsAppMessage,
  buildSupplierWhatsAppMessage,
  buildWhatsAppPickerUrl,
  buildWhatsAppUrl,
  cleanPhone,
} from '../utils/whatsapp';
import { ConfirmSheet } from './ConfirmSheet';

interface SummaryDispatchViewProps {
  suppliers: Supplier[];
  quantities: QuantitiesMap;
  bossPhone: string;
  deliveryDay: string;
  onChangeDeliveryDay: (day: string) => void;
  onChangeQuantity: (productId: string, qty: number) => void;
  onSaveAndClear: (deliveryDay: string) => void;
  onResetOnly: () => void;
  onBackToOrder: () => void;
}

const QUICK_DAYS = ['hoy', 'mañana', 'lunes', 'miércoles', 'viernes', 'sábado'];

export const SummaryDispatchView: React.FC<SummaryDispatchViewProps> = ({
  suppliers,
  quantities,
  bossPhone,
  deliveryDay,
  onChangeDeliveryDay,
  onChangeQuantity,
  onSaveAndClear,
  onResetOnly,
  onBackToOrder,
}) => {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const snapshots = useMemo(
    () => buildActiveSnapshots(suppliers, quantities),
    [suppliers, quantities]
  );

  const totalProducts = useMemo(
    () =>
      snapshots.reduce(
        (acc, sup) => acc + sup.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0),
        0
      ),
    [snapshots]
  );

  const totalUnits = useMemo(
    () =>
      snapshots.reduce(
        (acc, sup) =>
          acc +
          sup.sections.reduce(
            (sAcc, sec) => sAcc + sec.items.reduce((iAcc, item) => iAcc + item.qty, 0),
            0
          ),
        0
      ),
    [snapshots]
  );

  const bossMessage = useMemo(
    () => buildBossWhatsAppMessage(snapshots, deliveryDay),
    [snapshots, deliveryDay]
  );

  const bossUrl = useMemo(
    () => buildWhatsAppUrl(bossPhone, bossMessage),
    [bossPhone, bossMessage]
  );

  const bossGroupUrl = useMemo(
    () => buildWhatsAppPickerUrl(bossMessage),
    [bossMessage]
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 1800);
    } catch {
      // Clipboard API fallback ignored if denied
    }
  };

  const markSupplierSent = (supplierId: string) => {
    setSentMap((prev) => ({ ...prev, [supplierId]: true }));
  };

  if (snapshots.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-8 text-center">
          <h2 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
            Tu pedido está vacío
          </h2>
          <p className="mt-2 text-sm text-[#6c6c66] dark:text-[#9a9991]">
            Selecciona los productos que necesitas en el catálogo y vuelve aquí para enviarlos por WhatsApp a cada proveedor.
          </p>
          <button
            type="button"
            onClick={onBackToOrder}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-5 py-2.5 text-sm font-medium text-white dark:text-[#1a1a18] hover:opacity-90 cursor-pointer"
          >
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
      {/* Delivery Day Configuration Card */}
      <section className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
              Día de entrega del pedido
            </h2>
            <p className="mt-0.5 text-xs text-[#6c6c66] dark:text-[#9a9991] tabular-nums">
              {snapshots.length} {snapshots.length === 1 ? 'proveedor' : 'proveedores'} ·{' '}
              {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'} · {totalUnits}{' '}
              {totalUnits === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a74]" />
              <input
                type="text"
                value={deliveryDay}
                onChange={(e) => onChangeDeliveryDay(e.target.value)}
                placeholder="ej: miércoles"
                aria-label="Día de entrega"
                className="min-h-[44px] w-full sm:w-52 rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#141413] pl-9 pr-3 text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DAYS.map((day) => {
                const active = deliveryDay.trim().toLowerCase() === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onChangeDeliveryDay(day)}
                    className={`min-h-[36px] rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1a1a18] dark:bg-[#f0efe8] text-white dark:text-[#1a1a18]'
                        : 'bg-[#f5f4f0] dark:bg-[#262624] text-[#5c5c56] dark:text-[#a8a8a0] hover:text-[#1a1a18] dark:hover:text-[#f0efe8]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Supplier Dispatch Cards + Boss Summary */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Left: Supplier-by-supplier WhatsApp dispatch */}
        <div className="space-y-4">
          {snapshots.map((snap) => {
            const msg = buildSupplierWhatsAppMessage(snap, deliveryDay);
            const waUrl = buildWhatsAppUrl(snap.phone, msg);
            const hasPhone = cleanPhone(snap.phone).length >= 6;
            const isSent = Boolean(sentMap[snap.supplierId]);
            const isCopied = copiedId === snap.supplierId;

            return (
              <article
                key={snap.supplierId}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/6 dark:border-white/6 px-4 sm:px-5 py-3.5">
                  <div>
                    <h3 className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                      {snap.supplierName}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
                      <span className="font-mono-code">
                        {hasPhone ? `+${cleanPhone(snap.phone)}` : 'Sin teléfono'}
                      </span>
                      {isSent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#2a8549] dark:text-[#4cc376]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Abierto en WhatsApp
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(snap.supplierId, msg)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#262624] px-3 py-2 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/8 dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#2a8549] dark:text-[#4cc376]" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {hasPhone ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markSupplierSent(snap.supplierId)}
                        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isSent
                            ? 'bg-[#2a8549]/15 text-[#1e6b38] dark:bg-[#4cc376]/20 dark:text-[#6ee799]'
                            : 'bg-[#2a8549] text-white hover:bg-[#23703d]'
                        }`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{isSent ? 'Reenviar WhatsApp' : 'Enviar WhatsApp'}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-[#b91c1c] dark:text-red-400">
                        Añade teléfono en Proveedores
                      </span>
                    )}
                  </div>
                </div>

                {/* Editable line items */}
                <div className="divide-y divide-black/6 dark:divide-white/6">
                  {snap.sections.map((sec, sIdx) => (
                    <div key={`${snap.supplierId}-${sIdx}`}>
                      {sec.label && (
                        <div className="bg-[#f9f8f5] dark:bg-[#181816] px-4 sm:px-5 py-1.5 text-xs font-semibold text-[#6c6c66] dark:text-[#9a9991]">
                          {sec.label}
                        </div>
                      )}
                      {sec.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            {item.code && (
                              <span className="mr-2 font-mono-code text-xs text-[#7a7a74] dark:text-[#8a8a82]">
                                {item.code}
                              </span>
                            )}
                            <span className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8]">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onChangeQuantity(item.productId, item.qty - 1)}
                              aria-label={`Restar ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-[#f5f4f0] dark:bg-[#262624] text-[#1a1a18] dark:text-[#f0efe8] cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[28px] text-center font-mono-code text-sm font-semibold text-[#2a8549] dark:text-[#4cc376] tabular-nums">
                              x{item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onChangeQuantity(item.productId, item.qty + 1)}
                              aria-label={`Sumar ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-[#f5f4f0] dark:bg-[#262624] text-[#1a1a18] dark:text-[#f0efe8] cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {/* Right: Boss Summary & Archive Actions */}
        <aside className="space-y-4 lg:sticky lg:top-18">
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-4 sm:p-5">
            <h3 className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
              Resumen al jefe
            </h3>
            <p className="mt-0.5 font-mono-code text-xs text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
              Tel: +{cleanPhone(bossPhone)}
            </p>

            <pre className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-black/6 dark:border-white/6 bg-[#f9f8f5] dark:bg-[#141413] p-3 font-sans text-xs leading-relaxed text-[#2c2c28] dark:text-[#dcdbd3] whitespace-pre-wrap">
              {bossMessage}
            </pre>

            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href={bossGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2a8549] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#23703d] transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Enviar a grupo de WhatsApp</span>
              </a>

              <a
                href={bossUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2.5 text-sm font-medium text-white dark:text-[#1a1a18] hover:opacity-90 transition-opacity"
              >
                <MessageSquareShare className="h-4 w-4" />
                <span>Enviar al jefe (chat directo)</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy('boss', bossMessage)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-black/12 dark:border-white/12 bg-transparent px-4 py-2.5 text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                {copiedId === 'boss' ? (
                  <>
                    <Check className="h-4 w-4 text-[#2a8549] dark:text-[#4cc376]" />
                    <span>Resumen copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar texto completo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Complete & Archive Order Card */}
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-4 sm:p-5 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onSaveAndClear(deliveryDay);
                setSentMap({});
              }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2a8549] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#23703d] transition-colors cursor-pointer"
            >
              <ArchiveRestore className="h-4 w-4" />
              <span>Guardar en historial y limpiar</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-black/12 dark:border-white/12 bg-transparent px-4 py-2.5 text-sm font-medium text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Descartar sin guardar</span>
            </button>
          </div>
        </aside>
      </div>

      <ConfirmSheet
        open={confirmClearOpen}
        title="¿Descartar este pedido?"
        description="Se borrarán todas las cantidades seleccionadas sin guardarlas en el historial."
        confirmLabel="Descartar pedido"
        variant="danger"
        onConfirm={() => {
          onResetOnly();
          setSentMap({});
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
