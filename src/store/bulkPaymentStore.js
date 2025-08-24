// src/store/bulkPaymentStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBulkPaymentStore = create(
  persist(
    (set) => ({
      bulkPayments: [],
      isHydrated: false, // 🔹 hydration flag

      addBulkPayment: (payment) => {
        set((state) => ({
          bulkPayments: [...state.bulkPayments, payment],
        }));
      },

      // ✅ Hydration complete handler
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "bulk-payment-storage",
      onRehydrateStorage: () => (state) => {
        // 🔹 jab storage se data load ho jaye
        if (state) state.setHydrated();
      },
    }
  )
);

export default useBulkPaymentStore;
