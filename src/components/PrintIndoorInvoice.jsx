// src/components/PrintIndoorInvoice.jsx
import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useIndoorSaleStore from '../store/useIndoorSaleStore';
import JsBarcode from 'jsbarcode';

// Helper functions (same as in PrintInvoice.jsx)
const formatAmount = (amount) => typeof amount === 'number' ? amount.toFixed(2) : (0).toFixed(2);
const formatDate = (isoString) => new Date(isoString).toLocaleDateString('en-IN');

const amountInWords = (amount) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
        "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const numberToWords = (n) => {
        if (n === 0) return "";
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numberToWords(n % 100) : "");
        if (n < 100000) return numberToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numberToWords(n % 1000) : "");
        if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numberToWords(n % 100000) : "");
        return numberToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numberToWords(n % 10000000) : "");
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    const rupeesWords = numberToWords(rupees).trim();
    const paiseWords = numberToWords(paise).trim();

    if (rupeesWords) {
        return `${rupeesWords} Rupees${paiseWords ? ` and ${paiseWords} Paise` : ''} Only`;
    }
    return `Zero Rupees Only`;
};

const PrintIndoorInvoice = () => {
    const { id } = useParams();
    const getIndoorSaleById = useIndoorSaleStore(state => state.getIndoorSaleById);
    const sale = getIndoorSaleById(id);
    const navigate = useNavigate();

    const barcodeRef = useRef();

    useEffect(() => {
        if (barcodeRef.current && sale?.items?.[0]?.barcode) {
            JsBarcode(barcodeRef.current, sale.items[0].barcode, {
                 format: "CODE128",
           lineColor: "#000",
           width: .8,
           height: 20,
           displayValue: false,
           margin: 0,
            });
        }
    }, [sale]);

    if (!sale) return <div className="p-4 text-center">Loading bill details...</div>;

    const { billNo, doctorName, amountPaid, patientName, customerName, address, items = [], netAmount = 0, saleDate } = sale;
    const orderId = `ORD-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const dueAmount = (netAmount - amountPaid) > 0 ? (netAmount - amountPaid) : 0;
    const totalMrp = items.reduce((sum, item) => {
        const qty = item.stripQty || item.cfQty;
        const mrp = parseFloat(item.mrp) || 0;
        return sum + qty * mrp;
    }, 0);

    const taxableAmount = items.reduce((sum, item) => {
        const qty = item.stripQty || item.cfQty;
        const mrp = parseFloat(item.mrp) || 0;
        const gst = parseFloat(item.gstIgst) || 0;
        const total = qty * mrp;
        const taxable = total / (1 + gst / 100);
        return sum + taxable;
    }, 0);

    const gstAmount = totalMrp - taxableAmount;
    const sgst = gstAmount / 2;
    const cgst = gstAmount / 2;

    const totalDiscountAmount = items.reduce((sum, item) => {
        const qty = item.stripQty || item.cfQty;
        const mrp = parseFloat(item.mrp) || 0;
        const discount = parseFloat(item.discountPercent) || 0;
        return sum + ((mrp * discount / 100) * qty);
    }, 0);

    // Calculate total bulk discount applied (if available)
    const bulkDiscountApplied = sale.bulkDiscountApplied || 0;
    const finalTotal = (netAmount - bulkDiscountApplied) > 0 ? (netAmount - bulkDiscountApplied) : 0;

    return (
        <div className="bg-white min-h-screen">
            {/* Control buttons are made smaller and have less padding */}
           <div className="fixed top-4 right-4 z-50 print:hidden">
                <button 
                    onClick={() => navigate('/indoor-sales-list')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg mr-2"
                >
                    Back to List
                </button>
                <button 
                    onClick={() => navigate('/indoor-sale')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg mr-2"
                >
                    Back to Sale
                </button>
                <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg">
                    Print 
                </button>
            </div>
            {/* Main invoice area with reduced margins and padding */}
            <div id="invoice-print-area" className="w-full max-w-2xl mx-auto p-4 border border-gray-300 print:shadow-none bg-white text-xs">
                {/* Header reduced in size */}
                <header className="flex justify-between mb-1">
                    <div>
                        <h1 className="text-xl font-bold">Tax Invoice (Indoor)</h1>
                        <p>POS: 19-West Bengal</p>
                        <p>BILL NO.: <strong>{billNo}</strong></p>
                        <p>Order ID: <strong>{orderId}</strong></p>
                    </div>
                    <div className="text-right">
                        <p>Order Date: <strong>{formatDate(saleDate)}</strong></p>
                        <p>BILL Date: <strong>{formatDate(saleDate)}</strong></p>
                        <svg ref={barcodeRef} className="mt-1" />
                    </div>
                </header>

                {/* Info sections compacted */}
                <div className="grid grid-cols-2 gap-4 border-y py-2 text-xs mb-2">
                    <div>
                        <h2 className="font-bold uppercase">Sold By (Pharmacy)</h2>
                        <p>NINJAPLUS PHARMA PRIVATE LIMITED, 153F SM Bose Road, Agarpara, Kolkata - 700114</p>
                        <p>GSTIN: 19AAHCN9839Q1Z9, DL No.: WB/PGN/NBO/R/705502</p>
                    </div>
                    <div>
                        <h2 className="font-bold uppercase">Bill To / Ship To</h2>
                        <p>Paitent Name: <strong>{customerName || patientName}</strong></p>
                        <p>{address || "N/A"}</p>
                        <p>Doctor Name: <strong>{doctorName}</strong></p>
                    </div>
                </div>

                {/* Table padding reduced */}
                <table className="w-full border-collapse mb-2">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-1 border">ITEM NAME</th>
                            <th className="p-1 border">HSN</th>
                            <th className="p-1 border">EXP</th>
                            <th className="p-1 border">BATCH</th>
                            
                            <th className="p-1 border text-right">MRP</th>
                            
                            
                            
                            <th className="p-1 border text-right">QTY</th>
                            <th className="p-1 border text-right">UNIT PRICE</th>
                            <th className="p-1 border text-right">DIS%</th>
                            <th className="p-1 border text-right">GST%</th>
                            <th className="p-1 border text-right">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => {
                            const qty = item.stripQty || item.cfQty;
                            return (
                                <tr key={i}>
                                    <td className="p-1 border">{item.nameOfItemMedicine}</td>
                                    <td className="p-1 border">{item.hsnSac}</td>
                                    <td className="p-1 border">{item.expDate}</td>
                                    <td className="p-1 border">{item.batchSrlNo}</td>
                                    
                                    <td className="p-1 border text-right">₹{formatAmount(item.mrp)}</td>
                                    
                                    
                                    
                                    <td className="p-1 border text-right">{qty}</td>
                                    <td className="p-1 border text-right">₹{formatAmount(item.saleRateStrip-item.gstIgst)}</td>
                                    <td className="p-1 border text-right">{item.discountPercent || 0}%</td>
                                    <td className="p-1 border text-right">{item.gstIgst || 0}%</td>
                                    <td className="p-1 border text-right">₹{formatAmount(item.netAmount)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals section compacted and simplified */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <p>Taxable Amt: ₹{formatAmount(taxableAmount)}</p>
                        <p>SGST: ₹{formatAmount(sgst)}</p>
                        <p>CGST: ₹{formatAmount(cgst)}</p>
                    </div>
                    <div className="text-right">
                        <p>MRP Total: ₹{formatAmount(totalMrp)}</p>
                        <p>Total Discount: ₹{formatAmount(totalDiscountAmount)}</p>
                        <p>Overall Discount: ₹{formatAmount(bulkDiscountApplied)}</p>
                        <p>Total Invoice Amount: ₹{formatAmount(finalTotal)}</p>
                        <p>Total Paid Amount: ₹{formatAmount(amountPaid)}</p>
                        <p>Total Due Amount: ₹{formatAmount(dueAmount)}</p>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t">
                    <p className="font-semibold">Amount In Words: {amountInWords(netAmount)}</p>
                </div>

                {/* Footer margins reduced */}
                <footer className="mt-4 border-t pt-2 flex justify-between">
                    <div>
                        <p>Pharmacist: Arpan Kumar Das</p>
                        <p>PR No.: A-21413</p>
                    </div>
                    <div className="text-right">
                        <p>For NINJAPLUS PHARMA PRIVATE</p>
                        <p className="mt-4">Pharmacist Signature</p>
                    </div>
                </footer>
            </div>

            {/* Print CSS adjusted for A5 paper */}
<style jsx>{`
                @page {
                    size: A5;
                    margin: 5mm;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-print-area, #invoice-print-area * {
                        visibility: visible;
                    }
                    #invoice-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0 auto;
                        padding: 0;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintIndoorInvoice;
