// src/store/paymentStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to safely parse float values
const safeParseFloat = (value) => parseFloat(value || 0) || 0;

const usePaymentStore = create(
  persist(
    (set, get) => ({
      payments: [],

      // Adds a new payment record to the store
      addPayment: (newPayment) => {
        set((state) => ({
          payments: [...state.payments, newPayment],
        }));
        console.log("Payment added to store:", newPayment);
      },

      // Calculates the total amount paid for a specific transaction ID
      getAmountPaidForTransaction: (transactionId) => {
        const paymentsForTransaction = get().payments.filter(payment =>
          payment.paidInvoices.some(invoice => invoice.invoiceId === transactionId)
        );
        return paymentsForTransaction.reduce((sum, payment) => {
          const invoiceDetail = payment.paidInvoices.find(invoice => invoice.invoiceId === transactionId);
          return sum + safeParseFloat(invoiceDetail?.amount || payment.amount);
        }, 0);
      },
      
      // Clears all payments
      clearAllPayments: () => set({ payments: [] }, true),
    }),
    {
      name: 'payment-store-storage', // local storage name
    }
  )
);

export default usePaymentStore;
