// src/store/useCounterSaleStore.js
// Pehle ka saleTransactionStore.js, ab sirf Counter Sales ke liye.
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useCounterSaleStore = create(
    devtools(
        persist(
            (set, get) => ({
                counterSales: [], // Ab yeh array sirf Counter Sales ka data rakhega

                addCounterSale: (newSale) => {
                    set((state) => ({
                        counterSales: [...state.counterSales, newSale],
                    }));
                },

                updateCounterSale: (updatedSale) => {
                    set((state) => ({
                        counterSales: state.counterSales.map((sale) =>
                            sale.id === updatedSale.id ? updatedSale : sale
                        ),
                    }));
                },
                
                deleteCounterSale: (saleId) => {
                    set((state) => ({
                        counterSales: state.counterSales.filter((sale) => sale.id !== saleId),
                    }));
                },

                getCounterSaleById: (id) => {
                    return get().counterSales.find((sale) => sale.id === id);
                },

                getCounterSalesByDate: (date) => {
                    return get().counterSales.filter((sale) => sale.saleDate === date);
                },

                getTotalCounterSalesAmount: () => {
                    return get().counterSales.reduce((total, sale) => total + sale.totalAmount, 0);
                },
            }),
            
            {
                name: 'counter-sales-storage', // Local Storage key bhi badal diya
                getStorage: () => localStorage,
                partialize: (state) => ({
                    counterSales: state.counterSales,
                }),
                onRehydrateStorage: (state) => {
                    console.log('Counter Sale store rehydrated. Loaded state:', state);
                },
            }
        )
    )
);

export default useCounterSaleStore;