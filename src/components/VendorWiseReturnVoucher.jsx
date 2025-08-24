// src/components/VendorWiseReturnVoucher.jsx
import React, { useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import JsBarcode from "jsbarcode";
import useVendorStore from "../store/vendorStore";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";

const fmt = (n) => (Number.isFinite(+n) ? (+n).toFixed(2) : "0.00");
const safe = (v, d = "—") =>
  v === null || v === undefined || v === "" ? d : v;

const VendorWiseReturnVoucher = () => {
  const location = useLocation();
  // const navigate = useNavigate();

  const { vendors = [] } = useVendorStore();
  const { purchaseTransactions = [] } = usePurchaseTransactionStore();

  const returnDocument = useMemo(
    () => location.state?.returnDocument,
    [location.state]
  );
  const vendorDetails = useMemo(() => {
    if (!returnDocument) return null;
    return (
      vendors.find(
        (v) => v.name?.toLowerCase() === returnDocument.vendorName?.toLowerCase()
      ) || null
    );
  }, [vendors, returnDocument]);

  const purchase = useMemo(() => {
    if (!returnDocument) return null;
    return (
      purchaseTransactions.find((p) => p.id === returnDocument.purchaseId) ||
      purchaseTransactions.find((p) => p.billNo === returnDocument.billNo) ||
      null
    );
  }, [purchaseTransactions, returnDocument]);

  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        // FIXED BARCODE STRING
        JsBarcode(barcodeRef.current, "VOUCHER-RETURN-2024", {
          format: "CODE128",
          lineColor: "#000",
          width: .8,
          height: 20,
          displayValue: false,
          margin: 0,
        });
      } catch (e) {
        console.error("Error generating barcode:", e);
      }
    }
  }, []); // Empty dependency array ensures it runs only once

  if (!returnDocument) {
    return (
      <div className="p-6 text-center text-gray-600">
        Return document not found.
      </div>
    );
  }

  const rows = (returnDocument.items || []).map((i) => {
    const qty = parseFloat(i.returnQty || 0);
    const rate = parseFloat(i.actRate || i.purchaseRate || 0);
    const discPct = parseFloat(i.disc || 0);
    const gstPct = parseFloat(i.gstIgst || 0);
    const hsnSac = i.hsnSac || i.sacCode || i.hsnCode || "—";

    let amountBeforeTax = qty * rate;
    if (discPct > 0) amountBeforeTax -= amountBeforeTax * (discPct / 100);
    const gstAmt = gstPct > 0 ? amountBeforeTax * (gstPct / 100) : 0;
    const amount = amountBeforeTax + gstAmt;

    return {
      desc: `${safe(i.nameOfItemMedicine, "Item")}${
        i.formulation ? ` (${i.formulation})` : ""
      }`,
      manufacturer: safe(i.itemManufacturerMake || i.manufacturer || i.companyName),
      batch: safe(i.batchSrlNo),
      gstPct,
      exp: safe(i.expDate),
      qty,
      rate,
      discPct,
      hsnSac,
      amountBeforeTax,
      gstAmt,
      amount,
    };
  });

  const subtotal = rows.reduce((s, r) => s + r.amountBeforeTax, 0);
  const totalGST = rows.reduce((s, r) => s + r.gstAmt, 0);
  const orderTotal = subtotal + totalGST;

  const grcNo = safe(returnDocument.id || purchase?.id);

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 px-6 py-3 bg-blue-600 text-white rounded-lg shadow print:hidden"
      >
        Print
      </button>

      <div
        id="return-print-area"
        className="mx-auto bg-white p-6 rounded shadow print:shadow-none"
        style={{ width: "210mm", padding: "10mm" }}
      >
        {/* Header */}
        <div
          className="text-white text-center py-2 rounded-sm mb-3"
          style={{ background: "#0f766e" }}
        >
          <h2 className="text-lg font-semibold tracking-wide">
            PURCHASE RETURN VOUCHER
          </h2>
        </div>

        {/* Company / GRC meta */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
          <div className="space-y-1">
            <p>
              <strong>Company:</strong> NINJAPLUS PHARMA PRIVATE LIMITED
            </p>
            <p>153F S.M. Bose Road, Agarpara</p>
            <p>Kolkata, West Bengal - 700114</p>
          </div>
          <div className="space-y-1 text-right">
            <p>
              <strong>Voucher No:</strong> {safe(returnDocument.documentId)}
            </p>
            <p>
              <strong>Return Date:</strong> {safe(returnDocument.returnDate)}
            </p>
            <p>
              <strong>GRC No:</strong> {grcNo}
            </p>
            <div className="flex justify-end mt-1">
              <svg ref={barcodeRef} style={{ display: "block" }} />
            </div>
          </div>
        </div>

        {/* Vendor & Company Info */}
        <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-300 py-2 mb-3">
          <div className="col-span-1">
            <p className="font-semibold mb-1">VENDOR DETAILS:</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
              <p>
                <strong>{safe(vendorDetails?.name, returnDocument.vendorName)}</strong>
              </p>
              <p>GSTIN: {safe(vendorDetails?.gstinNo, "—")}</p>
              <p>
                {safe(vendorDetails?.addressLine1, "")}{" "}
                {vendorDetails?.addressLine2 || ""}
              </p>
              <p>DL No.: {safe(vendorDetails?.dlNo, "—")}</p>
              <p>
                {[vendorDetails?.state, vendorDetails?.pinCode]
                  .filter(Boolean)
                  .join(" - ") || "—"}
              </p>
              <p>Mfg. Lic. No.: {safe(vendorDetails?.mfgLicNo, "—")}</p>
              <p>Phone: {safe(vendorDetails?.phoneNo1 || vendorDetails?.phoneNo2)}</p>
              <p>Contact: {safe(vendorDetails?.contactPerson, "—")}</p>
            </div>
          </div>

          <div className="col-span-1">
            <p className="font-semibold mb-1">RETURN FROM:</p>
            <p>
              <strong>NINJAPLUS PHARMA PRIVATE LIMITED</strong>
            </p>
            <p>153F S.M. Bose Road, Agarpara</p>
            <p>Kolkata, West Bengal - 700114</p>
            <p>Phone: +91-XXXXXXXXXX</p>
            <p>GSTIN: 19AAHCN9839Q1Z9</p>
          </div>
        </div>

        {/* Bill info band */}
        <div className="grid grid-cols-3 text-xs text-gray-800 mb-3">
          <div className="border border-gray-300 py-2 px-2">
            <strong>Original Bill No:</strong> {safe(returnDocument.billNo)}
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <strong>Original Bill Date:</strong> {safe(returnDocument.billDate)}
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <strong>GRC No:</strong> {grcNo}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Item</th>
                {/* <th className="border px-2 py-1 text-left">Manufacturer</th> */}
                <th className="border px-2 py-1 text-center">HSN</th>
                <th className="border px-2 py-1 text-center">Exp</th>
                <th className="border px-2 py-1 text-center">Batch</th>
                
                
                <th className="border px-2 py-1 text-right">Qty</th>
                <th className="border px-2 py-1 text-right">Rate</th>
                <th className="border px-2 py-1 text-right">Disc%</th>
                <th className="border px-2 py-1 text-center">GST%</th>
                <th className="border px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.desc}</td>
                  {/* <td className="border px-2 py-1">{r.manufacturer}</td> */}
                  <td className="border px-2 py-1 text-center">{r.hsnSac}</td>
                  <td className="border px-2 py-1 text-center">{r.exp}</td>
                  <td className="border px-2 py-1 text-center">{r.batch}</td>
                  
                  
                  <td className="border px-2 py-1 text-right">{fmt(r.qty)}</td>
                  <td className="border px-2 py-1 text-right">₹{fmt(r.rate)}</td>
                  <td className="border px-2 py-1 text-right">
                    {fmt(r.discPct)}%
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {fmt(r.gstPct)}%
                  </td>
                  <td className="border px-2 py-1 text-right">₹{fmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Signature */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border border-gray-300 p-3 text-sm">
            <p className="font-semibold mb-6">Received By:</p>
            <p>_________________________</p>
            <p>Vendor Signature</p>
          </div>
          <div className="border border-gray-300 p-3 text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>₹{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>GST</span>
              <span>₹{fmt(totalGST)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>Total</span>
              <span>₹{fmt(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-3 text-xs">
          <p>
            <strong>Remarks:</strong> {safe(returnDocument.remarks)}
          </p>
          <p className="text-gray-500 mt-1">
            This is a system-generated purchase return voucher.
          </p>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @page { size: A4; margin: 5mm; }
        @media print {
          body * { visibility: hidden; }
          #return-print-area, #return-print-area * { visibility: visible; }
          #return-print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default VendorWiseReturnVoucher;