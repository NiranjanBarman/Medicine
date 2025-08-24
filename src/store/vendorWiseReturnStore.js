// src/store/vendorWiseReturnStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useVendorWiseReturnStore = create(
  persist(
    (set) => ({
      vendorReturnDocuments: [],
      currentSessionReturnItems: [],

      // Action to add a return item to the current session
      addReturnItem: (item) =>
        set((state) => ({
          currentSessionReturnItems: [...state.currentSessionReturnItems, item],
        })),

      // Action to remove an item from the current session by its ID
      removeReturnItem: (itemId) =>
        set((state) => ({
          currentSessionReturnItems: state.currentSessionReturnItems.filter(
            (item) => item.id !== itemId
          ),
        })),

      // Action to clear all items from the current session
      clearCurrentSessionReturnItems: () =>
        set(() => ({
          currentSessionReturnItems: [],
        })),

      // Action to save the final return document
      addReturnDocument: (document) =>
        set((state) => ({
          vendorReturnDocuments: [...state.vendorReturnDocuments, document],
        })),
    }),
    {
      name: 'vendor-wise-return-storage', // unique name for local storage
    }
  )
);

export default useVendorWiseReturnStore;