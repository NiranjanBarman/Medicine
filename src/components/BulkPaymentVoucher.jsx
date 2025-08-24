// src/pages/BulkPaymentVoucher.jsx
import React, { useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBulkPaymentStore from "../store/bulkPaymentStore";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useVendorStore from "../store/vendorStore";

// Helper: Format number to 2 decimals
const formatAmount = (amount) =>
  typeof amount === "number" ? amount.toFixed(2) : (0).toFixed(2);
const safe = (v, d = "—") => (v === null || v === undefined || v === "" ? d : v);

// Helper: Convert number to words
const amountInWords = (amount) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const numberToWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numberToWords(n % 100) : '');
    if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
    if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
    return numberToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numberToWords(n % 10000000) : '');
  };
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = `${numberToWords(rupees)} Rupees`;
  if (paise) {
    words += ` and ${numberToWords(paise)} Paise`;
  }
  return `${words} Only`;
};

const BulkPaymentVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printAreaRef = useRef();

  // Stores
  const bulkPayments = useBulkPaymentStore((state) => state.bulkPayments);
  const isHydrated = useBulkPaymentStore((state) => state.isHydrated);
  const { purchaseTransactions } = usePurchaseTransactionStore();
  const vendors = useVendorStore((state) => state.vendors);

  // Memoized data to fix the conditional hook issue
  const selectedPayment = useMemo(() => bulkPayments.find((p) => p.id === id), [id, bulkPayments]);
  const vendor = useMemo(() => {
    return selectedPayment ? vendors.find((v) => v.name === selectedPayment.vendorName) : null;
  }, [selectedPayment, vendors]);

  const allPaidItems = useMemo(() => {
    if (!selectedPayment) return [];
    return selectedPayment.paidBillsDetails.flatMap((paidBill) => {
      const bill = purchaseTransactions.find((t) => t.id === paidBill.billId);
      if (!bill || !bill.items) return [];

      return bill.items.map(item => ({
        ...item,
        grcNo: bill.id,
      }));
    });
  }, [selectedPayment, purchaseTransactions]);

  const totalBillsCount = selectedPayment?.paidBillsDetails?.length || 0;

  const totalBillsAmount = useMemo(() => {
    if (!selectedPayment) return 0;
    return selectedPayment.paidBillsDetails.reduce((sum, paidBill) => {
      const bill = purchaseTransactions.find((t) => t.id === paidBill.billId);
      if (!bill || !bill.totalAmount) {
        // Fallback calculation if totalAmount is missing
        return sum + (bill?.items?.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.purchaseRate || 0) * parseFloat(item.purchaseQuantity || 0)),
          0
        ) || 0);
      }
      return sum + parseFloat(bill.totalAmount || 0);
    }, 0);
  }, [selectedPayment, purchaseTransactions]);

  if (!isHydrated) {
    return <div className="p-4 text-center">Loading voucher details...</div>;
  }

  if (!selectedPayment) {
    return (
      <div className="p-4 text-center text-red-600">Voucher not found!</div>
    );
  }

  const { paymentDate, amountPaid, payMode, narration, Vid } = selectedPayment;
  const {
    name,
    addressLine1,
    addressLine2,
    state,
    pinCode,
    phoneNo1,
    gstinNo,
  } = vendor || {};

  const handleBackToPaymentForm = () => {
    navigate("/bulk-payment");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Buttons */}
      <div className="fixed top-4 right-4 z-50 print:hidden flex space-x-2">
        <button
          onClick={handleBackToPaymentForm}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Print
        </button>
      </div>

      {/* Voucher Area */}
      <div
        id="voucher-print-area"
        ref={printAreaRef}
        className="w-full max-w-4xl mx-auto bg-white p-8 rounded shadow print:shadow-none"
      >
        <header
          className="text-white text-center py-2 rounded-sm mb-3"
          style={{ background: "#0f766e" }}
        >
          <h2 className="text-lg font-semibold tracking-wide">
            BULK PAYMENT VOUCHER
          </h2>
        </header>

        {/* Company & Vendor Info */}
        <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-300 py-2 mb-3">
          {/* Left Side - Company Details */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-1">COMPANY DETAILS:</h3>
            <p><strong>NINJAPLUS PHARMA PRIVATE LIMITED</strong></p>
            <p>153F S.M. Bose Road, Agarpara</p>
            <p>Kolkata, West Bengal - 700114</p>
            <p>Phone: +91-XXXXXXXXXX</p>
            <p>GSTIN: 19AAHCN9839Q1Z9</p>
          </div>

          {/* Right Side - Vendor Details */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-1">VENDOR DETAILS:</h3>
            <p><strong>Vendor Name:</strong> {safe(name)}</p>
            <p><strong>Address:</strong> {safe(addressLine1)} {safe(addressLine2)}, {safe(state)} - {safe(pinCode)}</p>
            <p><strong>Phone No:</strong> {safe(phoneNo1)}</p>
            <p><strong>GSTIN No:</strong> {safe(gstinNo)}</p>
          </div>
        </div>

        {/* Payment Details */}
        <section className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="space-y-1">
            <p><strong>VOUCHER No:</strong> {safe(Vid)}</p>
            <p><strong>Bills Paid:</strong> {totalBillsCount}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><strong>Payment Date:</strong> {safe(paymentDate)}</p>
            <p><strong>Payment Mode:</strong> {safe(payMode)}</p>
          </div>
        </section>

        {/* Combined Items Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">S.No</th>
                <th className="border px-2 py-1 text-left">GRC No.</th>
                <th className="border px-2 py-1 text-left">Item Description</th>
                <th className="border px-2 py-1 text-left">HSN</th>
                <th className="border px-2 py-1 text-center">Batch No</th>
                <th className="border px-2 py-1 text-center">Exp Date</th>
                <th className="border px-2 py-1 text-right">Qty</th>
                <th className="border px-2 py-1 text-right">Unit Price</th>
                <th className="border px-2 py-1 text-right">GST</th>
                <th className="border px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allPaidItems.map((item, index) => (
                <tr key={`${item.grcNo}-${index}`}>
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">{safe(item.grcNo)}</td>
                  <td className="border px-2 py-1">{safe(item.nameOfItemMedicine)}</td>
                  <td className="border px-2 py-1">{safe(item.hsnSac)}</td>
                  <td className="border px-2 py-1 text-center">{safe(item.batchSrlNo)}</td>
                  <td className="border px-2 py-1 text-center">{safe(item.expDate)}</td>
                  <td className="border px-2 py-1 text-right">{safe(item.purchaseQuantity)}</td>
                  <td className="border px-2 py-1 text-right">₹{formatAmount(item.purchaseRate)}</td>
                  <td className="border px-2 py-1 text-right">₹{formatAmount(item.gstIgst)}%</td>
                  <td className="border px-2 py-1 text-right">₹{formatAmount(parseFloat(item.purchaseQuantity || 0) * parseFloat(item.purchaseRate || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-4">
          <div className="w-1/2 text-sm border border-gray-300 p-3">
            <div className="flex justify-between mb-1">
              <span>Total Bills Amount:</span>
              <span>₹{formatAmount(totalBillsAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>Paid Now:</span>
              <span>₹{formatAmount(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1 mt-1 text-red-600">
              <span>Due Amount:</span>
              <span>
                ₹
                {formatAmount(
                  totalBillsAmount - amountPaid
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in words & Narration */}
        <div className="text-sm mb-4">
          <p><strong>Amount In Words:</strong> {amountInWords(amountPaid)}</p>
          <p className="mt-2"><strong>Reference / Narration:</strong> {safe(narration)}</p>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 flex justify-between text-sm">
          <div className="text-center">
            <p className="border-t border-gray-500 pt-1">Authorized By</p>
          </div>
          <div className="text-center">
            <p className="border-t border-gray-500 pt-1">Vendor Signature</p>
          </div>
        </footer>
      </div>

      {/* Print CSS */}
      <style>{`
        @page { size: A4; margin: 5mm; }
        @media print {
          body * { visibility: hidden; }
          #voucher-print-area, #voucher-print-area * { visibility: visible; }
          #voucher-print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default BulkPaymentVoucher;