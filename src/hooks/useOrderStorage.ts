import { useEffect, useState } from 'react';
import {
  DEFAULT_BOSS_PHONE,
  convertRawCatalog,
  getDefaultSuppliers,
} from '../data/defaultCatalog';
import {
  OrderHistoryEntry,
  QuantitiesMap,
  Supplier,
  ThemePreference,
} from '../types/orders';

const KEY_SUPPLIERS = 'pedidos_catalog_v1';
const KEY_CATALOG_VERSION = 'pedidos_catalog_version';
const CURRENT_CATALOG_VERSION = '2';
const KEY_LEGACY_SUPPLIERS = 'pedidos_data2';
const KEY_QUANTITIES = 'pedidos_draft_v1';
const KEY_HISTORY = 'pedidos_history_v1';
const KEY_BOSS_PHONE = 'pedidos_boss_phone_v1';
const KEY_DELIVERY_DAY = 'pedidos_delivery_day_v1';
const KEY_THEME = 'pedidos_theme_v1';

function migrateSuppliersIfNeeded(suppliers: Supplier[]): Supplier[] {
  const version = localStorage.getItem(KEY_CATALOG_VERSION);
  if (version === CURRENT_CATALOG_VERSION) return suppliers;

  const updated = suppliers.map((sup) => {
    if (sup.name.toLowerCase().includes('iberdeli')) {
      return {
        ...sup,
        sections: [
          {
            id: sup.sections[0]?.id || 'sec-iberdeli-0',
            label: null,
            products: [
              {
                id: 'prod-2-0-0',
                code: null,
                name: 'PICANHA WAGYU A5',
              },
            ],
          },
        ],
      };
    }
    return sup;
  });

  try {
    localStorage.setItem(KEY_CATALOG_VERSION, CURRENT_CATALOG_VERSION);
  } catch {
    // ignore
  }
  return updated;
}

function loadInitialSuppliers(): Supplier[] {
  try {
    const saved = localStorage.getItem(KEY_SUPPLIERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return migrateSuppliersIfNeeded(parsed);
      }
    }
    const legacy = localStorage.getItem(KEY_LEGACY_SUPPLIERS);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        return migrateSuppliersIfNeeded(convertRawCatalog(parsedLegacy));
      }
    }
  } catch {
    // Fallback to default catalog on parse error
  }
  try {
    localStorage.setItem(KEY_CATALOG_VERSION, CURRENT_CATALOG_VERSION);
  } catch {
    // ignore
  }
  return getDefaultSuppliers();
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useOrderStorage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadInitialSuppliers);
  const [quantities, setQuantities] = useState<QuantitiesMap>(() =>
    loadJSON<QuantitiesMap>(KEY_QUANTITIES, {})
  );
  const [history, setHistory] = useState<OrderHistoryEntry[]>(() =>
    loadJSON<OrderHistoryEntry[]>(KEY_HISTORY, [])
  );
  const [bossPhone, setBossPhone] = useState<string>(
    () => localStorage.getItem(KEY_BOSS_PHONE) || DEFAULT_BOSS_PHONE
  );
  const [deliveryDay, setDeliveryDay] = useState<string>(
    () => localStorage.getItem(KEY_DELIVERY_DAY) || 'miércoles'
  );
  const [theme, setTheme] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem(KEY_THEME);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY_SUPPLIERS, JSON.stringify(suppliers));
    } catch {
      // ignore quota errors
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_QUANTITIES, JSON.stringify(quantities));
    } catch {
      // ignore quota errors
    }
  }, [quantities]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore quota errors
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_BOSS_PHONE, bossPhone);
    } catch {
      // ignore
    }
  }, [bossPhone]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_DELIVERY_DAY, deliveryDay);
    } catch {
      // ignore
    }
  }, [deliveryDay]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_THEME, theme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      root.classList.toggle('dark', isDark);
    };

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  const setProductQuantity = (productId: string, nextQty: number) => {
    const clamped = Math.max(0, Math.min(999, Math.round(nextQty)));
    setQuantities((prev) => {
      if (clamped === 0) {
        if (!(productId in prev)) return prev;
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: clamped };
    });
  };

  const resetQuantities = () => {
    setQuantities({});
  };

  const addHistoryEntry = (entry: OrderHistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 50));
  };

  const deleteHistoryEntry = (entryId: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== entryId));
  };

  const updateProductNote = (productId: string, note: string) => {
    const trimmed = note.trim();
    setSuppliers((prev) =>
      prev.map((sup) => ({
        ...sup,
        sections: sup.sections.map((sec) => ({
          ...sec,
          products: sec.products.map((prod) =>
            prod.id === productId
              ? { ...prod, note: trimmed ? trimmed : null }
              : prod
          ),
        })),
      }))
    );
  };

  const restoreDefaultCatalog = () => {
    setSuppliers(getDefaultSuppliers());
    setBossPhone(DEFAULT_BOSS_PHONE);
  };

  return {
    suppliers,
    setSuppliers,
    quantities,
    setQuantities,
    setProductQuantity,
    resetQuantities,
    history,
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
  };
}
