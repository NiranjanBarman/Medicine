// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const useIndoorSaleStore = create(
//     persist(
//         (set, get) => ({
//             indoorSales: [], // Array to hold indoor sale transactions

//             // Function to add a new indoor sale transaction
//             addIndoorSale: (sale) => {
//                 set((state) => ({
//                     indoorSales: [...state.indoorSales, { ...sale, saleType: 'Indoor Sale' }],
//                 }));
//             },

//             // Function to update an existing indoor sale transaction (optional, but good to have)
//             updateIndoorSale: (updatedSale) => {
//                 set((state) => ({
//                     indoorSales: state.indoorSales.map((sale) =>
//                         sale.id === updatedSale.id ? { ...updatedSale, saleType: 'Indoor Sale' } : sale
//                     ),
//                 }));
//             },

//             // Function to delete an indoor sale transaction
//             deleteIndoorSale: (saleId) => {
//                 set((state) => ({
//                     indoorSales: state.indoorSales.filter((sale) => sale.id !== saleId),
//                 }));
//             },

//             // Function to get a specific indoor sale by ID
//             getIndoorSaleById: (saleId) => {
//                 return get().indoorSales.find(sale => sale.id === saleId);
//             },
//         }),
//         {
//             name: 'indoor-sales-storage', // unique name for localStorage key
//             getStorage: () => localStorage, // (optional) by default 'localStorage' is used
//         }
//     )
// );

// export default useIndoorSaleStore;

// src/store/useIndoorSaleStore.js


import { create } from "zustand";
import { persist } from "zustand/middleware";

const useIndoorSaleStore = create(
  persist(
    (set, get) => ({
      indoorSales: [],

      addIndoorSale: (sale) => {
        set((state) => ({
          indoorSales: [
            ...state.indoorSales,
            { ...sale, saleType: "Indoor Sale" },
          ],
        }));
      },

      updateIndoorSale: (updatedSale) => {
        set((state) => ({
          indoorSales: state.indoorSales.map((sale) =>
            sale.id === updatedSale.id
              ? { ...updatedSale, saleType: "Indoor Sale" }
              : sale
          ),
        }));
      },

      deleteIndoorSale: (saleId) => {
        set((state) => ({
          indoorSales: state.indoorSales.filter((sale) => sale.id !== saleId),
        }));
      },

      // NEW: Action to update a sale's payment details
      updateIndoorSalePayment: (updatedSale) => {
        set((state) => ({
          indoorSales: state.indoorSales.map((sale) =>
            sale.id === updatedSale.id ? updatedSale : sale
          ),
        }));
      },

      getIndoorSaleById: (saleId) => {
        return get().indoorSales.find((sale) => sale.id === saleId);
      },
    }),
    {
      name: "indoor-sales-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useIndoorSaleStore;
