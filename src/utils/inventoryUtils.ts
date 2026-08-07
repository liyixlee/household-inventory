import { InventoryItem, ItemBatch, StockStatus, AlertItem, AlertSeverity } from '../types';

/**
 * Calculates total quantity across all batches for an item
 */
export function getItemTotalQuantity(item: InventoryItem): number {
  return item.batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
}

/**
 * Gets the earliest expiry date from an item's batches that have expiry dates
 */
export function getEarliestExpiryDate(item: InventoryItem): string | null {
  if (!item.hasExpiry || !item.batches.length) return null;
  const dates = item.batches
    .map(b => b.expiryDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates.length > 0 ? dates[0] : null;
}

/**
 * Determines days until expiry date from reference date (YYYY-MM-DD or ISO)
 */
export function getDaysUntilExpiry(expiryDateStr: string, referenceDate: Date = new Date()): number {
  const expiry = new Date(expiryDateStr);
  // Reset time to start of day for comparison
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - ref.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the aggregate stock & expiry status for an item
 */
export function getItemStatus(item: InventoryItem, warningDays: number = 7): StockStatus {
  const totalQty = getItemTotalQuantity(item);
  if (totalQty <= 0) {
    return 'out_of_stock';
  }

  // Check for expired or expiring soon batches
  let hasExpiredBatch = false;
  let hasExpiringSoonBatch = false;

  if (item.hasExpiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const batch of item.batches) {
      if (batch.quantity > 0 && batch.expiryDate) {
        const days = getDaysUntilExpiry(batch.expiryDate, today);
        if (days < 0) {
          hasExpiredBatch = true;
        } else if (days <= warningDays) {
          hasExpiringSoonBatch = true;
        }
      }
    }
  }

  if (hasExpiredBatch) {
    return 'expired';
  }

  if (totalQty <= item.lowStockThreshold) {
    return 'low_stock';
  }

  if (hasExpiringSoonBatch) {
    return 'expiring_soon';
  }

  return 'in_stock';
}

/**
 * Formats YYYY-MM-DD string into a clean readable date
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'No expiry';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Helper to get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Helper to get a future date in YYYY-MM-DD format
 */
export function getFutureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

/**
 * System evaluation engine: Evaluates items and returns updated list of open alerts
 */
export function evaluateAllAlerts(
  items: InventoryItem[],
  existingAlerts: AlertItem[],
  warningDays: number = 7
): { alerts: AlertItem[]; newAlertsCount: number } {
  const nowStr = new Date().toISOString();
  const todayStr = getTodayString();
  const updatedAlerts = [...existingAlerts];
  let newAlertsCount = 0;

  for (const item of items) {
    const totalQty = getItemTotalQuantity(item);

    // 1. Check Stock Alert
    const existingStockAlert = updatedAlerts.find(
      a => a.itemId === item.id && a.type === 'stock' && a.status === 'open'
    );

    if (totalQty === 0) {
      if (!existingStockAlert) {
        updatedAlerts.unshift({
          id: `alert-stock-${item.id}-${Date.now()}`,
          type: 'stock',
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          storageLocation: item.storageLocation,
          severity: 'red',
          message: `Out of Stock: Total quantity is 0 ${item.unit}. Reorder recommended.`,
          timestamp: nowStr,
          status: 'open',
          currentQuantity: 0
        });
        newAlertsCount++;
      } else if (existingStockAlert.severity !== 'red') {
        existingStockAlert.severity = 'red';
        existingStockAlert.message = `Out of Stock: Total quantity dropped to 0 ${item.unit}.`;
        existingStockAlert.timestamp = nowStr;
      }
    } else if (totalQty <= item.lowStockThreshold) {
      if (!existingStockAlert) {
        updatedAlerts.unshift({
          id: `alert-stock-${item.id}-${Date.now()}`,
          type: 'stock',
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          storageLocation: item.storageLocation,
          severity: 'amber',
          message: `Low Stock: Only ${totalQty} ${item.unit} remaining (Threshold: ${item.lowStockThreshold}).`,
          timestamp: nowStr,
          status: 'open',
          currentQuantity: totalQty
        });
        newAlertsCount++;
      }
    } else if (existingStockAlert) {
      // Auto-resolve stock alert if qty is now healthy
      existingStockAlert.status = 'resolved';
      existingStockAlert.resolvedAt = nowStr;
      existingStockAlert.resolutionAction = 'System auto-resolved: Stock restored above threshold';
    }

    // 2. Check Expiry Alerts per batch
    if (item.hasExpiry) {
      for (const batch of item.batches) {
        if (!batch.expiryDate || batch.quantity <= 0) continue;

        const daysLeft = getDaysUntilExpiry(batch.expiryDate);
        const existingExpiryAlert = updatedAlerts.find(
          a => a.itemId === item.id && a.batchId === batch.id && a.type === 'expiry' && a.status === 'open'
        );

        if (daysLeft < 0) {
          if (!existingExpiryAlert) {
            updatedAlerts.unshift({
              id: `alert-exp-${item.id}-${batch.id}-${Date.now()}`,
              type: 'expiry',
              itemId: item.id,
              batchId: batch.id,
              itemName: item.name,
              category: item.category,
              storageLocation: item.storageLocation,
              severity: 'red',
              message: `Expired: Batch of ${batch.quantity} ${item.unit} expired on ${formatDate(batch.expiryDate)} (${Math.abs(daysLeft)} days ago).`,
              timestamp: nowStr,
              status: 'open',
              expiryDate: batch.expiryDate,
              currentQuantity: batch.quantity
            });
            newAlertsCount++;
          } else if (existingExpiryAlert.severity !== 'red') {
            existingExpiryAlert.severity = 'red';
            existingExpiryAlert.message = `Expired: Batch of ${batch.quantity} ${item.unit} expired on ${formatDate(batch.expiryDate)}.`;
            existingExpiryAlert.timestamp = nowStr;
          }
        } else if (daysLeft <= warningDays) {
          if (!existingExpiryAlert) {
            const dayText = daysLeft === 0 ? 'today' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
            updatedAlerts.unshift({
              id: `alert-exp-${item.id}-${batch.id}-${Date.now()}`,
              type: 'expiry',
              itemId: item.id,
              batchId: batch.id,
              itemName: item.name,
              category: item.category,
              storageLocation: item.storageLocation,
              severity: 'amber',
              message: `Expiring Soon: Batch of ${batch.quantity} ${item.unit} expires ${dayText} (${formatDate(batch.expiryDate)}).`,
              timestamp: nowStr,
              status: 'open',
              expiryDate: batch.expiryDate,
              currentQuantity: batch.quantity
            });
            newAlertsCount++;
          }
        } else if (existingExpiryAlert) {
          // Auto-resolve if expiry date was extended or batch removed
          existingExpiryAlert.status = 'resolved';
          existingExpiryAlert.resolvedAt = nowStr;
          existingExpiryAlert.resolutionAction = 'System auto-resolved: Expiry date updated or batch consumed';
        }
      }
    }
  }

  // Handle snoozed alerts reactivation if snooze period ended
  for (const alert of updatedAlerts) {
    if (alert.status === 'snoozed' && alert.snoozedUntil) {
      if (alert.snoozedUntil <= todayStr) {
        alert.status = 'open';
        alert.message = `[Snooze expired] ${alert.message}`;
      }
    }
  }

  return { alerts: updatedAlerts, newAlertsCount };
}
