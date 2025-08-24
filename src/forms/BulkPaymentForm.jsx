import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';
import useBulkPaymentStore from '../store/bulkPaymentStore';

// Helper function to safely parse float values and handle potential undefined/null
const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

// New helper function to calculate a single bill's due amount
const calculateBillDueAmount = (bill, bulkPayments) => {
    // Calculate total amount for the bill
    let billTotal = safeParseFloat(bill.totalAmount);
    // If totalAmount is not available, calculate from items
    if (billTotal === 0 && bill.items && Array.isArray(bill.items)) {
        billTotal = bill.items.reduce(
            (sum, item) => sum + safeParseFloat(item.purchaseRate) * safeParseFloat(item.purchaseQuantity),
            0
        );
    }
    
    // Calculate total payments made for this specific bill
    const totalPaidForBill = bulkPayments.reduce((sum, payment) => {
        const detail = payment.paidBillsDetails?.find(d => d.billId === bill.id);
        return sum + (detail ? safeParseFloat(detail.amountPaid) : 0);
    }, 0);

    // Due amount is the difference
    return billTotal - totalPaidForBill;
};

const BulkPaymentForm = () => {
    const navigate = useNavigate();

    const {
        purchaseTransactions = [],
        updatePurchaseTransaction,
    } = usePurchaseTransactionStore();

    const {
        bulkPayments = [],
        addBulkPayment,
    } = useBulkPaymentStore();
    
    const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [vendorName, setVendorName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [billType, setBillType] = useState('All Bill');
    const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
    const [totalDue, setTotalDue] = useState(0);
    const [toBePaid, setToBePaid] = useState('');
    const [payMode, setPayMode] = useState('Cash');
    const [payNowAmount, setPayNowAmount] = useState('');
    const [narration, setNarration] = useState('');
    const [selectedBills, setSelectedBills] = useState([]);

    const uniqueVendorNames = useMemo(() => {
        if (!Array.isArray(purchaseTransactions)) {
            return [];
        }
        const names = purchaseTransactions.map(p => p.vendorName).filter(Boolean);
        return [...new Set(names)];
    }, [purchaseTransactions]);

    // UseMemo to calculate total cost and total due for the selected vendor
    const { totalVendorCost, totalVendorDue } = useMemo(() => {
        let totalCost = 0;
        let totalDue = 0;

        if (vendorName && purchaseTransactions.length > 0) {
            const transactionsForVendor = purchaseTransactions.filter(
                (transaction) => transaction.vendorName?.toLowerCase() === vendorName.toLowerCase()
            );

            transactionsForVendor.forEach((transaction) => {
                let billTotal = safeParseFloat(transaction.totalAmount);
                if (billTotal === 0 && transaction.items) {
                     billTotal = transaction.items.reduce(
                         (sum, i) => sum + safeParseFloat(i.purchaseRate) * safeParseFloat(i.purchaseQuantity),
                         0
                     );
                }
                totalCost += billTotal;
                
                const dueAmount = calculateBillDueAmount(transaction, bulkPayments);
                totalDue += dueAmount;
            });
        }
        return { totalVendorCost: totalCost, totalVendorDue: totalDue };
    }, [vendorName, purchaseTransactions, bulkPayments]);

    // Update state when vendor-related calculations change
    useEffect(() => {
        setTotalPurchaseCost(totalVendorCost);
        setTotalDue(totalVendorDue);
        setToBePaid(totalVendorDue.toFixed(2));
    }, [totalVendorCost, totalVendorDue]);

    // UseMemo to filter bills based on the selected vendor, date range, and bill type
    const filteredBills = useMemo(() => {
        if (!Array.isArray(purchaseTransactions) || !vendorName.trim()) {
            return [];
        }

        let bills = purchaseTransactions.filter(transaction =>
            transaction.vendorName?.toLowerCase() === vendorName.toLowerCase()
        );

        if (dateFrom) {
            const fromDateObj = new Date(dateFrom);
            bills = bills.filter(bill => new Date(bill.billDate) >= fromDateObj);
        }
        if (dateTo) {
            const toDateObj = new Date(dateTo);
            bills = bills.filter(bill => new Date(bill.billDate) <= toDateObj);
        }

        return bills.filter(bill => {
            const dueAmount = calculateBillDueAmount(bill, bulkPayments);
            if (billType === 'Due Bill') {
                return dueAmount > 0.01;
            } else if (billType === 'Paid Bill') {
                return dueAmount <= 0.01;
            }
            return true; // 'All Bill'
        });
    }, [vendorName, dateFrom, dateTo, billType, purchaseTransactions, bulkPayments]);

    // FIX: Refactored handleProceed to use the new helper function
    const handleProceed = () => {
        if (!vendorName) {
            alert("Please select a vendor first");
            return;
        }

        const dueBills = filteredBills.filter(bill => {
            const dueAmount = calculateBillDueAmount(bill, bulkPayments);
            return dueAmount > 0.01;
        });

        setSelectedBills(dueBills);
        
        const calculatedPayNowAmount = dueBills.reduce((sum, bill) => {
            const dueAmount = calculateBillDueAmount(bill, bulkPayments);
            return sum + dueAmount;
        }, 0);

        setPayNowAmount(calculatedPayNowAmount.toFixed(2));
    };

    const handleReset = () => {
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setVendorName('');
        setDateFrom('');
        setDateTo(new Date().toISOString().split('T')[0]);
        setBillType('All Bill');
        setTotalPurchaseCost(0);
        setTotalDue(0);
        setToBePaid('');
        setPayMode('Cash');
        setPayNowAmount('');
        setNarration('');
        setSelectedBills([]);
    };

    const handleSavePayment = (e) => {
        e.preventDefault();

        if (!vendorName || selectedBills.length === 0 || !payNowAmount || parseFloat(payNowAmount) <= 0) {
            alert('Please select a vendor, proceed to select bills, and enter a valid amount to pay.');
            return;
        }

        const paymentAmount = safeParseFloat(payNowAmount);
        let remainingPayment = paymentAmount;
        const paidBills = [];

        const sortedBills = [...selectedBills].sort((a, b) => new Date(a.billDate) - new Date(b.billDate));

        for (const bill of sortedBills) {
            if (remainingPayment <= 0) break;

            const due = calculateBillDueAmount(bill, bulkPayments);
            if (due <= 0.01) continue;

            const amountToPayForThisBill = Math.min(remainingPayment, due);
            
            // Re-calculate the bill's total paid amount *before* this new payment
            const totalPaidForBillBeforeThisPayment = bulkPayments.reduce((sum, payment) => {
                const detail = payment.paidBillsDetails?.find(d => d.billId === bill.id);
                return sum + (detail ? safeParseFloat(detail.amountPaid) : 0);
            }, 0);

            const newTotalPaid = totalPaidForBillBeforeThisPayment + amountToPayForThisBill;
            const billTotal = safeParseFloat(bill.totalAmount) || bill.items.reduce((sum, i) => sum + safeParseFloat(i.purchaseRate) * safeParseFloat(i.purchaseQuantity), 0);
            const newStatus = (billTotal - newTotalPaid) <= 0.01 ? 'Paid' : 'Partially Paid';
            
            paidBills.push({
                billId: bill.id,
                billNo: bill.billNo,
                amountPaid: amountToPayForThisBill,
                previousStatus: bill.status,
                newStatus: newStatus,
            });
            
            updatePurchaseTransaction({
                ...bill,
                status: newStatus,
            });

            remainingPayment -= amountToPayForThisBill;
        }
        // utils/generateVoucherId.js
        const generateVoucherId = () => {
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit
        return `V${randomNum}`;
        };

        const newBulkPayment = {
            id: sortedBills[0].id,
            Vid: generateVoucherId(), 
            paymentDate,
            vendorName,
            dateFrom,
            dateTo,
            billType,
            totalDueAtTimeOfPayment: totalDue,
            amountPaid: paymentAmount,
            payMode,
            narration,
            paidBillsDetails: paidBills,
            remainingPayment: remainingPayment,
            savedAt: new Date().toISOString(),
        };

        addBulkPayment(newBulkPayment);
        alert('Bulk Payment saved successfully!');
        navigate(`/print-bulk-voucher/${newBulkPayment.id}`);
        handleReset();
    };

    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const radioOptionClass = 'flex items-center space-x-2';
    const radioInputClass = 'form-radio h-4 w-4 text-teal-600 focus:ring-teal-500';
    const readonlyInputClass = `${inputClass} bg-gray-100 cursor-not-allowed`;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">PAYMENT (BULK)</h2>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Business Currency is : <span className="font-semibold">₹</span></span>
                    <button
                        onClick={() => navigate('/bulk-payment-history')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Payment History
                    </button>
                </div>
            </div>

            {/* Payment & Amount Information */}
            <fieldset className="border border-gray-300 p-3 rounded-md mb-4">
                <legend className="text-teal-700 font-semibold px-2">PAYMENT & AMOUNT INFORMATION</legend>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label htmlFor="paymentDate" className={labelClass}>Payment Date</label>
                        <input type="date" id="paymentDate" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="vendorName" className={labelClass}>Name of Vendor</label>
                        <select
                            id="vendorName"
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">-- Select a Vendor --</option>
                            {uniqueVendorNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end space-x-2">
                        <div>
                            <label htmlFor="dateFrom" className={labelClass}>Date From</label>
                            <input type="date" id="dateFrom" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="dateTo" className={labelClass}>Date To</label>
                            <input type="date" id="dateTo" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    <div>
                        <label className={labelClass}>Bill Type</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="billType"
                                    value="All Bill"
                                    checked={billType === 'All Bill'}
                                    onChange={(e) => setBillType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>All Bill</span>
                            </label>
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="billType"
                                    value="Due Bill"
                                    checked={billType === 'Due Bill'}
                                    onChange={(e) => setBillType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Due Bill</span>
                            </label>
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="billType"
                                    value="Paid Bill"
                                    checked={billType === 'Paid Bill'}
                                    onChange={(e) => setBillType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Paid Bill</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="totalPurchaseCost" className={labelClass}>Total Purchase Cost</label>
                        <input type="text" id="totalPurchaseCost" value={`₹${totalPurchaseCost.toFixed(2)}`} className={readonlyInputClass} readOnly />
                    </div>
                    <div>
                        <label htmlFor="totalDue" className={labelClass}>Total Due</label>
                        <input type="text" id="totalDue" value={`₹${totalDue.toFixed(2)}`} className={readonlyInputClass} readOnly />
                    </div>
                    <div>
                        <label htmlFor="toBePaid" className={labelClass}>To Be Paid</label>
                        <input
                            type="text"
                            id="toBePaid"
                            value={`₹${toBePaid}`}
                            className={readonlyInputClass}
                            readOnly
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-15.356-2m0 0v5h-.582"></path></svg>
                        RESET
                    </button>
                    <button
                        type="button"
                        onClick={handleProceed}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        PROCEED
                    </button>
                </div>
            </fieldset>

            {/* Purchase Details (Due) */}
            <fieldset className="border border-gray-300 p-3 rounded-md mb-4">
                <legend className="text-teal-700 font-semibold px-2">
                    PURCHASE DETAILS (DUE)
                    {selectedBills.length > 0 && (
                        <span className="ml-2 text-gray-500 text-sm">({selectedBills.length} Bills Found)</span>
                    )}
                </legend>
                {selectedBills.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-lg text-gray-600 mb-3">No Purchase Due Details Found.</p>
                        <p className="text-sm text-gray-500">Select a vendor and click PROCEED to view bills.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-md">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                                    <th className="py-2 px-4 border-b">Vendor Name</th>
                                    <th className="py-2 px-4 border-b">Bill No.</th>
                                    <th className="py-2 px-4 border-b">Bill Date</th>
                                    <th className="py-2 px-4 border-b">Total Amount</th>
                                    <th className="py-2 px-4 border-b">Amount Paid</th>
                                    <th className="py-2 px-4 border-b">Due Amount</th>
                                    
                                    <th className="py-2 px-4 border-b">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedBills.map((bill) => {
                                    const totalPaidForBill = bulkPayments.reduce((sum, payment) => {
                                        const detail = payment.paidBillsDetails?.find(d => d.billId === bill.id);
                                        return sum + (detail ? safeParseFloat(detail.amountPaid) : 0);
                                    }, 0);
                                    
                                    const billTotal = safeParseFloat(bill.totalAmount) || bill.items.reduce((sum, i) => sum + safeParseFloat(i.purchaseRate) * safeParseFloat(i.purchaseQuantity), 0);
                                    const dueAmount = billTotal - totalPaidForBill;
                                    const status = dueAmount <= 0.01 ? 'Paid' : 'Due';

                                    return (
                                        <tr key={bill.id} className="hover:bg-gray-50 text-sm text-gray-800">
                                            <td className="py-2 px-4 border-b">{bill.vendorName}</td>
                                            <td className="py-2 px-4 border-b">{bill.billNo}</td>
                                            <td className="py-2 px-4 border-b">{bill.billDate}</td>
                                            <td className="py-2 px-4 border-b">₹{billTotal.toFixed(2)}</td>
                                            <td className="py-2 px-4 border-b">₹{totalPaidForBill.toFixed(2)}</td>
                                            <td className="py-2 px-4 border-b">₹{dueAmount.toFixed(2)}</td>
                                            
                                            <td className="py-2 px-4 border-b">{status}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </fieldset>

            {/* Adjust with Payment / Adjust with Credit Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adjust with Payment */}
                <fieldset className="border border-gray-300 p-3 rounded-md">
                    <legend className="text-teal-700 font-semibold px-2">ADJUST WITH PAYMENT</legend>
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>Pay Mode :</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <label className={radioOptionClass}>
                                    <input
                                        type="radio"
                                        name="payMode"
                                        value="Cash"
                                        checked={payMode === 'Cash'}
                                        onChange={(e) => setPayMode(e.target.value)}
                                        className={radioInputClass}
                                    />
                                    <span>Cash</span>
                                </label>
                                <label className={radioOptionClass}>
                                    <input
                                        type="radio"
                                        name="payMode"
                                        value="Card"
                                        checked={payMode === 'Card'}
                                        onChange={(e) => setPayMode(e.target.value)}
                                        className={radioInputClass}
                                    />
                                    <span>Card</span>
                                </label>
                                <label className={radioOptionClass}>
                                    <input
                                        type="radio"
                                        name="payMode"
                                        value="Cheque"
                                        checked={payMode === 'Cheque'}
                                        onChange={(e) => setPayMode(e.target.value)}
                                        className={radioInputClass}
                                    />
                                    <span>Cheque</span>
                                </label>
                                <label className={radioOptionClass}>
                                    <input
                                        type="radio"
                                        name="payMode"
                                        value="Online"
                                        checked={payMode === 'Online'}
                                        onChange={(e) => setPayMode(e.target.value)}
                                        className={radioInputClass}
                                    />
                                    <span>Online</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="payNowAmount" className={labelClass}>Pay Now</label>
                            <input
                                type="number"
                                id="payNowAmount"
                                value={payNowAmount}
                                onChange={(e) => setPayNowAmount(e.target.value)}
                                className={inputClass}
                                placeholder="Enter amount to pay"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label htmlFor="narrationPayment" className={labelClass}>Narration</label>
                            <textarea
                                id="narrationPayment"
                                value={narration}
                                onChange={(e) => setNarration(e.target.value)}
                                className={`${inputClass} h-16 resize-y`}
                                placeholder="Enter payment narration..."
                            ></textarea>
                        </div>
                    </div>
                </fieldset>

                {/* Adjust with Credit Note (Placeholder) */}
                <fieldset className="border border-gray-300 p-3 rounded-md">
                    <legend className="text-teal-700 font-semibold px-2">ADJUST WITH CREDIT NOTE</legend>
                    <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-lg text-gray-600">Credit Note functionality not implemented yet.</p>
                    </div>
                </fieldset>
            </div>

            {/* Final Save Button */}
            <div className="flex justify-center mt-4">
                <button
                    type="button"
                    onClick={handleSavePayment}
                    className="px-8 py-3 bg-teal-600 text-white font-bold text-lg rounded-md hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                    SAVE PAYMENT
                </button>
            </div>
        </div>
    );
};

export default BulkPaymentForm;