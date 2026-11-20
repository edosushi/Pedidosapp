import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  History,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { CatalogEditorView } from './components/CatalogEditorView';
import { HistoryView } from './components/HistoryView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OrderView } from './components/OrderView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SummaryDispatchView } from './components/SummaryDispatchView';
import { createId } from './data/defaultCatalog';
import { useOrderStorage } from './hooks/useOrderStorage';
import { AppTab, OrderHistoryEntry, QuantitiesMap } from './types/orders';
import { buildActiveSnapshots } from './utils/whatsapp';

export default function App() {
  const {
    suppliers,
    setSuppliers,
    quantities,
    setQuantities,
    setProductQuantity,
    resetQuantities,
    history,
    setHistory,
    addHistoryEntry,
    deleteHistoryEntry,
    bossPhone,
    setBossPhone,
    deliveryDay,
    setDeliveryDay,
    theme,
    setTheme,
    updateProductNote,
    restoreDefaultCatalog,
  } = useOrderStorage();

  const [activeTab, setActiveTab] = useState<AppTab>('order');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2600);
  };

  const totalSelectedProducts = useMemo(
    () => Object.values(quantities).filter((q) => q > 0).length,
    [quantities]
  );

  const handleSaveAndClear = (day: string) => {
    const snapshots = buildActiveSnapshots(suppliers, quantities);
    if (snapshots.length === 0) return;

    const totalItems = snapshots.reduce(
      (acc, sup) => acc + sup.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0),
      0
    );
    const totalUnits = snapshots.reduce(
      (acc, sup) =>
        acc +
        sup.sections.reduce(
          (sAcc, sec) => sAcc + sec.items.reduce((iAcc, item) => iAcc + item.qty, 0),
          0
        ),
      0
    );

    const entry: OrderHistoryEntry = {
      id: createId('ord'),
      createdAt: new Date().toISOString(),
      deliveryDay: day.trim() || 'el próximo día',
      totalItems,
      totalUnits,
      suppliers: snapshots,
    };

    addHistoryEntry(entry);
    resetQuantities();
    setActiveTab('history');
    showToast('Pedido guardado en el historial');
  };

  const handleRepeatOrder = (entry: OrderHistoryEntry) => {
    const nextQuantities: QuantitiesMap = {};
    const productById = new Set<string>();
    const productByCodeOrName = new Map<string, string>();

    for (const sup of suppliers) {
      for (const sec of sup.sections) {
        for (const prod of sec.products) {
          productById.add(prod.id);
          const key = `${sup.name.toLowerCase()}::${(prod.code || '').toLowerCase()}::${prod.name.toLowerCase()}`;
          productByCodeOrName.set(key, prod.id);
        }
      }
    }

    for (const supSnap of entry.suppliers) {
      for (const secSnap of supSnap.sections) {
        for (const item of secSnap.items) {
          if (productById.has(item.productId)) {
            nextQuantities[item.productId] = item.qty;
          } else {
            const fallbackKey = `${supSnap.supplierName.toLowerCase()}::${(item.code || '').toLowerCase()}::${item.name.toLowerCase()}`;
            const matchedId = productByCodeOrName.get(fallbackKey);
            if (matchedId) {
              nextQuantities[matchedId] = item.qty;
            }
          }
        }
      }
    }

    setQuantities(nextQuantities);
    setDeliveryDay(entry.deliveryDay);
    setActiveTab('order');
    showToast('Pedido cargado en el borrador actual');
  };

  const navItems: { id: AppTab; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'order', label: 'Hacer pedido', mobileLabel: 'Pedido', icon: ClipboardList },
    { id: 'dispatch', label: 'Enviar', mobileLabel: 'Enviar', icon: Send },
    { id: 'history', label: 'Historial', mobileLabel: 'Historial', icon: History },
    { id: 'catalog', label: 'Proveedores', mobileLabel: 'Catálogo', icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f4f0] dark:bg-[#141413] text-[#1a1a18] dark:text-[#f0efe8]">
      {/* Top App Bar (3-zone contract on desktop, compact 52px on mobile) */}
      <header className="sticky top-0 z-30 h-13 border-b border-black/8 dark:border-white/8 bg-[#f5f4f0]/90 dark:bg-[#141413]/90 backdrop-blur-md pt-safe">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className="text-lg font-bold tracking-tight text-[#1a1a18] dark:text-[#f0efe8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pedidos
          </button>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    isActive
                      ? 'text-[#1a1a18] dark:text-[#f0efe8]'
                      : 'text-[#6c6c66] dark:text-[#9a9991] hover:text-[#1a1a18] dark:hover:text-[#f0efe8]'
                  }`}
                >
                  {item.label}
                  {item.id === 'dispatch' && totalSelectedProducts > 0
                    ? ` (${totalSelectedProducts})`
                    : ''}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#2a8549] dark:bg-[#4cc376]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-22 md:pb-10">
        {activeTab === 'order' && (
          <OrderView
            suppliers={suppliers}
            quantities={quantities}
            onChangeQuantity={setProductQuantity}
            onUpdateProductNote={updateProductNote}
            onResetOrder={() => {
              resetQuantities();
              showToast('Cantidades puestas a cero');
            }}
            onGoToDispatch={() => setActiveTab('dispatch')}
          />
        )}

        {activeTab === 'dispatch' && (
          <SummaryDispatchView
            suppliers={suppliers}
            quantities={quantities}
            bossPhone={bossPhone}
            deliveryDay={deliveryDay}
            onChangeDeliveryDay={setDeliveryDay}
            onChangeQuantity={setProductQuantity}
            onSaveAndClear={handleSaveAndClear}
            onResetOnly={() => {
              resetQuantities();
              setActiveTab('order');
              showToast('Pedido descartado');
            }}
            onBackToOrder={() => setActiveTab('order')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onRepeatOrder={handleRepeatOrder}
            onDeleteEntry={deleteHistoryEntry}
            onGoToOrder={() => setActiveTab('order')}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogEditorView
            suppliers={suppliers}
            bossPhone={bossPhone}
            deliveryDay={deliveryDay}
            history={history}
            theme={theme}
            onChangeSuppliers={setSuppliers}
            onChangeBossPhone={setBossPhone}
            onChangeDeliveryDay={setDeliveryDay}
            onChangeHistory={setHistory}
            onChangeTheme={setTheme}
            onRestoreDefaults={() => {
              restoreDefaultCatalog();
              showToast('Catálogo original restaurado');
            }}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Navegación inferior"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-black/10 dark:border-white/10 bg-white/92 dark:bg-[#1e1e1c]/92 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-4 h-16 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showCount = item.id === 'dispatch' && totalSelectedProducts > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#2a8549] dark:text-[#4cc376]'
                    : 'text-[#7a7a74] dark:text-[#8a8a82]'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                  {showCount && (
                    <span className="ml-1 font-mono-code text-[11px] font-semibold tabular-nums">
                      {totalSelectedProducts}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Subtle feedback toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2.5 text-xs font-medium text-white dark:text-[#1a1a18] shadow-lg whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
