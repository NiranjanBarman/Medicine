import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useItemMedicineStore = create(
  persist(
    (set) => ({
      items: [], // Initial empty array for items/medicines
  
      // Action to add a new item
      addItem: (newItem) => {
        set((state) => {
          const itemToAdd = { ...newItem, id: newItem.id || crypto.randomUUID() };
          return { items: [...state.items, itemToAdd] };
        });
        console.log('Item/Medicine added:', newItem);
      },

      // Action to update an existing item
      updateItem: (updatedItem) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        }));
        console.log('Item/Medicine updated:', updatedItem);
      },

      // Action to delete an item by ID
      deleteItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
        console.log('Item/Medicine deleted:', itemId);
      },
      clearAllItems: () => set({ items: [] }),
        addItemsBulk: (newItems) => // This action adds multiple items
        set((state) => ({
          items: [...state.items, ...newItems],
        })),
      // Action to initialize items (e.g., if loading from API)
      setItems: (itemsArray) => set({ items: itemsArray }),
    
    }),
    {
      name: 'item-medicine-storage', // unique name for localStorage
    }
  )
);

export default useItemMedicineStore;