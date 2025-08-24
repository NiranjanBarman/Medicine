// src/forms/AdvanceReceiptForm.jsx
import React, { useState, useEffect } from 'react';
import usePurchaseStore from '../store/purchaseStore';

const AdvanceReceiptForm = () => {
    console.log('AdvanceReceiptForm: Component function started.');

    const addAdvanceReceipt = usePurchaseStore((state) => state.addAdvanceReceipt);
    const allAdvanceReceipts = usePurchaseStore((state) => state.allAdvanceReceipts || []);

    console.log('AdvanceReceiptForm: allAdvanceReceipts from store:', allAdvanceReceipts);

    const [date, setDate] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('Cash');
    const [narration, setNarration] = useState('');

    useEffect(() => {
        console.log('AdvanceReceiptForm: Component mounted.');
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        console.log('handleSave: Save button clicked.');

        if (!name || !amount || parseFloat(amount) <= 0) {
            alert('Please enter a name and a valid amount.');
            console.log('handleSave: Validation failed - Name or Amount missing/invalid.');
            return;
        }

        const newReceipt = {
            date,
            name,
            amount: parseFloat(amount),
            paymentType,
            narration,
            savedAt: new Date().toISOString(),
        };

        addAdvanceReceipt(newReceipt);
        alert('Advance Receipt saved successfully!');
        console.log('handleSave: Saved Advance Receipt:', newReceipt);

        // Reset form fields
        setDate(new Date().toISOString().split('T')[0]);
        setName('');
        setAmount('');
        setPaymentType('Cash');
        setNarration('');
        console.log('handleSave: Form fields reset.');
    };

    const handleReset = () => {
        console.log('handleReset: Reset button clicked.');
        setDate(new Date().toISOString().split('T')[0]);
        setName('');
        setAmount('');
        setPaymentType('Cash');
        setNarration('');
        console.log('handleReset: Form fields reset.');
    };


    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;
    const radioOptionClass = 'flex items-center space-x-2';
    const radioInputClass = 'form-radio h-4 w-4 text-teal-600 focus:ring-teal-500';

    return (
        <div className="bg-white p-4 rounded-lg shadow-md  mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">ADVANCE RECEIPT</h2>
                <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Business Currency is : <span className="font-semibold">₹</span></span>

                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4"> {/* Reduced space-y */}
                {/* Top row: Date, Name, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Reduced gap */}
                    <div>
                        <label htmlFor="date" className={labelClass}>Date {requiredSpan}</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="name" className={labelClass}>Name {requiredSpan}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="Enter Name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className={labelClass}>Amount {requiredSpan}</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={inputClass}
                            placeholder="Enter Amount"
                            step="0.01"
                            required
                        />
                    </div>
                </div>

                {/* Payment Type and Narration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Reduced gap */}
                    <div>
                        <label className={labelClass}>Payment Type</label>
                        <div className="flex flex-wrap gap-3 mt-1"> {/* Reduced gap and margin-top */}
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Cash"
                                    checked={paymentType === 'Cash'}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Cash</span>
                            </label>
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Card"
                                    checked={paymentType === 'Card'}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Card</span>
                            </label>
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Cheque"
                                    checked={paymentType === 'Cheque'}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Cheque</span>
                            </label>
                            <label className={radioOptionClass}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Online"
                                    checked={paymentType === 'Online'}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className={radioInputClass}
                                />
                                <span>Online</span>
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="narration" className={labelClass}>Narration</label>
                        <textarea
                            id="narration"
                            value={narration}
                            onChange={(e) => setNarration(e.target.value)}
                            className={`${inputClass} h-20 resize-y`} 
                            placeholder="Enter any narration..."
                        ></textarea>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6 pt-3 border-t border-gray-200"> {/* Reduced margin-top and padding-top */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-15.356-2m0 0v5h-.582"></path></svg>
                        RESET
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-md flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        SAVE
                    </button>
                </div>
            </form>

            {/* Previous Advance Details Section */}
            <div className="mt-8 pt-4 border-t-2 border-gray-300"> {/* Reduced margin-top and padding-top */}
                <h3 className="text-xl font-bold mb-3 text-blue-800 text-center">PREVIOUS ADVANCE DETAILS</h3> {/* Reduced font size and margin-bottom */}
                {Array.isArray(allAdvanceReceipts) && allAdvanceReceipts.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200"> {/* Reduced padding */}
                        <p className="text-lg text-gray-600 mb-3">No Advance Receipt Details Found.</p> {/* Reduced font size and margin-bottom */}
                    </div>
                ) : (
                    <div className="space-y-3"> {/* Reduced space-y */}
                        {allAdvanceReceipts.map((receipt) => (
                            <div key={receipt.id} className="bg-blue-50 p-3 rounded-md shadow-sm border border-blue-200"> {/* Reduced padding */}
                                <p className="text-sm">
                                    <span className="font-semibold">Date:</span> {receipt.date}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Name:</span> {receipt.name}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Amount:</span> ₹{receipt.amount ? receipt.amount.toFixed(2) : '0.00'}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Payment Type:</span> {receipt.paymentType}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Narration:</span> {receipt.narration || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1"> {/* Reduced margin-top */}
                                    Saved: {new Date(receipt.savedAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvanceReceiptForm;
