import { InventoryItem, AlertItem, ShoppingListItem } from '../types';
import { getTodayString, getFutureDateString } from '../utils/inventoryUtils';

const today = getTodayString();

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Whole Milk 2%',
    category: 'Fridge',
    unit: 'carton',
    storageLocation: 'Refrigerator',
    lowStockThreshold: 2,
    hasExpiry: true,
    barcode: '012000001291',
    batches: [
      {
        id: 'batch-1-1',
        quantity: 1,
        expiryDate: getFutureDateString(2), // expiring in 2 days
        addedDate: getFutureDateString(-5),
        notes: 'Opened 3 days ago'
      },
      {
        id: 'batch-1-2',
        quantity: 1,
        expiryDate: getFutureDateString(9), // fresh batch
        addedDate: getFutureDateString(-1)
      }
    ],
    notes: 'Organic 2% pasteurized milk',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-2',
    name: 'Large Brown Eggs',
    category: 'Fridge',
    unit: 'pcs',
    storageLocation: 'Refrigerator',
    lowStockThreshold: 6,
    hasExpiry: true,
    barcode: '041220001004',
    batches: [
      {
        id: 'batch-2-1',
        quantity: 0, // out of stock
        expiryDate: getFutureDateString(-1),
        addedDate: getFutureDateString(-20)
      }
    ],
    notes: 'Grade A pasture raised eggs',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-3',
    name: 'Canned Crushed Tomatoes',
    category: 'Pantry',
    unit: 'can',
    storageLocation: 'Pantry Shelf',
    lowStockThreshold: 3,
    hasExpiry: true,
    barcode: '078742351829',
    batches: [
      {
        id: 'batch-3-1',
        quantity: 8,
        expiryDate: getFutureDateString(180),
        addedDate: getFutureDateString(-30)
      }
    ],
    notes: 'San Marzano style',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-4',
    name: 'Extra Virgin Olive Oil',
    category: 'Pantry',
    unit: 'bottle',
    storageLocation: 'Pantry Shelf',
    lowStockThreshold: 2,
    hasExpiry: true,
    barcode: '037000123456',
    batches: [
      {
        id: 'batch-4-1',
        quantity: 1, // Low stock (1 <= 2)
        expiryDate: getFutureDateString(120),
        addedDate: getFutureDateString(-45)
      }
    ],
    notes: 'Cold pressed 1L bottle',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-5',
    name: 'Artisan Whole Wheat Bread',
    category: 'Pantry',
    unit: 'pack',
    storageLocation: 'Countertop',
    lowStockThreshold: 1,
    hasExpiry: true,
    barcode: '051000012345',
    batches: [
      {
        id: 'batch-5-1',
        quantity: 1,
        expiryDate: getFutureDateString(-2), // Expired 2 days ago!
        addedDate: getFutureDateString(-8)
      }
    ],
    notes: 'Fresh bakery bread',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-6',
    name: 'Ibuprofen 200mg',
    category: 'Medicine',
    unit: 'bottle',
    storageLocation: 'Medicine Cabinet',
    lowStockThreshold: 2,
    hasExpiry: true,
    barcode: '030573016420',
    batches: [
      {
        id: 'batch-6-1',
        quantity: 1, // Low stock & expiring soon
        expiryDate: getFutureDateString(4),
        addedDate: getFutureDateString(-365)
      }
    ],
    notes: '100 caplets bottle',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-7',
    name: 'Ultra Soft Toilet Paper',
    category: 'Household',
    unit: 'pack',
    storageLocation: 'Bathroom Shelf',
    lowStockThreshold: 2,
    hasExpiry: false, // No expiry
    batches: [
      {
        id: 'batch-7-1',
        quantity: 4,
        addedDate: getFutureDateString(-15)
      }
    ],
    notes: '12 double rolls mega pack',
    createdAt: today,
    updatedAt: today
  },
  {
    id: 'item-8',
    name: 'Disinfectant Multi-Surface Spray',
    category: 'Cleaning',
    unit: 'bottle',
    storageLocation: 'Cleaning Closet',
    lowStockThreshold: 1,
    hasExpiry: false,
    batches: [
      {
        id: 'batch-8-1',
        quantity: 2,
        addedDate: getFutureDateString(-10)
      }
    ],
    createdAt: today,
    updatedAt: today
  }
];

export const INITIAL_SHOPPING_LIST: ShoppingListItem[] = [
  {
    id: 'shop-1',
    itemId: 'item-2',
    name: 'Large Brown Eggs',
    category: 'Fridge',
    quantityNeeded: 12,
    unit: 'pcs',
    isPriority: true,
    purchased: false,
    addedFromAlert: true,
    targetStorageLocation: 'Refrigerator',
    notes: 'Auto-added: Item is Out of Stock',
    addedAt: today
  },
  {
    id: 'shop-2',
    itemId: 'item-4',
    name: 'Extra Virgin Olive Oil',
    category: 'Pantry',
    quantityNeeded: 2,
    unit: 'bottle',
    isPriority: false,
    purchased: false,
    addedFromAlert: true,
    targetStorageLocation: 'Pantry Shelf',
    notes: 'Auto-added: Low Stock warning',
    addedAt: today
  },
  {
    id: 'shop-3',
    name: 'Sparkling Mineral Water 12-Pack',
    category: 'Beverages',
    quantityNeeded: 2,
    unit: 'pack',
    isPriority: false,
    purchased: false,
    addedFromAlert: false,
    targetStorageLocation: 'Pantry Shelf',
    notes: 'Manual user request',
    addedAt: today
  }
];
