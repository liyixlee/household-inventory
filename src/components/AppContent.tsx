import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Dashboard } from './Dashboard';
import { InventoryList } from './InventoryList';
import { ItemDetails } from './ItemDetails';
import { AddEditItem } from './AddEditItem';
import { Alerts } from './Alerts';
import { ShoppingList } from './ShoppingList';

export const AppContent: React.FC = () => {
  const { currentScreen } = useInventory();

  switch (currentScreen) {
    case 'dashboard':
      return <Dashboard />;
    case 'inventory':
      return <InventoryList />;
    case 'item_details':
      return <ItemDetails />;
    case 'add_edit_item':
      return <AddEditItem />;
    case 'alerts':
      return <Alerts />;
    case 'shopping_list':
      return <ShoppingList />;
    default:
      return <Dashboard />;
  }
};
