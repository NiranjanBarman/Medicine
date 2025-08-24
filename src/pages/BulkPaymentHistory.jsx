// src/pages/BulkPaymentHistory.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBulkPaymentStore from '../store/bulkPaymentStore';

// A utility function to safely parse a float value, defaulting to 0 if invalid.
const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

const BulkPaymentHistory = () => {
    const navigate = useNavigate();
    const { bulkPayments = [] } = useBulkPaymentStore();

    const goBack = () => {
        navigate(-1);
    };

    const getStatus = (payment) => {
        const totalDue = safeParseFloat(payment.totalDueAtTimeOfPayment);
        const amountPaid = safeParseFloat(payment.amountPaid);

        if (totalDue > amountPaid) {
            return 'PARTIALLY PAID';
        } else if (totalDue <= amountPaid) {
            return 'PAID';
        }
        return 'N/A';
    };

    const handlePrintView = (id) => {
        navigate(`/print-bulk-voucher/${id}`);
    };

    return (
        <div className="bg-gray-100 p-6 min-h-screen">
            <div className="bg-white p-6 rounded-xl shadow-lg mx-auto text-gray-800 border border-gray-200">
                <div className="flex justify-between items-center mb-6 border-b-2 pb-4 border-gray-200">
                    <h2 className="text-3xl font-extrabold text-teal-700 tracking-wide">
                        BULK PAYMENT HISTORY
                    </h2>
                    <button
                        onClick={goBack}
                        className="flex items-center px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Go Back
                    </button>
                </div>

                <fieldset className="border-2 border-gray-300 p-5 rounded-xl bg-gray-50">
                    <legend className="text-xl font-bold text-teal-600 px-3">PAYMENT DETAILS</legend>
                    {bulkPayments.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-300 text-gray-600 shadow-inner">
                            <p className="text-lg font-semibold mb-2">No Payment Details Found.</p>
                            <p className="text-sm">Payments will appear here after you save them from the bulk payment form.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto shadow-md rounded-lg">
                            <table className="min-w-full bg-white border-collapse">
                                <thead className="bg-slate-700 text-white">
                                    <tr className="text-sm font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-left">Bills Number</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-left">Payment Date</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-left">Vendor</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-right">Total Purchase</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-right">Amount Paid</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-right">Remaining Due</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-left">Mode</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-left">Narration</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-center">Status</th>
                                        <th className="py-3 px-5 border-b-2 border-slate-600 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulkPayments.map((payment, index) => {
                                        const totalPurchase = safeParseFloat(payment.totalDueAtTimeOfPayment);
                                        const amountPaid = safeParseFloat(payment.amountPaid);
                                        const remainingDue = totalPurchase - amountPaid;

                                        return (
                                            <tr key={`${payment.id}-${index}`} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                                                <td className="py-3 px-5 text-sm text-left">
                                                    {payment.paidBillsDetails?.map(bill => bill.billNo).join(', ') || 'N/A'}
                                                </td>
                                                <td className="py-3 px-5 text-sm text-left">{payment.paymentDate}</td>
                                                <td className="py-3 px-5 text-sm font-medium text-left">{payment.vendorName}</td>
                                                <td className="py-3 px-5 text-sm text-right">₹{totalPurchase.toFixed(2)}</td>
                                                <td className="py-3 px-5 text-sm text-right">₹{amountPaid.toFixed(2)}</td>
                                                <td className="py-3 px-5 text-sm text-right">₹{remainingDue.toFixed(2)}</td>
                                                <td className="py-3 px-5 text-sm text-left">{payment.payMode}</td>
                                                <td className="py-3 px-5 text-sm text-left">{payment.narration || 'N/A'}</td>
                                                <td className="py-3 px-5 text-center text-sm font-semibold">
                                                    <span className={`py-1 px-3 rounded-full text-xs font-bold uppercase ${getStatus(payment) === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {getStatus(payment)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-center">
                                                    <button
                                                        onClick={() => handlePrintView(payment.id)}
                                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md shadow hover:bg-blue-700 transition"
                                                    >
                                                        Print / View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
};

export default BulkPaymentHistory;