import React, { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import useSaleReturnStore from "../store/saleReturnStore";

// Helper functions for formatting
const fmt = (n) => (Number.isFinite(+n) ? (+n).toFixed(2) : "0.00");
const safe = (v, d = "—") => (v === null || v === undefined || v === "" ? d : v);

const SaleReturnVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const saleReturns = useSaleReturnStore((state) => state.saleReturns);

  // Find return by ID
  const returnData = saleReturns.find((r) => String(r.id) === String(id));

  const barcodeRef = useRef(null);

  useEffect(() => {
    // Generate the barcode for the voucher ID
    if (barcodeRef.current && returnData?.id) {
      try {
        JsBarcode(barcodeRef.current, returnData.id, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.2,
          height: 28,
          displayValue: false,
          margin: 0,
        });
      } catch (e) {
        console.error("Barcode generation failed:", e);
      }
    }
  }, [returnData?.id]);

  if (!returnData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-600 text-xl font-bold">Return Voucher Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const item = returnData.returnedItem;

  return (
    <div className="bg-white min-h-screen p-4">
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-green-600 text-white rounded-lg shadow print:hidden"
      >
        Print
      </button>
      <div
        id="voucher-print-area"
        className="mx-auto print:shadow-none border border-gray-300"
        style={{ width: "210mm", padding: "10mm" }}
      >
        {/* Header with Company and Patient Info */}
        <div className="flex justify-between items-start mb-4">
          {/* Patient Details (Left) */}
          <div className="flex-1 text-sm border-r border-gray-300 pr-4">
            <h3 className="font-bold text-lg mb-1">PATIENT DETAILS</h3>
            <div className="grid grid-cols-2 gap-y-1">
              <span className="font-semibold">Patient Name:</span>
              <span>{safe(returnData.patientName)}</span>
              <span className="font-semibold">Address:</span>
              <span>{safe(returnData.patientAddress)}</span>
              <span className="font-semibold">Doctor:</span>
              <span>{safe(returnData.doctorName)}</span>
            </div>
          </div>

          {/* Company Details (Right) */}
          <div className="flex-1 text-sm pl-4 text-right">
            <h1 className="text-2xl font-bold text-blue-800 mb-1">PHARMACY NAME</h1>
            <p className="text-xs">153F S.M. Bose Road, Agarpara</p>
            <p className="text-xs">Kolkata, West Bengal - 700114</p>
            <p className="text-xs">
              <strong>GSTIN:</strong> 19AAHCN9839Q1Z9
            </p>
          </div>
        </div>

        <div className="border-b-2 border-gray-400 mb-4"></div>

        {/* Document Meta Information */}
        <div className="grid grid-cols-3 text-xs text-gray-800 mb-3">
          <div className="border border-gray-300 py-2 px-2">
            <div>
              <strong>Original Bill No:</strong> {safe(returnData.originalSaleBillNo)}
            </div>
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <div>
              <strong>Voucher Date:</strong> {safe(new Date(returnData.returnDate).toLocaleDateString())}
            </div>
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <div>
              <strong>Voucher No:</strong> {safe(String(returnData.id).slice(0, 8).toUpperCase())}
            </div>
          </div>
        </div>

        {/* Barcode */}
        {/* <div className="flex justify-center mb-4">
          <svg ref={barcodeRef} style={{ display: "block" }} />
        </div> */}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-400 border-separate border-spacing-0">
            <thead className="bg-blue-100">
              <tr>
                <th className="border-b border-r px-2 py-1 text-left">Item Description</th>
                <th className="border-b border-r px-2 py-1 text-center">HSN</th>
                <th className="border-b border-r px-2 py-1 text-center">EXP</th>
                <th className="border-b border-r px-2 py-1 text-center">Batch No</th>
                
                <th className="border-b border-r px-2 py-1 text-right">Qty</th>
                <th className="border-b border-r px-2 py-1 text-right">Rate</th>
                <th className="border-b border-r px-2 py-1 text-center">GST%</th>
                <th className="border-b px-2 py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-r px-2 py-1">{safe(item.nameOfItemMedicine)}</td>
                <td className="border-b border-r px-2 py-1 text-center">{safe(item.hsnSac)}</td>
                <td className="border-b border-r px-2 py-1 text-center">10/02/2026</td>
                <td className="border-b border-r px-2 py-1 text-center">{safe(item.batchSrlNo)}</td>
                <td className="border-b border-r px-2 py-1 text-right">{safe(item.returnQty)}</td>
                <td className="border-b border-r px-2 py-1 text-right">₹{fmt(item.rate)}</td>
                <td className="border-b border-r px-2 py-1 text-right">12%</td>
                <td className="border-b px-2 py-1 text-right">₹{fmt(item.netReturnAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals and Signatures */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border border-gray-300 p-3 text-sm">
            <p className="font-bold mb-4">Note:</p>
            <p className="text-xs">
              This voucher serves as a proof of sale return. The return amount has been credited to the customer. All returns are subject to the original sale conditions.
            </p>
          </div>
          <div className="border border-gray-300 p-3 text-sm">
            <div className="flex justify-between font-bold">
              <span>Total Return Amount:</span>
              <span>₹{fmt(returnData.totalReturnAmount)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs mt-8">
          <div className="text-center">
            <p className="border-t border-gray-400 pt-1 font-semibold">For The Company</p>
          </div>
          <div className="text-center">
            <p className="border-t border-gray-400 pt-1 font-semibold">Received By</p>
          </div>
        </div>
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

export default SaleReturnVoucher;