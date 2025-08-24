// src/components/PrintPaymentVoucher.jsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';

import useGRCPaymentStore from '../store/grcPaymentStore';
import useVendorStore from '../store/vendorStore';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';

// Utility functions
const fmt = (n) => (Number.isFinite(+n) ? (+n).toFixed(2) : "0.00");
const safe = (v, d = "—") => v === null || v === undefined || v === "" ? d : v;

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

// Barcode Component
const Barcode = ({ value }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
                     format: "CODE128",
           lineColor: "#000",
           width: .8,
           height: 20,
           displayValue: false,
           margin: 0,
        });
      } catch (e) {
        console.error("Barcode generation failed:", e);
      }
    }
  }, [value]);

  return <svg ref={barcodeRef} style={{ width: '100%', height: 'auto' }}></svg>;
};

const PrintPaymentVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const getGRCPaymentById = useGRCPaymentStore((state) => state.getGRCPaymentById);
  const vendors = useVendorStore((state) => state.vendors);
  const { purchaseTransactions } = usePurchaseTransactionStore();

  const payment = useMemo(() => getGRCPaymentById(id), [id, getGRCPaymentById]);
  const vendor = useMemo(() => {
    return payment ? vendors.find((v) => v.name === payment.vendorName) : null;
  }, [payment, vendors]);
  const grcDetails = useMemo(() => {
    return payment ? purchaseTransactions.find((t) => t.id === payment.grcInvoiceId) : null;
  }, [payment, purchaseTransactions]);

  const { date, amountPaid, payMode, narration, Vid } = payment || {};
  const { name, addressLine1, addressLine2, state, pinCode, phoneNo1, gstinNo } = vendor || {};

  const rows = useMemo(() => {
    return (grcDetails?.items || []).map((i, idx) => {
      const qty = parseFloat(i.actualBillableQty || 0);
      const rate = parseFloat(i.purchaseRate || 0);
      const amount = qty * rate;
      return {
        sNo: idx + 1,
        desc: safe(i.nameOfItemMedicine, "Item"),
        hsn: safe(i.hsnSac || i.hsnCode),
        batch: safe(i.batchSrlNo),
        gstPct: safe(i.gstIgst),
        exp: safe(i.expDate),
        qty,
        rate,
        amount,
      };
    });
  }, [grcDetails]);

  const calculatedAmounts = useMemo(() => {
    let netAmount = 0;
    let previouslyPaid = 0;
    let dueAmount = 0;

    if (grcDetails) {
      netAmount = grcDetails.items?.reduce(
        (sum, item) => sum + (parseFloat(item.actualBillableQty || 0) * parseFloat(item.purchaseRate || 0)),
        0
      ) || 0;

      const allPayments = useGRCPaymentStore.getState().grcPayments.filter(
        (p) => p.grcInvoiceId === grcDetails.id
      );
      previouslyPaid = allPayments.reduce((sum, p) => sum + (parseFloat(p.amountPaid) || 0), 0) - (parseFloat(amountPaid) || 0);

      dueAmount = netAmount - (previouslyPaid + (parseFloat(amountPaid) || 0));
    }
    return { netAmount, previouslyPaid, dueAmount };
  }, [grcDetails, amountPaid]);

  const { netAmount, previouslyPaid, dueAmount } = calculatedAmounts;

  const handleBackToPaymentForm = () => {
    navigate('/grc-payment');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!payment || !vendor || !grcDetails) {
    return <div className="p-4 text-center">Loading voucher details...</div>;
  }

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
        className="mx-auto bg-white p-6 rounded shadow print:shadow-none"
        style={{ width: "210mm", padding: "10mm" }}
      >
        {/* Header */}
        <header
          className="text-white text-center py-2 rounded-sm mb-3"
          style={{ background: "#0f766e" }}
        >
          <h2 className="text-lg font-semibold tracking-wide">
            GCR PAYMENT VOUCHER
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

        {/* Voucher, Barcode, and Payment Details in one row */}
        <section className="grid grid-cols-3 gap-4 items-center text-sm mb-4">
          {/* Left Column: Voucher & GRC Details */}
          <div className="space-y-1">
            <p><strong>VOUCHER No:</strong> {safe(Vid)}</p>
            <p><strong>GRC No:</strong> {safe(grcDetails.id)}</p>
            <p><strong>GRC Bill No:</strong> {safe(grcDetails.billNo)}</p>
          </div>
          
          {/* Middle Column: Barcode */}
          <div className="flex justify-center">
            {grcDetails.id && <Barcode value={grcDetails.id} />}
          </div>
          
          {/* Right Column: Payment Details */}
          <div className="space-y-1 text-right">
            <p><strong>Payment Date:</strong> {safe(date)}</p>
            <p><strong>Payment Mode:</strong> {safe(payMode)}</p>
          </div>
        </section>

        {/* Items Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">S.No</th>
                <th className="border px-2 py-1 text-left">Item Description</th>
                <th className="border px-2 py-1 text-center">HSN</th>
                <th className="border px-2 py-1 text-center">Exp Date</th>
                <th className="border px-2 py-1 text-center">Batch No</th>
                
                
                <th className="border px-2 py-1 text-right">Qty</th>
                <th className="border px-2 py-1 text-right">Unit Price</th>
                <th className="border px-2 py-1 text-center">GST%</th>
                <th className="border px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.sNo}</td>
                  <td className="border px-2 py-1">{r.desc}</td>
                  <td className="border px-2 py-1 text-center">{r.hsn}</td>
                  <td className="border px-2 py-1 text-center">{r.exp}</td>
                  <td className="border px-2 py-1 text-center">{r.batch}</td>
                  <td className="border px-2 py-1 text-right">{fmt(r.qty)}</td>
                  <td className="border px-2 py-1 text-right">₹{fmt(r.rate)}</td>
                  <td className="border px-2 py-1 text-center">{safe(r.gstPct)}%</td>
                  <td className="border px-2 py-1 text-right">₹{fmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-4">
          <div className="w-1/2 text-sm border border-gray-300 p-3">
            <div className="flex justify-between mb-1">
              <span>Net Amount:</span>
              <span>₹{fmt(netAmount)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Previously Paid:</span>
              <span>₹{fmt(previouslyPaid)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>Paid Now:</span>
              <span>₹{fmt(amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1 mt-1 text-red-600">
              <span>Due Amount:</span>
              <span>₹{fmt(dueAmount)}</span>
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

export default PrintPaymentVoucher;