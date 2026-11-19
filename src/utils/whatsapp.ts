import { QuantitiesMap, SentSupplierSnapshot, Supplier } from '../types/orders';

export function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function buildActiveSnapshots(
  suppliers: Supplier[],
  quantities: QuantitiesMap
): SentSupplierSnapshot[] {
  const snapshots: SentSupplierSnapshot[] = [];

  for (const supplier of suppliers) {
    const activeSections: SentSupplierSnapshot['sections'] = [];

    for (const section of supplier.sections) {
      const activeItems = section.products
        .map((product) => ({
          productId: product.id,
          code: product.code,
          name: product.name,
          qty: quantities[product.id] || 0,
        }))
        .filter((item) => item.qty > 0);

      if (activeItems.length > 0) {
        activeSections.push({
          label: section.label,
          items: activeItems,
        });
      }
    }

    if (activeSections.length > 0) {
      snapshots.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        phone: supplier.phone,
        sections: activeSections,
      });
    }
  }

  return snapshots;
}

export function buildSupplierWhatsAppMessage(
  snapshot: SentSupplierSnapshot,
  deliveryDay: string
): string {
  const day = deliveryDay.trim() || 'el próximo día';
  const lines: string[] = [];

  for (const section of snapshot.sections) {
    if (section.label) {
      lines.push(`— ${section.label} —`);
    }
    for (const item of section.items) {
      const label = item.code ? `${item.code} ${item.name}` : item.name;
      lines.push(`${label} x${item.qty}`);
    }
  }

  return `Buenas, para el ${day}\n${lines.join('\n')}\nGracias`;
}

export function buildBossWhatsAppMessage(
  snapshots: SentSupplierSnapshot[],
  deliveryDay: string
): string {
  const day = deliveryDay.trim() || 'el próximo día';
  let msg = `Pedidos para ${day}:\n`;

  for (const snapshot of snapshots) {
    const lines: string[] = [];
    for (const section of snapshot.sections) {
      if (section.label) {
        lines.push(`  — ${section.label} —`);
      }
      for (const item of section.items) {
        const label = item.code ? `${item.code} ${item.name}` : item.name;
        lines.push(`  ${label} x${item.qty}`);
      }
    }
    if (lines.length > 0) {
      msg += `\n${snapshot.supplierName}\n${lines.join('\n')}\n`;
    }
  }

  return msg.trimEnd();
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const sanitized = cleanPhone(phone);
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppPickerUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
