import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  StickyNote,
  X,
} from 'lucide-react';
import { ProductItem, QuantitiesMap, Supplier } from '../types/orders';
import { ConfirmSheet } from './ConfirmSheet';

interface OrderViewProps {
  suppliers: Supplier[];
  quantities: QuantitiesMap;
  onChangeQuantity: (productId: string, qty: number) => void;
  onUpdateProductNote: (productId: string, note: string) => void;
  onResetOrder: () => void;
  onGoToDispatch: () => void;
}

export const OrderView: React.FC<OrderViewProps> = ({
  suppliers,
  quantities,
  onChangeQuantity,
  onUpdateProductNote,
  onResetOrder,
  onGoToDispatch,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [onlySelected, setOnlySelected] = useState(false);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editingQtyValue, setEditingQtyValue] = useState<string>('');
  const [noteModalProduct, setNoteModalProduct] = useState<ProductItem | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();

  const { totalSelectedProducts, totalUnits, activeSupplierCount } = useMemo(() => {
    let items = 0;
    let units = 0;
    let activeSups = 0;

    for (const sup of suppliers) {
      let supHas = false;
      for (const sec of sup.sections) {
        for (const prod of sec.products) {
          const q = quantities[prod.id] || 0;
          if (q > 0) {
            items += 1;
            units += q;
            supHas = true;
          }
        }
      }
      if (supHas) activeSups += 1;
    }

    return {
      totalSelectedProducts: items,
      totalUnits: units,
      activeSupplierCount: activeSups,
    };
  }, [suppliers, quantities]);

  const supplierStats = useMemo(() => {
    const map: Record<string, { total: number; selected: number }> = {};
    for (const sup of suppliers) {
      let total = 0;
      let selected = 0;
      for (const sec of sup.sections) {
        for (const prod of sec.products) {
          total += 1;
          if ((quantities[prod.id] || 0) > 0) selected += 1;
        }
      }
      map[sup.id] = { total, selected };
    }
    return map;
  }, [suppliers, quantities]);

  const visibleSuppliers = useMemo(() => {
    return suppliers
      .filter((sup) => selectedSupplierId === 'all' || sup.id === selectedSupplierId)
      .map((sup) => {
        const filteredSections = sup.sections
          .map((sec) => {
            const filteredProducts = sec.products.filter((prod) => {
              const qty = quantities[prod.id] || 0;
              if (onlySelected && qty === 0) return false;
              if (!normalizedSearch) return true;
              const matchesName = prod.name.toLowerCase().includes(normalizedSearch);
              const matchesCode = (prod.code || '').toLowerCase().includes(normalizedSearch);
              const matchesNote = (prod.note || '').toLowerCase().includes(normalizedSearch);
              const matchesSup = sup.name.toLowerCase().includes(normalizedSearch);
              return matchesName || matchesCode || matchesNote || matchesSup;
            });
            return { ...sec, products: filteredProducts };
          })
          .filter((sec) => sec.products.length > 0);

        return { ...sup, sections: filteredSections };
      })
      .filter((sup) => {
        if (normalizedSearch || onlySelected) {
          return sup.sections.length > 0;
        }
        return true;
      });
  }, [suppliers, selectedSupplierId, onlySelected, normalizedSearch, quantities]);

  const toggleCollapse = (supplierId: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  const startManualQty = (productId: string, currentQty: number) => {
    setEditingQtyId(productId);
    setEditingQtyValue(currentQty > 0 ? String(currentQty) : '');
  };

  const commitManualQty = (productId: string) => {
    const parsed = parseInt(editingQtyValue, 10);
    if (!Number.isNaN(parsed)) {
      onChangeQuantity(productId, parsed);
    }
    setEditingQtyId(null);
    setEditingQtyValue('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
      {/* Workspace Toolbar: Search & Quick Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a74] dark:text-[#8a8a82]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto, nota, código o proveedor..."
            aria-label="Buscar producto, nota, código o proveedor"
            className="w-full min-h-[44px] rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#1e1e1c] pl-10 pr-10 text-sm text-[#1a1a18] dark:text-[#f0efe8] placeholder:text-[#9c9b94] dark:placeholder:text-[#6a6a63] focus:border-[#2a8549] dark:focus:border-[#4cc376] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[#7a7a74] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-black/5 dark:bg-white/6 p-1">
            <button
              type="button"
              onClick={() => setOnlySelected(false)}
              className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !onlySelected
                  ? 'bg-white dark:bg-[#2a2a27] text-[#1a1a18] dark:text-[#f0efe8] shadow-xs'
                  : 'text-[#6c6c66] dark:text-[#9a9991] hover:text-[#1a1a18] dark:hover:text-[#f0efe8]'
              }`}
            >
              Catálogo completo
            </button>
            <button
              type="button"
              onClick={() => setOnlySelected(true)}
              className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                onlySelected
                  ? 'bg-white dark:bg-[#2a2a27] text-[#1a1a18] dark:text-[#f0efe8] shadow-xs'
                  : 'text-[#6c6c66] dark:text-[#9a9991] hover:text-[#1a1a18] dark:hover:text-[#f0efe8]'
              }`}
            >
              Seleccionados ({totalSelectedProducts})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {totalSelectedProducts > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#1e1e1c] px-3 py-2 text-xs font-medium text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Vaciar</span>
                </button>
                <button
                  type="button"
                  onClick={onGoToDispatch}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-xs font-medium text-white dark:text-[#1a1a18] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Revisar y enviar ({totalSelectedProducts})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inline status summary */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6c6c66] dark:text-[#9a9991] tabular-nums">
        <div>
          {totalSelectedProducts > 0 ? (
            <span>
              <strong className="font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                {totalSelectedProducts}
              </strong>{' '}
              {totalSelectedProducts === 1 ? 'producto' : 'productos'} ·{' '}
              <strong className="font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                {totalUnits}
              </strong>{' '}
              {totalUnits === 1 ? 'unidad' : 'unidades'} ·{' '}
              {activeSupplierCount}{' '}
              {activeSupplierCount === 1 ? 'proveedor' : 'proveedores'}
            </span>
          ) : (
            <span>Pulsa + en los productos que necesites pedir</span>
          )}
        </div>
      </div>

      {/* Mobile horizontal supplier filter strip */}
      <div className="mt-3 flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setSelectedSupplierId('all')}
          className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedSupplierId === 'all'
              ? 'bg-[#1a1a18] dark:bg-[#f0efe8] text-white dark:text-[#1a1a18]'
              : 'bg-white dark:bg-[#1e1e1c] border border-black/10 dark:border-white/10 text-[#5c5c56] dark:text-[#a8a8a0]'
          }`}
        >
          Todos ({suppliers.length})
        </button>
        {suppliers.map((sup) => {
          const stat = supplierStats[sup.id] || { total: 0, selected: 0 };
          const isActive = selectedSupplierId === sup.id;
          return (
            <button
              key={sup.id}
              type="button"
              onClick={() => setSelectedSupplierId(sup.id)}
              className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                isActive
                  ? 'bg-[#1a1a18] dark:bg-[#f0efe8] text-white dark:text-[#1a1a18]'
                  : 'bg-white dark:bg-[#1e1e1c] border border-black/10 dark:border-white/10 text-[#5c5c56] dark:text-[#a8a8a0]'
              }`}
            >
              {sup.name}
              {stat.selected > 0 ? ` (${stat.selected})` : ''}
            </button>
          );
        })}
      </div>

      {/* Main Content: Desktop Sidebar + List / Mobile Single Column */}
      <div className="mt-4 lg:mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-6">
        {/* Desktop Sticky Supplier Filter Directory */}
        <aside className="hidden lg:block sticky top-18 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-2">
          <div className="px-3 py-2 text-xs font-semibold text-[#7a7a74] dark:text-[#8a8a82]">
            Proveedores
          </div>
          <nav className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSelectedSupplierId('all')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                selectedSupplierId === 'all'
                  ? 'bg-[#f5f4f0] dark:bg-[#2a2a27] text-[#1a1a18] dark:text-[#f0efe8]'
                  : 'text-[#5c5c56] dark:text-[#a8a8a0] hover:bg-black/3 dark:hover:bg-white/4'
              }`}
            >
              <span className="truncate">Todos los proveedores</span>
              <span className="text-xs text-[#7a7a74] tabular-nums">{suppliers.length}</span>
            </button>
            {suppliers.map((sup) => {
              const stat = supplierStats[sup.id] || { total: 0, selected: 0 };
              const isActive = selectedSupplierId === sup.id;
              return (
                <button
                  key={sup.id}
                  type="button"
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#f5f4f0] dark:bg-[#2a2a27] font-semibold text-[#1a1a18] dark:text-[#f0efe8]'
                      : 'font-medium text-[#5c5c56] dark:text-[#a8a8a0] hover:bg-black/3 dark:hover:bg-white/4'
                  }`}
                >
                  <span className="truncate">{sup.name}</span>
                  <span
                    className={`text-xs tabular-nums shrink-0 ${
                      stat.selected > 0
                        ? 'font-semibold text-[#2a8549] dark:text-[#4cc376]'
                        : 'text-[#8a8a82]'
                    }`}
                  >
                    {stat.selected > 0 ? `${stat.selected} sel.` : stat.total}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Suppliers & Product Lists */}
        <div className="space-y-4">
          {visibleSuppliers.length === 0 ? (
            <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8]">
                {onlySelected
                  ? 'Aún no hay productos seleccionados'
                  : 'No se encontraron productos para esa búsqueda'}
              </p>
              <p className="mt-1 text-xs text-[#7a7a74] dark:text-[#8a8a82]">
                {onlySelected
                  ? 'Vuelve al catálogo completo para añadir unidades a tu pedido.'
                  : 'Prueba con otro nombre o código de referencia.'}
              </p>
              {(onlySelected || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setOnlySelected(false);
                    setSearch('');
                    setSelectedSupplierId('all');
                  }}
                  className="mt-4 inline-flex min-h-[40px] items-center rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-xs font-medium text-white dark:text-[#1a1a18] cursor-pointer"
                >
                  Ver todo el catálogo
                </button>
              )}
            </div>
          ) : (
            visibleSuppliers.map((sup) => {
              const stat = supplierStats[sup.id] || { total: 0, selected: 0 };
              const forceOpen = Boolean(normalizedSearch || onlySelected || selectedSupplierId !== 'all');
              const isCollapsed = !forceOpen && Boolean(collapsedMap[sup.id]);
              const hasProducts = sup.sections.some((s) => s.products.length > 0);

              return (
                <section
                  key={sup.id}
                  className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapse(sup.id)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full min-h-[56px] items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors hover:bg-black/2 dark:hover:bg-white/2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold tracking-tight text-[#1a1a18] dark:text-[#f0efe8] truncate">
                        {sup.name}
                      </h2>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
                        <span>{stat.total} productos</span>
                        {stat.selected > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#2a8549] dark:text-[#4cc376]">
                              {stat.selected} {stat.selected === 1 ? 'seleccionado' : 'seleccionados'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#7a7a74] dark:text-[#8a8a82]">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="border-t border-black/6 dark:border-white/6">
                      {!hasProducts ? (
                        <p className="px-5 py-4 text-sm italic text-[#8a8a82]">
                          Sin productos configurados en este proveedor.
                        </p>
                      ) : (
                        sup.sections.map((sec) => (
                          <div key={sec.id}>
                            {sec.label && (
                              <div className="bg-[#f9f8f5] dark:bg-[#181816] px-4 sm:px-5 py-2 text-xs font-semibold text-[#6c6c66] dark:text-[#9a9991] border-b border-black/6 dark:border-white/6">
                                {sec.label}
                              </div>
                            )}
                            <div className="divide-y divide-black/6 dark:divide-white/6">
                              {sec.products.map((prod) => {
                                const qty = quantities[prod.id] || 0;
                                const isActive = qty > 0;
                                const isEditingThis = editingQtyId === prod.id;

                                return (
                                  <div
                                    key={prod.id}
                                    className={`flex min-h-[60px] items-center justify-between gap-3 px-4 sm:px-5 py-2.5 transition-colors ${
                                      isActive
                                        ? 'bg-[#2a8549]/[0.04] dark:bg-[#4cc376]/[0.06]'
                                        : ''
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNoteModalProduct(prod);
                                          setNoteDraft(prod.note || '');
                                        }}
                                        aria-label={
                                          prod.note
                                            ? `Editar nota de ${prod.name}`
                                            : `Añadir nota personal a ${prod.name}`
                                        }
                                        className="min-w-0 flex-1 text-left py-1 cursor-pointer group"
                                      >
                                        {prod.code && (
                                          <div className="font-mono-code text-[11px] font-medium text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
                                            {prod.code}
                                          </div>
                                        )}
                                        <div
                                          className={`text-[15px] leading-snug ${
                                            isActive
                                              ? 'font-medium text-[#1a1a18] dark:text-[#f0efe8]'
                                              : 'text-[#2c2c28] dark:text-[#dcdbd3]'
                                          }`}
                                        >
                                          {prod.name}
                                        </div>
                                        {prod.note ? (
                                          <div className="mt-0.5 flex items-center gap-1 text-xs text-[#2a8549] dark:text-[#4cc376]">
                                            <StickyNote className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{prod.note}</span>
                                          </div>
                                        ) : (
                                          <div className="mt-0.5 text-[11px] text-[#9c9b94] dark:text-[#6a6a63] opacity-0 group-hover:opacity-100 transition-opacity">
                                            + Nota personal
                                          </div>
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNoteModalProduct(prod);
                                          setNoteDraft(prod.note || '');
                                        }}
                                        aria-label={
                                          prod.note
                                            ? `Editar nota de ${prod.name}`
                                            : `Añadir nota personal a ${prod.name}`
                                        }
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                                          prod.note
                                            ? 'text-[#2a8549] dark:text-[#4cc376] hover:bg-[#2a8549]/10'
                                            : 'text-[#9c9b94] dark:text-[#6a6a63] hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                      >
                                        <StickyNote className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => onChangeQuantity(prod.id, qty - 1)}
                                        disabled={qty === 0}
                                        aria-label={`Quitar uno de ${prod.name}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#262624] text-[#1a1a18] dark:text-[#f0efe8] transition-transform active:scale-95 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>

                                      {isEditingThis ? (
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          min={0}
                                          max={999}
                                          autoFocus
                                          value={editingQtyValue}
                                          onChange={(e) => setEditingQtyValue(e.target.value)}
                                          onBlur={() => commitManualQty(prod.id)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitManualQty(prod.id);
                                            if (e.key === 'Escape') {
                                              setEditingQtyId(null);
                                              setEditingQtyValue('');
                                            }
                                          }}
                                          aria-label={`Cantidad para ${prod.name}`}
                                          className="h-11 w-14 rounded-xl border border-[#2a8549] dark:border-[#4cc376] bg-white dark:bg-[#141413] text-center font-mono-code text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8] tabular-nums focus:outline-none"
                                        />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => startManualQty(prod.id, qty)}
                                          aria-label={`Editar cantidad de ${prod.name}, actual ${qty}`}
                                          className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl px-1.5 font-mono-code text-base font-semibold tabular-nums transition-colors cursor-pointer ${
                                            isActive
                                              ? 'text-[#2a8549] dark:text-[#4cc376] hover:bg-[#2a8549]/10'
                                              : 'text-[#9c9b94] dark:text-[#6a6a63] hover:bg-black/5 dark:hover:bg-white/5'
                                          }`}
                                        >
                                          {qty}
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => onChangeQuantity(prod.id, qty + 1)}
                                        aria-label={`Añadir uno de ${prod.name}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#262624] text-[#1a1a18] dark:text-[#f0efe8] transition-transform active:scale-95 cursor-pointer"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>

      <ConfirmSheet
        open={confirmResetOpen}
        title="¿Vaciar el pedido actual?"
        description="Se pondrán a cero todas las cantidades seleccionadas. Tu catálogo de proveedores y productos no cambiará."
        confirmLabel="Sí, vaciar pedido"
        variant="danger"
        onConfirm={() => {
          onResetOrder();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {noteModalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setNoteModalProduct(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#242422] p-6 shadow-xl border-t sm:border border-black/10 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20 sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8] truncate">
                  {noteModalProduct.name}
                </h3>
                <p className="mt-0.5 text-xs text-[#6c6c66] dark:text-[#9a9991]">
                  Nota solo para ti · nunca sale en WhatsApp
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalProduct(null)}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#7a7a74] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProductNote(noteModalProduct.id, noteDraft);
                setNoteModalProduct(null);
              }}
              className="mt-4 space-y-4"
            >
              <input
                type="text"
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="ej: virutas de bonito, nabo amarillo..."
                aria-label="Nota personal del producto"
                className="min-h-[44px] w-full rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#141413] px-3.5 text-sm text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
              />
              <div className="flex gap-2">
                {noteModalProduct.note && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProductNote(noteModalProduct.id, '');
                      setNoteModalProduct(null);
                    }}
                    className="min-h-[44px] rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-medium text-[#b91c1c] dark:text-red-400 cursor-pointer"
                  >
                    Borrar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-sm font-medium text-white dark:text-[#1a1a18] hover:opacity-90 cursor-pointer"
                >
                  Guardar nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
