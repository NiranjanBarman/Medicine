// src/store/grcPaymentStore.js

// Import create and persist from zustand (or your preferred state management library)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGRCPaymentStore = create(
    persist(
        (set, get) => ({
            grcPayments: [],

            addGRCPayment: (newPayment) => {
                set((state) => ({
                    grcPayments: [...state.grcPayments, newPayment],
                }));
            },

            getGRCPaymentById: (id) => {
                return get().grcPayments.find(payment => payment.id === id);
            },
        }),
        {
            name: 'grc-payments-storage',
        }
    )
);

export default useGRCPaymentStore;