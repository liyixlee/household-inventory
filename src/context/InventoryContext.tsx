import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  InventoryItem,
  AlertItem,
  ShoppingListItem,
  ScreenName,
  FilterOptions,
  ToastMessage,
  Category,
  StorageLocation,
  Unit,
  ItemBatch
} from '../types';
import { INITIAL_ITEMS, INITIAL_SHOPPING_LIST } from '../data/initialData';
import {
  evaluateAllAlerts,
  getItemTotalQuantity,
  getTodayString,
  getDaysUntilExpiry
} from '../utils/inventoryUtils';

interface InventoryContextType {
  // State
  items: InventoryItem[];
  alerts: AlertItem[];
  shoppingList: ShoppingListItem[];
  currentScreen: ScreenName;
  selectedItemId: string | null;
  editingItemId: string | null;
  filters: FilterOptions;
  expiryWarningDays: number;
  toasts: ToastMessage[];
  selectedInventoryItemIds: string[]; // for multi-select

  // Navigation
  navigateTo: (screen: ScreenName, itemId?: string | null) => void;
  openEditItem: (itemId: string) => void;

  // Filter Management
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (ids: string[]) => void;
  clearItemSelection: () => void;

  // Item Actions
  addItem: (
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'batches'>,
    initialBatch?: { quantity: number; expiryDate?: string; notes?: string }
  ) => { success: boolean; itemId?: string; duplicateItem?: InventoryItem };

  addBatchToItem: (
    itemId: string,
    batch: { quantity: number; expiryDate?: string; notes?: string }
  ) => void;

  updateItemQuantity: (itemId: string, newTotalQuantity: number) => void;

  updateItem: (
    itemId: string,
    itemData: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => void;

  deleteItem: (itemId: string) => void;

  deleteBatch: (itemId: string, batchId: string) => void;

  // Alert Actions
  resolveAlert: (
    alertId: string,
    actionType: 'shopping_list' | 'update_qty' | 'discard' | 'extend_expiry' | 'snooze' | 'dismiss',
    payload?: { newQty?: number; newExpiryDate?: string; snoozeDays?: number }
  ) => void;

  snoozeAlert: (alertId: string, days?: number) => void;
  dismissAlert: (alertId: string) => void;

  // Shopping List Actions
  addToShoppingList: (
    itemData: {
      itemId?: string;
      name: string;
      category: Category;
      quantityNeeded: number;
      unit: Unit;
      isPriority?: boolean;
      targetStorageLocation?: StorageLocation;
      notes?: string;
      addedFromAlert?: boolean;
    }
  ) => void;

  addMultipleToShoppingList: (itemIds: string[]) => void;

  removeFromShoppingList: (shoppingItemId: string) => void;

  toggleShoppingItemPriority: (shoppingItemId: string) => void;

  updateShoppingItemQty: (shoppingItemId: string, quantity: number) => void;

  markShoppingItemPurchased: (
    shoppingItemId: string,
    syncWithInventory: boolean,
    purchasedData?: { quantity: number; expiryDate?: string }
  ) => void;

  clearCompletedShoppingItems: () => void;

  // System & Toast Actions
  setExpiryWarningDays: (days: number) => void;
  addToast: (type: 'blue' | 'purple' | 'amber' | 'red' | 'green', title: string, description?: string) => void;
  removeToast: (id: string) => void;
  runSystemEvaluation: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  category: 'all',
  location: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('household_inventory_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('household_inventory_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const saved = localStorage.getItem('household_inventory_shopping');
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING_LIST;
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [selectedInventoryItemIds, setSelectedInventoryItemIds] = useState<string[]>([]);
  const [expiryWarningDays, setExpiryWarningDays] = useState<number>(7);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('household_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('household_inventory_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('household_inventory_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Run initial evaluation on mount & whenever items or warning window changes
  useEffect(() => {
    const { alerts: evaluated, newAlertsCount } = evaluateAllAlerts(items, alerts, expiryWarningDays);
    setAlerts(evaluated);
    if (newAlertsCount > 0) {
      addToast(
        'purple',
        'System Action: Alerts Updated',
        `${newAlertsCount} stock or expiry alert(s) detected.`
      );
    }
  }, [items.length, expiryWarningDays]);

  const addToast = (type: 'blue' | 'purple' | 'amber' | 'red' | 'green', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (screen: ScreenName, itemId: string | null = null) => {
    setCurrentScreen(screen);
    if (itemId !== undefined) {
      setSelectedItemId(itemId);
    }
    if (screen !== 'add_edit_item') {
      setEditingItemId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditItem = (itemId: string) => {
    setEditingItemId(itemId);
    setSelectedItemId(itemId);
    setCurrentScreen('add_edit_item');
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const toggleItemSelection = (id: string) => {
    setSelectedInventoryItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllItems = (ids: string[]) => setSelectedInventoryItemIds(ids);

  const clearItemSelection = () => setSelectedInventoryItemIds([]);

  const runSystemEvaluation = () => {
    const { alerts: evaluated } = evaluateAllAlerts(items, alerts, expiryWarningDays);
    setAlerts(evaluated);
    addToast('purple', 'System Action Complete', 'Re-checked inventory status and expiry conditions.');
  };

  // Add Item with Duplicate Detection
  const addItem = (
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'batches'>,
    initialBatch?: { quantity: number; expiryDate?: string; notes?: string }
  ) => {
    const today = getTodayString();
    const normalizedName = itemData.name.trim().toLowerCase();

    // System Duplicate Check
    const existing = items.find(i => i.name.trim().toLowerCase() === normalizedName);
    if (existing) {
      return { success: false, duplicateItem: existing };
    }

    const newItemId = `item-${Date.now()}`;
    const newBatches: ItemBatch[] = [];

    if (initialBatch) {
      newBatches.push({
        id: `batch-${newItemId}-1`,
        quantity: Math.max(0, initialBatch.quantity),
        expiryDate: itemData.hasExpiry ? initialBatch.expiryDate : undefined,
        addedDate: today,
        notes: initialBatch.notes
      });
    }

    const newItem: InventoryItem = {
      ...itemData,
      id: newItemId,
      batches: newBatches,
      createdAt: today,
      updatedAt: today
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);

    // Recheck alerts
    const { alerts: newAlerts } = evaluateAllAlerts(updatedItems, alerts, expiryWarningDays);
    setAlerts(newAlerts);

    addToast('green', 'Success Action', `"${newItem.name}" added to inventory.`);
    return { success: true, itemId: newItemId };
  };

  const addBatchToItem = (
    itemId: string,
    batchData: { quantity: number; expiryDate?: string; notes?: string }
  ) => {
    const today = getTodayString();
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;

        const newBatch: ItemBatch = {
          id: `batch-${itemId}-${Date.now()}`,
          quantity: Math.max(0, batchData.quantity),
          expiryDate: item.hasExpiry ? batchData.expiryDate : undefined,
          addedDate: today,
          notes: batchData.notes
        };

        const updatedItem = {
          ...item,
          batches: [...item.batches, newBatch],
          updatedAt: today
        };

        addToast('green', 'Success Action', `New batch added to "${item.name}".`);
        return updatedItem;
      })
    );
  };

  const updateItemQuantity = (itemId: string, newTotalQuantity: number) => {
    const today = getTodayString();
    const targetQty = Math.max(0, newTotalQuantity);
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;

        let updatedBatches = [...item.batches];
        if (updatedBatches.length === 0) {
          updatedBatches = [
            {
              id: `batch-${itemId}-${Date.now()}`,
              quantity: targetQty,
              addedDate: today
            }
          ];
        } else {
          // Adjust overall quantity across existing batches proportionally or on the latest batch
          if (updatedBatches.length === 1) {
            updatedBatches[0] = { ...updatedBatches[0], quantity: targetQty };
          } else {
            // Apply new qty directly to the first active or latest batch
            updatedBatches[0] = { ...updatedBatches[0], quantity: targetQty };
          }
        }

        const updatedItem = {
          ...item,
          batches: updatedBatches,
          updatedAt: today
        };

        // Check if quantity triggered low stock
        if (targetQty <= item.lowStockThreshold && targetQty > 0) {
          addToast(
            'red',
            'Alert Triggered',
            `"${item.name}" quantity (${targetQty}) is at or below low stock threshold (${item.lowStockThreshold}).`
          );
        } else if (targetQty === 0) {
          addToast('red', 'Alert Triggered', `"${item.name}" is now Out of Stock.`);
        } else {
          addToast('green', 'Success Action', `Inventory quantity updated for "${item.name}".`);
        }

        return updatedItem;
      })
    );
  };

  const updateItem = (
    itemId: string,
    itemData: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const today = getTodayString();
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updated = {
          ...item,
          ...itemData,
          updatedAt: today
        };
        addToast('green', 'Success Action', `"${updated.name}" updated successfully.`);
        return updated;
      })
    );
  };

  const deleteItem = (itemId: string) => {
    const itemToDelete = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    setAlerts(prev => prev.filter(a => a.itemId !== itemId));
    setSelectedItemId(null);
    addToast('green', 'Success Action', `"${itemToDelete?.name || 'Item'}" removed from inventory.`);
  };

  const deleteBatch = (itemId: string, batchId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updatedBatches = item.batches.filter(b => b.id !== batchId);
        return {
          ...item,
          batches: updatedBatches,
          updatedAt: getTodayString()
        };
      })
    );
    addToast('green', 'Success Action', 'Batch removed.');
  };

  // Alert Resolution Logic
  const resolveAlert = (
    alertId: string,
    actionType: 'shopping_list' | 'update_qty' | 'discard' | 'extend_expiry' | 'snooze' | 'dismiss',
    payload?: { newQty?: number; newExpiryDate?: string; snoozeDays?: number }
  ) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const todayStr = getTodayString();

    if (actionType === 'shopping_list') {
      const item = items.find(i => i.id === alert.itemId);
      const qtyToOrder = item ? Math.max(1, item.lowStockThreshold * 2) : 1;
      addToShoppingList({
        itemId: alert.itemId,
        name: alert.itemName,
        category: alert.category,
        quantityNeeded: qtyToOrder,
        unit: item ? item.unit : 'pcs',
        isPriority: alert.severity === 'red',
        targetStorageLocation: alert.storageLocation,
        notes: `Auto-added from resolved ${alert.type} alert`,
        addedFromAlert: true
      });
    } else if (actionType === 'update_qty' && payload?.newQty !== undefined) {
      updateItemQuantity(alert.itemId, payload.newQty);
    } else if (actionType === 'discard') {
      // Discard expired batch or set total quantity to 0
      if (alert.batchId) {
        deleteBatch(alert.itemId, alert.batchId);
      } else {
        updateItemQuantity(alert.itemId, 0);
      }
    } else if (actionType === 'extend_expiry' && payload?.newExpiryDate) {
      setItems(prev =>
        prev.map(item => {
          if (item.id !== alert.itemId) return item;
          const updatedBatches = item.batches.map(b => {
            if (alert.batchId && b.id !== alert.batchId) return b;
            return { ...b, expiryDate: payload.newExpiryDate };
          });
          return { ...item, batches: updatedBatches, updatedAt: todayStr };
        })
      );
    }

    // Mark alert as resolved or snoozed
    setAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        if (actionType === 'snooze') {
          const days = payload?.snoozeDays || 3;
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + days);
          return {
            ...a,
            status: 'snoozed',
            snoozedUntil: futureDate.toISOString().split('T')[0]
          };
        }
        return {
          ...a,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolutionAction: `Resolved via ${actionType.replace('_', ' ')}`
        };
      })
    );

    addToast('green', 'Success Action', `Alert resolved (${actionType.replace('_', ' ')}).`);
  };

  const snoozeAlert = (alertId: string, days: number = 3) => {
    resolveAlert(alertId, 'snooze', { snoozeDays: days });
  };

  const dismissAlert = (alertId: string) => {
    resolveAlert(alertId, 'dismiss');
  };

  // Shopping List Actions
  const addToShoppingList = (data: {
    itemId?: string;
    name: string;
    category: Category;
    quantityNeeded: number;
    unit: Unit;
    isPriority?: boolean;
    targetStorageLocation?: StorageLocation;
    notes?: string;
    addedFromAlert?: boolean;
  }) => {
    const newItem: ShoppingListItem = {
      id: `shop-${Date.now()}`,
      itemId: data.itemId,
      name: data.name,
      category: data.category,
      quantityNeeded: Math.max(1, data.quantityNeeded),
      unit: data.unit,
      isPriority: Boolean(data.isPriority),
      purchased: false,
      addedFromAlert: Boolean(data.addedFromAlert),
      targetStorageLocation: data.targetStorageLocation,
      notes: data.notes,
      addedAt: getTodayString()
    };

    setShoppingList(prev => [newItem, ...prev]);
    addToast('blue', 'User Action', `"${data.name}" added to Shopping List.`);
  };

  const addMultipleToShoppingList = (itemIds: string[]) => {
    let count = 0;
    const selectedItems = items.filter(i => itemIds.includes(i.id));

    selectedItems.forEach(item => {
      const needed = Math.max(1, item.lowStockThreshold || 1);
      addToShoppingList({
        itemId: item.id,
        name: item.name,
        category: item.category,
        quantityNeeded: needed,
        unit: item.unit,
        isPriority: getItemTotalQuantity(item) === 0,
        targetStorageLocation: item.storageLocation,
        notes: 'Added via multi-select from inventory'
      });
      count++;
    });

    clearItemSelection();
    addToast('blue', 'User Action', `${count} items added to Shopping List.`);
  };

  const removeFromShoppingList = (shoppingItemId: string) => {
    setShoppingList(prev => prev.filter(s => s.id !== shoppingItemId));
    addToast('green', 'Success Action', 'Item removed from Shopping List.');
  };

  const toggleShoppingItemPriority = (shoppingItemId: string) => {
    setShoppingList(prev =>
      prev.map(s => (s.id === shoppingItemId ? { ...s, isPriority: !s.isPriority } : s))
    );
  };

  const updateShoppingItemQty = (shoppingItemId: string, quantity: number) => {
    setShoppingList(prev =>
      prev.map(s => (s.id === shoppingItemId ? { ...s, quantityNeeded: Math.max(1, quantity) } : s))
    );
  };

  const markShoppingItemPurchased = (
    shoppingItemId: string,
    syncWithInventory: boolean,
    purchasedData?: { quantity: number; expiryDate?: string }
  ) => {
    const targetItem = shoppingList.find(s => s.id === shoppingItemId);
    if (!targetItem) return;

    if (syncWithInventory) {
      const purchasedQty = purchasedData?.quantity || targetItem.quantityNeeded;

      // If linked to existing inventory item
      if (targetItem.itemId) {
        addBatchToItem(targetItem.itemId, {
          quantity: purchasedQty,
          expiryDate: purchasedData?.expiryDate,
          notes: 'Added from completed shopping list purchase'
        });
      } else {
        // Check if item name exists or create new item
        const existing = items.find(
          i => i.name.trim().toLowerCase() === targetItem.name.trim().toLowerCase()
        );
        if (existing) {
          addBatchToItem(existing.id, {
            quantity: purchasedQty,
            expiryDate: purchasedData?.expiryDate,
            notes: 'Added from shopping list purchase'
          });
        } else {
          addItem(
            {
              name: targetItem.name,
              category: targetItem.category,
              unit: targetItem.unit,
              storageLocation: targetItem.targetStorageLocation || 'Pantry Shelf',
              lowStockThreshold: 2,
              hasExpiry: Boolean(purchasedData?.expiryDate)
            },
            {
              quantity: purchasedQty,
              expiryDate: purchasedData?.expiryDate
            }
          );
        }
      }
    }

    setShoppingList(prev =>
      prev.map(s => (s.id === shoppingItemId ? { ...s, purchased: true } : s))
    );

    addToast(
      'green',
      'Success Action',
      `"${targetItem.name}" marked as purchased ${syncWithInventory ? '& inventory updated!' : ''}`
    );
  };

  const clearCompletedShoppingItems = () => {
    setShoppingList(prev => prev.filter(s => !s.purchased));
    addToast('green', 'Success Action', 'Cleared completed shopping list items.');
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        alerts,
        shoppingList,
        currentScreen,
        selectedItemId,
        editingItemId,
        filters,
        expiryWarningDays,
        toasts,
        selectedInventoryItemIds,
        navigateTo,
        openEditItem,
        setFilters,
        resetFilters,
        toggleItemSelection,
        selectAllItems,
        clearItemSelection,
        addItem,
        addBatchToItem,
        updateItemQuantity,
        updateItem,
        deleteItem,
        deleteBatch,
        resolveAlert,
        snoozeAlert,
        dismissAlert,
        addToShoppingList,
        addMultipleToShoppingList,
        removeFromShoppingList,
        toggleShoppingItemPriority,
        updateShoppingItemQty,
        markShoppingItemPurchased,
        clearCompletedShoppingItems,
        setExpiryWarningDays,
        addToast,
        removeToast,
        runSystemEvaluation
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
