// src/forms/GRCWisePaymentForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';
import useGRCPaymentStore from '../store/grcPaymentStore';
import useBulkPaymentStore from '../store/bulkPaymentStore';
import useVendorStore from '../store/vendorStore';

const safeParseFloat = (value) => parseFloat(value || 0) || 0;

const GRCWisePaymentForm = () => {
    const navigate = useNavigate();

    const { purchaseTransactions } = usePurchaseTransactionStore();
    // Fetch all payments from both stores for accurate due amount calculation
    const { grcPayments, addGRCPayment } = useGRCPaymentStore();
    const { bulkPayments } = useBulkPaymentStore();
    const { vendors } = useVendorStore();

    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [vendorId, setVendorId] = useState('');
    const [selectedGRCId, setSelectedGRCId] = useState('');
    const [currentGRCDetails, setCurrentGRCDetails] = useState(null);
    const [payNow, setPayNow] = useState('');
    const [payMode, setPayMode] = useState('Cash');
    const [narration, setNarration] = useState('');

    const grcInvoices = useMemo(() => {
        // This calculates the due amount by checking payments from both GRC and Bulk stores.
        // It processes every GRC purchase transaction.
        return purchaseTransactions.filter(p => p.grcType === 'GRC' || p.grcType === 'CREDIT').map(grc => {
            const netAmount = safeParseFloat(grc.items?.reduce((sum, item) => sum + (safeParseFloat(item.actualBillableQty) * safeParseFloat(item.purchaseRate)), 0));
            
            // Consolidate payments from both stores for this specific GRC
            const paymentsForThisGRC = [
                ...grcPayments.filter(payment => payment.grcInvoiceId === grc.id),
                ...bulkPayments.reduce((acc, bulkPayment) => {
                    const billPayment = bulkPayment.paidBillsDetails?.find(d => d.billId === grc.id);
                    if (billPayment) {
                        acc.push({ ...bulkPayment, amountPaid: billPayment.amountPaid });
                    }
                    return acc;
                }, [])
            ];
            
            const previouslyPaidAdjusted = safeParseFloat(paymentsForThisGRC.reduce((sum, payment) => sum + safeParseFloat(payment.amountPaid), 0));
            const dueAmount = netAmount - previouslyPaidAdjusted;
            const status = dueAmount <= 0.01 ? 'Paid' : (previouslyPaidAdjusted > 0 ? 'Partially Paid' : 'Due');
            
            return { ...grc, netAmount, previouslyPaidAdjusted, dueAmount, status };
        });
    }, [purchaseTransactions, grcPayments, bulkPayments]);

    const filteredGRCInvoices = useMemo(() => {
        const vendorName = vendors.find(v => v.id === vendorId)?.name;
        if (!vendorName) return [];
        return grcInvoices.filter(grc =>
            // This is the core logic that filters by vendor and status
            grc.vendorName?.toLowerCase() === vendorName.toLowerCase() &&
            (grc.status === 'Due' || grc.status === 'Partially Paid')
        );
    }, [vendorId, grcInvoices, vendors]);

    useEffect(() => {
        const grc = filteredGRCInvoices.find(g => g.id === selectedGRCId);
        setCurrentGRCDetails(grc);
        if (grc) {
            setPayNow(grc.dueAmount > 0 ? grc.dueAmount.toFixed(2) : '');
        } else {
            setPayNow('');
        }
    }, [selectedGRCId, filteredGRCInvoices]);

    const handlePayment = (e) => {
        e.preventDefault();

        const vendorName = vendors.find(v => v.id === vendorId)?.name;
        if (!vendorId || !selectedGRCId || !payNow || safeParseFloat(payNow) <= 0) {
            alert('Please select a Vendor, GRC Invoice, and enter a valid amount to pay.');
            return;
        }

        const paymentAmount = safeParseFloat(payNow);
        if (currentGRCDetails && paymentAmount >= currentGRCDetails.dueAmount) {
            alert(`Payment amount (₹${paymentAmount.toFixed(2)}) cannot exceed the Due Amount of (₹${currentGRCDetails.dueAmount.toFixed(2)}). Please enter a valid amount.`);
            return;
        }
        
        // utils/generateVoucherId.js
        const generateVoucherId = () => {
            const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit
            return `V${randomNum}`;
        };

        const newGRCPayment = {
            id: 'PV-' + Date.now(),
            date,
            Vid: generateVoucherId(),
            vendorId,
            vendorName,
            grcInvoiceId: selectedGRCId,
            gcrId: selectedGRCId,
            grcInvoiceNo: currentGRCDetails.billNo,
            amountPaid: paymentAmount,
            payMode,
            narration,
            reference: narration,
            savedAt: new Date().toISOString(),
        };

        addGRCPayment(newGRCPayment);
        
        navigate(`/print-payment-voucher/${newGRCPayment.id}`);
    };

    const handleReset = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setVendorId('');
        setSelectedGRCId('');
        setCurrentGRCDetails(null);
        setPayNow('');
        setPayMode('Cash');
        setNarration('');
    };

    const handleViewHistory = () => {
        navigate('/grc-payment-history');
    };

    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">GRC WISE PAYMENT DETAILS</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Business Currency is : <span className="font-semibold">₹</span></span>
                    <button
                        type="button"
                        onClick={handleViewHistory}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Payment History
                    </button>
                </div>
            </div>

            <fieldset className="border border-gray-300 p-3 rounded-md mb-4">
                <legend className="text-teal-700 font-semibold px-2">PAYMENT & AMOUNT INFORMATION</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="date" className={labelClass}>Date {requiredSpan}</label>
                        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="vendorName" className={labelClass}>Name of Vendor {requiredSpan}</label>
                        <select
                            id="vendorName"
                            value={vendorId}
                            onChange={(e) => {
                                setVendorId(e.target.value);
                                setSelectedGRCId('');
                                setCurrentGRCDetails(null);
                            }}
                            className={inputClass}
                            required
                        >
                            <option value="">-- Select Vendor --</option>
                            {vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="grcInvoiceNo" className={labelClass}>GRC Invoice No. {requiredSpan}</label>
                        <select
                            id="grcInvoiceNo"
                            value={selectedGRCId}
                            onChange={(e) => setSelectedGRCId(e.target.value)}
                            className={inputClass}
                            disabled={!vendorId || filteredGRCInvoices.length === 0}
                            required
                        >
                            <option value="">-- Select GRC Invoice --</option>
                            {filteredGRCInvoices.length > 0 ? (
                                filteredGRCInvoices.map((grc) => (
                                    <option key={grc.id} value={grc.id}>
                                        {grc.id} (Due: ₹{grc.dueAmount.toFixed(2)})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No due/partially paid GRCs for this vendor</option>
                            )}
                        </select>
                    </div>
                </div>
            </fieldset>

            {currentGRCDetails && (
                <div className="bg-gray-50 p-3 rounded-md shadow-inner mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Selected GRC Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Net Amount:</span>
                            <span className="text-gray-900 font-semibold">₹{currentGRCDetails.netAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Previously Paid:</span>
                            <span className="text-gray-900 font-semibold">₹{currentGRCDetails.previouslyPaidAdjusted.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">Due Amount:</span>
                            <span className="text-red-600 font-bold text-lg">₹{currentGRCDetails.dueAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600">GRC Status:</span>
                            <span className={`font-bold ${currentGRCDetails.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                {currentGRCDetails.status}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <fieldset className="border border-gray-300 p-3 rounded-md mb-4">
                <legend className="text-teal-700 font-semibold px-2">PAYMENT DETAILS</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="payNow" className={labelClass}>Pay Now {requiredSpan}</label>
                        <input
                            type="number"
                            id="payNow"
                            value={payNow}
                            onChange={(e) => setPayNow(e.target.value)}
                            className={inputClass}
                            placeholder="Enter amount to pay"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="payMode" className={labelClass}>Payment Mode</label>
                        <select id="payMode" value={payMode} onChange={(e) => setPayMode(e.target.value)} className={inputClass}>
                            <option>Cash</option>
                            <option>Bank</option>
                            <option>Cheque</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="narration" className={labelClass}>Narration / Reference</label>
                        <textarea
                            id="narration"
                            rows="2"
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            className={inputClass}
                            placeholder="Enter any notes or reference number..."
                        ></textarea>
                    </div>
                </div>
            </fieldset>

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition-colors duration-200"
                >
                    Reset
                </button>
                <button
                    type="submit"
                    onClick={handlePayment}
                    className="px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors duration-200"
                >
                    SAVE PAYMENT
                </button>
            </div>
        </div>
    );
};

export default GRCWisePaymentForm;