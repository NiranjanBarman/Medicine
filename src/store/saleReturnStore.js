// src/store/saleReturnStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSaleReturnStore = create(
  persist(
    (set) => ({
      saleReturns: [], // Array to store all sale return transactions

      /**
       * Adds a new sale return transaction to the store.
       * The newReturn object should already contain a unique ID and return date.
       * @param {object} newReturn - The complete sale return transaction object.
       */
      addSaleReturn: (newReturn) =>
        set((state) => ({
          saleReturns: [
            ...state.saleReturns,
            newReturn,
          ],
        })),

      /**
       * Deletes a sale return transaction from the store by its ID.
       * @param {string|number} idToDelete - The ID of the sale return to delete.
       */
      deleteSaleReturn: (idToDelete) =>
        set((state) => ({
          saleReturns: state.saleReturns.filter(
            (saleReturn) => saleReturn.id !== idToDelete
          ),
        })),
    }),
    {
      name: 'sale-return-storage', // unique name for localStorage key
      getStorage: () => localStorage, // use localStorage for persistence
    }
  )
);

export default useSaleReturnStore;