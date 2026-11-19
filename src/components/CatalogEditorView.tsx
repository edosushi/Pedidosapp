import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { createId } from '../data/defaultCatalog';
import { Supplier, ThemePreference } from '../types/orders';
import { ConfirmSheet } from './ConfirmSheet';

interface CatalogEditorViewProps {
  suppliers: Supplier[];
  bossPhone: string;
  theme: ThemePreference;
  onChangeSuppliers: (next: Supplier[]) => void;
  onChangeBossPhone: (phone: string) => void;
  onChangeTheme: (theme: ThemePreference) => void;
  onRestoreDefaults: () => void;
}

export const CatalogEditorView: React.FC<CatalogEditorViewProps> = ({
  suppliers,
  bossPhone,
  theme,
  onChangeSuppliers,
  onChangeBossPhone,
  onChangeTheme,
  onRestoreDefaults,
}) => {
  const [expandedSupId, setExpandedSupId] = useState<string | null>(
    suppliers[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [apkError, setApkError] = useState<string | null>(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState<Supplier | null>(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadApk = async () => {
    if (downloadingApk) return;
    setDownloadingApk(true);
    setApkError(null);
    try {
      const response = await fetch(`/pedidos.apk?v=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Verify ZIP/APK magic bytes (PK\x03\x04) so HTML is never saved as .apk.html
      if (
        bytes.length < 4 ||
        bytes[0] !== 0x50 ||
        bytes[1] !== 0x4b ||
        bytes[2] !== 0x03 ||
        bytes[3] !== 0x04
      ) {
        throw new Error('El servidor no devolvió un paquete APK válido.');
      }

      const blob = new Blob([buffer], {
        type: 'application/vnd.android.package-archive',
      });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Pedidos.apk';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      setApkError(
        err instanceof Error
          ? err.message
          : 'No se pudo descargar el archivo Pedidos.apk.'
      );
    } finally {
      setDownloadingApk(false);
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredSuppliers = useMemo(() => {
    if (!normalizedSearch) return suppliers;
    return suppliers
      .map((sup) => {
        const supMatches = sup.name.toLowerCase().includes(normalizedSearch);
        if (supMatches) return sup;

        const matchingSections = sup.sections
          .map((sec) => ({
            ...sec,
            products: sec.products.filter(
              (p) =>
                p.name.toLowerCase().includes(normalizedSearch) ||
                (p.code || '').toLowerCase().includes(normalizedSearch) ||
                (p.note || '').toLowerCase().includes(normalizedSearch)
            ),
          }))
          .filter((sec) => sec.products.length > 0);

        return { ...sup, sections: matchingSections };
      })
      .filter((sup) => sup.sections.length > 0);
  }, [suppliers, normalizedSearch]);

  const updateSupplier = (supId: string, updater: (s: Supplier) => Supplier) => {
    onChangeSuppliers(suppliers.map((s) => (s.id === supId ? updater(s) : s)));
  };

  const addSupplier = () => {
    const newSup: Supplier = {
      id: createId('sup'),
      name: 'Nuevo proveedor',
      phone: '',
      sections: [
        {
          id: createId('sec'),
          label: null,
          products: [{ id: createId('prod'), code: null, name: '' }],
        },
      ],
    };
    onChangeSuppliers([...suppliers, newSup]);
    setExpandedSupId(newSup.id);
  };

  const deleteSupplier = (supId: string) => {
    onChangeSuppliers(suppliers.filter((s) => s.id !== supId));
  };

  const addSection = (supId: string) => {
    updateSupplier(supId, (sup) => ({
      ...sup,
      sections: [
        ...sup.sections,
        {
          id: createId('sec'),
          label: 'Nueva sección',
          products: [{ id: createId('prod'), code: null, name: '' }],
        },
      ],
    }));
  };

  const deleteSection = (supId: string, secId: string) => {
    updateSupplier(supId, (sup) => ({
      ...sup,
      sections: sup.sections.filter((sec) => sec.id !== secId),
    }));
  };

  const addProduct = (supId: string, secId: string) => {
    updateSupplier(supId, (sup) => ({
      ...sup,
      sections: sup.sections.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              products: [...sec.products, { id: createId('prod'), code: null, name: '' }],
            }
          : sec
      ),
    }));
  };

  const updateProduct = (
    supId: string,
    secId: string,
    prodId: string,
    field: 'code' | 'name' | 'note',
    value: string
  ) => {
    updateSupplier(supId, (sup) => ({
      ...sup,
      sections: sup.sections.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              products: sec.products.map((prod) =>
                prod.id === prodId
                  ? {
                      ...prod,
                      [field]:
                        field === 'code' || field === 'note'
                          ? value || null
                          : value,
                    }
                  : prod
              ),
            }
          : sec
      ),
    }));
  };

  const deleteProduct = (supId: string, secId: string, prodId: string) => {
    updateSupplier(supId, (sup) => ({
      ...sup,
      sections: sup.sections.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              products: sec.products.filter((p) => p.id !== prodId),
            }
          : sec
      ),
    }));
  };

  const handleExport = () => {
    const payload = {
      bossPhone,
      suppliers,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-catalogo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.suppliers)) {
        onChangeSuppliers(parsed.suppliers);
        if (typeof parsed.bossPhone === 'string') {
          onChangeBossPhone(parsed.bossPhone);
        }
        setImportNotice('Catálogo importado correctamente.');
      } else {
        setImportNotice('El archivo no tiene un formato de catálogo válido.');
      }
    } catch {
      setImportNotice('No se pudo leer el archivo JSON seleccionado.');
    }
    e.target.value = '';
    setTimeout(() => setImportNotice(null), 3500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Top Row: Catalog Title & Small APK Download Button on Top Right */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
            Catálogo y ajustes
          </h2>
          {typeof window !== 'undefined' && window.location.hostname !== 'pedidos.local' && (
            <button
              type="button"
              onClick={handleDownloadApk}
              disabled={downloadingApk}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-black/12 dark:border-white/15 bg-white dark:bg-[#1e1e1c] px-2.5 py-1 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#2a8549] dark:text-[#4cc376]" />
              <span>{downloadingApk ? 'Descargando...' : 'Descargar .apk'}</span>
            </button>
          )}
        </div>
        {apkError && (
          <p className="text-xs font-medium text-[#b91c1c] dark:text-red-400">
            {apkError}
          </p>
        )}
      </div>

      {/* General Settings: Boss Phone, Appearance & Backup */}
      <section className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] p-4 sm:p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="boss-phone-input"
              className="block text-xs font-semibold text-[#5c5c56] dark:text-[#a8a8a0]"
            >
              Teléfono WhatsApp del jefe (sin + ni espacios)
            </label>
            <input
              id="boss-phone-input"
              type="tel"
              inputMode="numeric"
              value={bossPhone}
              onChange={(e) => onChangeBossPhone(e.target.value)}
              placeholder="34670835948"
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#141413] px-3.5 font-mono-code text-sm text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#5c5c56] dark:text-[#a8a8a0]">
              Apariencia de la app
            </span>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-black/5 dark:bg-white/6 p-1">
              {(
                [
                  { id: 'system', label: 'Sistema', icon: Monitor },
                  { id: 'light', label: 'Claro', icon: Sun },
                  { id: 'dark', label: 'Oscuro', icon: Moon },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeTheme(id)}
                  className={`flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    theme === id
                      ? 'bg-white dark:bg-[#2a2a27] text-[#1a1a18] dark:text-[#f0efe8] shadow-xs'
                      : 'text-[#6c6c66] dark:text-[#9a9991]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/6 dark:border-white/6">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-black/12 dark:border-white/12 bg-transparent px-3.5 py-2 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar copia JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-black/12 dark:border-white/12 bg-transparent px-3.5 py-2 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Importar copia JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setConfirmRestoreOpen(true)}
            className="sm:ml-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar catálogo original</span>
          </button>
        </div>

        {importNotice && (
          <p className="text-xs font-medium text-[#2a8549] dark:text-[#4cc376]">
            {importNotice}
          </p>
        )}
      </section>

      {/* Suppliers List Header + Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
              Proveedores y productos
            </h2>
            <p className="text-xs text-[#6c6c66] dark:text-[#9a9991]">
              Todos los cambios se guardan automáticamente en el dispositivo.
            </p>
          </div>
          <button
            type="button"
            onClick={addSupplier}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-xs font-medium text-white dark:text-[#1a1a18] hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir proveedor</span>
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a74] dark:text-[#8a8a82]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto, código o proveedor en el catálogo..."
            aria-label="Buscar producto en el catálogo"
            className="w-full min-h-[44px] rounded-xl border border-black/12 dark:border-white/12 bg-white dark:bg-[#1e1e1c] pl-10 pr-10 text-sm text-[#1a1a18] dark:text-[#f0efe8] placeholder:text-[#9c9b94] dark:placeholder:text-[#6a6a63] focus:border-[#2a8549] dark:focus:border-[#4cc376] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[#7a7a74] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] px-6 py-10 text-center">
            <p className="text-sm font-medium text-[#1a1a18] dark:text-[#f0efe8]">
              No hay productos ni proveedores que coincidan con &laquo;{searchQuery}&raquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 inline-flex min-h-[40px] items-center rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] px-4 py-2 text-xs font-medium text-white dark:text-[#1a1a18] cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredSuppliers.map((sup) => {
            const isExpanded = Boolean(normalizedSearch) || expandedSupId === sup.id;
            const totalProds = sup.sections.reduce((acc, s) => acc + s.products.length, 0);

            return (
              <section
                key={sup.id}
                className="rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-[#1e1e1c] overflow-hidden"
              >
              <button
                type="button"
                onClick={() => setExpandedSupId(isExpanded ? null : sup.id)}
                className="flex w-full min-h-[56px] items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-black/2 dark:hover:bg-white/2 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold text-[#1a1a18] dark:text-[#f0efe8] truncate">
                    {sup.name || 'Sin nombre'}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[#7a7a74] dark:text-[#8a8a82] tabular-nums">
                    <span className="font-mono-code">
                      {sup.phone ? `+${sup.phone}` : 'Sin teléfono'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{totalProds} productos</span>
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
                <div className="border-t border-black/6 dark:border-white/6 p-4 sm:p-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div>
                      <label className="block text-xs font-medium text-[#6c6c66] dark:text-[#9a9991]">
                        Nombre del proveedor
                      </label>
                      <input
                        type="text"
                        value={sup.name}
                        onChange={(e) =>
                          updateSupplier(sup.id, (s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Nombre"
                        className="mt-1 min-h-[42px] w-full rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#141413] px-3 text-sm text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6c6c66] dark:text-[#9a9991]">
                        WhatsApp (sin + ni espacios)
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={sup.phone}
                        onChange={(e) =>
                          updateSupplier(sup.id, (s) => ({ ...s, phone: e.target.value }))
                        }
                        placeholder="34600000000"
                        className="mt-1 min-h-[42px] w-full rounded-xl border border-black/12 dark:border-white/12 bg-[#f5f4f0] dark:bg-[#141413] px-3 font-mono-code text-sm text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteSupplierTarget(sup)}
                      className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 px-3.5 py-2 text-xs font-medium text-[#b91c1c] dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar proveedor</span>
                    </button>
                  </div>

                  {/* Sections & Products */}
                  <div className="space-y-4">
                    {sup.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="rounded-xl border border-black/8 dark:border-white/8 bg-[#f9f8f5] dark:bg-[#141413] p-3 sm:p-4 space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sec.label || ''}
                            onChange={(e) =>
                              updateSupplier(sup.id, (s) => ({
                                ...s,
                                sections: s.sections.map((section) =>
                                  section.id === sec.id
                                    ? { ...section, label: e.target.value || null }
                                    : section
                                ),
                              }))
                            }
                            placeholder="Nombre de sección (opcional, ej: Comida)"
                            className="min-h-[38px] flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1c] px-3 text-xs font-semibold text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
                          />
                          {sup.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteSection(sup.id, sec.id)}
                              aria-label="Eliminar sección"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {sec.products.map((prod) => (
                            <div
                              key={prod.id}
                              className="space-y-1.5"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={prod.code || ''}
                                  onChange={(e) =>
                                    updateProduct(
                                      sup.id,
                                      sec.id,
                                      prod.id,
                                      'code',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Código"
                                  aria-label="Código de producto"
                                  className="min-h-[40px] w-24 sm:w-28 shrink-0 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1c] px-2.5 font-mono-code text-xs text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={prod.name}
                                  onChange={(e) =>
                                    updateProduct(
                                      sup.id,
                                      sec.id,
                                      prod.id,
                                      'name',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nombre del producto"
                                  aria-label="Nombre del producto"
                                  className="min-h-[40px] flex-1 min-w-0 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#1e1e1c] px-3 text-sm text-[#1a1a18] dark:text-[#f0efe8] focus:border-[#2a8549] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(sup.id, sec.id, prod.id)}
                                  aria-label={`Eliminar ${prod.name || 'producto'}`}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#b91c1c] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={prod.note || ''}
                                onChange={(e) =>
                                  updateProduct(
                                    sup.id,
                                    sec.id,
                                    prod.id,
                                    'note',
                                    e.target.value
                                  )
                                }
                                placeholder="Nota personal (solo para ti, no sale en WhatsApp)"
                                aria-label={`Nota personal de ${prod.name || 'producto'}`}
                                className="min-h-[36px] w-full rounded-lg border border-black/8 dark:border-white/8 bg-white/70 dark:bg-[#1e1e1c]/70 px-3 text-xs text-[#4a4a45] dark:text-[#b5b4ac] placeholder:text-[#9c9b94] dark:placeholder:text-[#6a6a63] focus:border-[#2a8549] focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addProduct(sup.id, sec.id)}
                          className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-black/12 dark:border-white/12 bg-white dark:bg-[#1e1e1c] px-3 py-1.5 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir producto</span>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addSection(sup.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-dashed border-black/20 dark:border-white/20 px-4 py-2 text-xs font-medium text-[#5c5c56] dark:text-[#a8a8a0] hover:text-[#1a1a18] dark:hover:text-[#f0efe8] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Añadir sección</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })
        )}
      </div>

      <ConfirmSheet
        open={Boolean(deleteSupplierTarget)}
        title={`¿Eliminar a ${deleteSupplierTarget?.name || 'este proveedor'}?`}
        description="Se borrará este proveedor y todos sus productos de tu catálogo guardado."
        confirmLabel="Eliminar proveedor"
        variant="danger"
        onConfirm={() => {
          if (deleteSupplierTarget) deleteSupplier(deleteSupplierTarget.id);
          setDeleteSupplierTarget(null);
        }}
        onCancel={() => setDeleteSupplierTarget(null)}
      />

      <ConfirmSheet
        open={confirmRestoreOpen}
        title="¿Restaurar el catálogo original?"
        description="Se restablecerán los 10 proveedores y productos iniciales. Cualquier proveedor añadido manualmente se reemplazará."
        confirmLabel="Restaurar catálogo"
        variant="danger"
        onConfirm={() => {
          onRestoreDefaults();
          setConfirmRestoreOpen(false);
        }}
        onCancel={() => setConfirmRestoreOpen(false)}
      />
    </div>
  );
};
