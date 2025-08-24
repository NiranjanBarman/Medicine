import React, { useMemo, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import JsBarcode from "jsbarcode";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useVendorStore from "../store/vendorStore";

const fmt = (n) => (Number.isFinite(+n) ? (+n).toFixed(2) : "0.00");
const safe = (v, d = "—") =>
  v === null || v === undefined || v === "" ? d : v;

const PrintPurchase = () => {
  const { purchaseId } = useParams();

  // PURCHASE
  const { purchaseTransactions = [] } = usePurchaseTransactionStore();
  const purchase = useMemo(
    () => purchaseTransactions.find((p) => p.id === purchaseId),
    [purchaseTransactions, purchaseId]
  );

  // VENDOR
  const { vendors = [] } = useVendorStore();
  const vendor =
    vendors.find((v) => v.id === purchase?.vendorId) ||
    vendors.find(
      (v) =>
        v.name?.trim().toLowerCase() ===
        (purchase?.vendorName || "").trim().toLowerCase()
    ) ||
    null;

  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && purchase?.id) {
      JsBarcode(barcodeRef.current, purchase.id, {
        format: "CODE128",
        lineColor: "#000",
        width: 1.2,
        height: 28,
        displayValue: false,
        margin: 0,
      });
    }
  }, [purchase?.id]);

  if (!purchase) {
    return <div className="p-6 text-center">Purchase not found.</div>;
  }

  const {
    date,
    vendorName,
    billNo,
    billDate,
    challanNo,
    grcType,
    remarks,
    items = [],
  } = purchase;

  // Build table rows and calculate the raw amount (qty * rate) for each
  const rows = items.map((i) => {
    const qty = parseFloat(i.actualBillableQty || i.cfQty || 0);
    const rate = parseFloat(i.purchaseRate || 0);
    const discPct = parseFloat(i.disc || 0);
    const gstPct = parseFloat(i.gstIgst || 0);
    const hsnSac = i.hsnSac || i.sacCode || "—";

    // Calculate amounts before and after discounts and GST
    const amountBeforeTax = qty * rate;
    const discAmt = amountBeforeTax * (discPct / 100);
    const amountAfterDisc = amountBeforeTax - discAmt;
    const gstAmt = amountAfterDisc * (gstPct / 100);
    const finalLineItemTotal = amountAfterDisc + gstAmt;

    return {
      desc: `${safe(i.nameOfItemMedicine, "Item")}${
        i.formulation ? ` (${i.formulation})` : ""
      }`,
      batch: safe(i.batchSrlNo),
      gstPct,
      exp: safe(i.expDate),
      qty,
      rate,
      amountBeforeTax,
      discAmt,
      gstAmt,
      finalLineItemTotal,
      hsnSac,
    };
  });

  // Calculate the final totals by summing up all the line item amounts
  const orderTotal = rows.reduce((s, r) => s + r.amountBeforeTax, 0);
  const totalDiscount = rows.reduce((s, r) => s + r.discAmt, 0);
  const totalGST = rows.reduce((s, r) => s + r.gstAmt, 0);
  // const freight = 0;
  const subTotal = orderTotal + totalDiscount - totalGST;

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <button
        onClick={() => window.print()}
        className="fixed top-4 right-4 z-50 px-6 py-3 bg-blue-600 text-white rounded-lg shadow print:hidden"
      >
        Print
      </button>

      <div
        id="po-print-area"
        className="mx-auto print:shadow-none"
        style={{ width: "210mm", padding: "10mm" }}
      >
        {/* Top bar */}
        <div
          className="text-white text-center py-2 rounded-sm mb-3"
          style={{ background: "#6d6a39" }}
        >
          <h2 className="text-lg font-semibold tracking-wide">
            PURCHASE ORDER
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
              <strong>GRC NO:</strong> {safe(purchase.id?.substring(0, 8), "—")}
            </p>
            <p>
              <strong>PO Date:</strong> {safe(date)}
            </p>
            <div className="flex justify-end">
              <svg ref={barcodeRef} style={{ display: "block" }} />
            </div>
          </div>
        </div>

        {/* Purchase From / Ship To */}
        <div className="grid grid-cols-4 gap-4 text-xs border-y border-gray-300 py-2 mb-3">
          {/* Purchase From */}
          <div className="space-y-0.5 col-span-2 pr-4 border-r border-gray-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="font-semibold">PURCHASE FROM:</p>
                <p>
                  <strong>{safe(vendor?.name, vendorName)}</strong>
                </p>
                <p>
                  {safe(vendor?.addressLine1, "")}
                  {vendor?.addressLine2 ? `, ${vendor.addressLine2}` : ""}
                </p>
                <p>
                  {[vendor?.state, vendor?.pinCode]
                    .filter(Boolean)
                    .join(" - ") || "—"}
                </p>
                <p>Phone: {safe(vendor?.phoneNo1 || vendor?.phoneNo2)}</p>
              </div>
              <div className="space-y-0.5">
                <p>GSTIN: {safe(vendor?.gstinNo)}</p>
                <p>DL No.: {safe(vendor?.dlNo)}</p>
                <p>Mfg. Lic. No.: {safe(vendor?.mfgLicNo)}</p>
                <p>Contact: {safe(vendor?.contactPerson)}</p>
              </div>
            </div>
          </div>

          {/* Ship To */}
          <div className="col-span-2 pl-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="font-semibold">SHIP TO:</p>
                <p>
                  <strong>NINJAPLUS PHARMA PRIVATE LIMITED</strong>
                </p>
                <p>153F S.M. Bose Road, Agarpara</p>
              </div>
              <div className="space-y-0.5">
                <p>Kolkata, West Bengal - 700114</p>
                <p>Phone: +91-XXXXXXXXXX</p>
                <p>GSTIN: 19AAHCN9839Q1Z9</p>
                <p>Contact: Store Incharge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill info */}
        <div className="grid grid-cols-3 text-xs text-gray-800 mb-3">
          <div className="border border-gray-300 py-2 px-2">
            <div>
              <strong>Bill No:</strong> {safe(billNo)}
            </div>
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <div>
              <strong>Bill Date:</strong> {safe(billDate)}
            </div>
          </div>
          <div className="border border-gray-300 border-l-0 py-2 px-2">
            <div>
              <strong>Challan No:</strong> {safe(challanNo)}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-400">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Item Description</th>
                <th className="border px-2 py-1 text-center">HSN</th>
                <th className="border px-2 py-1 text-center">Exp Date</th>
                <th className="border px-2 py-1 text-center">Batch No</th>
                
                <th className="border px-2 py-1 text-right">Quantity</th>
                <th className="border px-2 py-1 text-right">Unit Price</th>
                <th className="border px-2 py-1 text-center">GST%</th>
                <th className="border px-2 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.desc}</td>
                  <td className="border px-2 py-1">{r.hsnSac}</td>
                  <td className="border px-2 py-1 text-center">
                    {safe(r.exp)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {safe(r.batch)}
                  </td>
                  
                  <td className="border px-2 py-1 text-right">{fmt(r.qty)}</td>
                  <td className="border px-2 py-1 text-right">
                    ₹{fmt(r.rate)}
                  </td>
                   <td className="border px-2 py-1 text-center">
                    {fmt(r.gstPct)}%
                  </td>
                  <td className="border px-2 py-1 text-right">
                    ₹{fmt(r.finalLineItemTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border border-gray-300 p-3 text-sm">
            <p className="font-semibold mb-6">Approved By:</p>
            <p>MR. JAYANTA</p>
          </div>
          <div className="border border-gray-300 p-3 text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>₹{fmt(subTotal)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Total Discount</span>
              <span>-₹{fmt(totalDiscount)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Sales Tax (GST)</span>
              <span>₹{fmt(totalGST)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>Order Total</span>
              <span>₹{fmt(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-3 text-xs">
          <p>
            <strong>Remarks:</strong> {safe(remarks)}
          </p>
          <p className="text-gray-500 mt-1">
            GRC Type: {safe(grcType)} • This is a system-generated purchase
            order.
          </p>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @page { size: A4; margin: 5mm; }
        @media print {
          body * { visibility: hidden; }
          #po-print-area, #po-print-area * { visibility: visible; }
          #po-print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintPurchase;
