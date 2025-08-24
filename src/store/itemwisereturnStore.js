// src/store/returnStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useReturnStore = create(
  persist(
    (set, get) => ({
      currentSessionReturnItems: [],
      returnDocuments: [],

      addReturnItem: (itemToAdd) =>
        set((state) => {
          const existingItemIndex = state.currentSessionReturnItems.findIndex(
            (item) =>
              item.purchaseRecordId === itemToAdd.purchaseRecordId &&
              item.masterItemId === itemToAdd.masterItemId
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.currentSessionReturnItems];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              returnQty: itemToAdd.returnQty,
            };
            return { currentSessionReturnItems: newItems };
          } else {
            return {
              currentSessionReturnItems: [...state.currentSessionReturnItems, itemToAdd],
            };
          }
        }),

      removeReturnItem: (itemId) =>
        set((state) => ({
          currentSessionReturnItems: state.currentSessionReturnItems.filter(
            (item) => item.id !== itemId
          ),
        })),

      clearCurrentSessionReturnItems: () =>
        set(() => ({
          currentSessionReturnItems: [],
        })),

      addReturnDocument: (document) =>
        set((state) => ({
          returnDocuments: [...state.returnDocuments, document],
        })),

      deleteReturnDocument: (documentId) =>
        set((state) => ({
          returnDocuments: state.returnDocuments.filter(
            (doc) => doc.documentId !== documentId
          ),
        })),

      updateReturnDocument: (updatedDocument) =>
        set((state) => ({
          returnDocuments: state.returnDocuments.map((doc) =>
            doc.documentId === updatedDocument.documentId ? updatedDocument : doc
          ),
        })),
        
      loadReturnSessionFromDocument: (items) =>
        set(() => ({
          currentSessionReturnItems: items,
        })),

      findReturnDocumentById: (documentId) => {
        const documents = get().returnDocuments;
        return documents.find((doc) => doc.documentId === documentId);
      },
    }),
    {
      name: 'return-store-storage',
    }
  )
);

export default useReturnStore;