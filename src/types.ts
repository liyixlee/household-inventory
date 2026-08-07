export type Category = 
  | 'Pantry'
  | 'Fridge'
  | 'Freezer'
  | 'Beverages'
  | 'Household'
  | 'Personal Care'
  | 'Medicine'
  | 'Cleaning'
  | 'Other';

export type StorageLocation = 
  | 'Pantry Shelf'
  | 'Refrigerator'
  | 'Freezer'
  | 'Medicine Cabinet'
  | 'Cleaning Closet'
  | 'Bathroom Shelf'
  | 'Countertop'
  | 'Garage Storage';

export type Unit = 'pcs' | 'pack' | 'box' | 'can' | 'bottle' | 'kg' | 'g' | 'L' | 'ml' | 'carton' | 'bag';

export type StockStatus = 'out_of_stock' | 'low_stock' | 'expiring_soon' | 'expired' | 'in_stock';

export interface ItemBatch {
  id: string;
  quantity: number;
  expiryDate?: string; // YYYY-MM-DD
  addedDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  storageLocation: StorageLocation;
  lowStockThreshold: number;
  hasExpiry: boolean;
  barcode?: string;
  batches: ItemBatch[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType = 'stock' | 'expiry';
export type AlertSeverity = 'red' | 'amber'; // red = out_of_stock / expired; amber = low_stock / expiring_soon
export type AlertStatus = 'open' | 'snoozed' | 'resolved';

export interface AlertItem {
  id: string;
  type: AlertType;
  itemId: string;
  itemName: string;
  category: Category;
  storageLocation: StorageLocation;
  severity: AlertSeverity;
  message: string;
  timestamp: string; // ISO or date string
  status: AlertStatus;
  snoozedUntil?: string; // YYYY-MM-DD
  resolvedAt?: string;
  resolutionAction?: string;
  batchId?: string;
  currentQuantity?: number;
  expiryDate?: string;
}

export interface ShoppingListItem {
  id: string;
  itemId?: string; // optional link to inventory item
  name: string;
  category: Category;
  quantityNeeded: number;
  unit: Unit;
  isPriority: boolean;
  purchased: boolean;
  addedFromAlert: boolean;
  targetStorageLocation?: StorageLocation;
  notes?: string;
  addedAt: string;
}

export type ScreenName = 
  | 'dashboard' 
  | 'inventory' 
  | 'item_details' 
  | 'add_edit_item' 
  | 'alerts' 
  | 'shopping_list';

export interface FilterOptions {
  search: string;
  category: string;
  location: string;
  status: string; // 'all' | StockStatus
  sortBy: 'name' | 'quantity' | 'expiry' | 'location';
  sortOrder: 'asc' | 'desc';
}

export interface ToastMessage {
  id: string;
  type: 'blue' | 'purple' | 'amber' | 'red' | 'green';
  title: string;
  description?: string;
  timestamp: string;
}
