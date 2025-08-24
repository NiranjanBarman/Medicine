// src/components/PurchaseDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';

const PurchaseDetails = () => {
    const { purchaseId } = useParams(); // Get the purchase ID from the URL parameters
    const navigate = useNavigate(); // Hook for navigation

    // Fetch purchase transactions from the store
    const { purchaseTransactions } = usePurchaseTransactionStore();

    const [purchase, setPurchase] = useState(null); // State to hold the found purchase transaction

    // State for custom alert modal
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertAction, setAlertAction] = useState(null); // Function to execute on OK

    // Function to show custom alert modal
    const showCustomAlert = (message, action = null) => {
        setAlertMessage(message);
        setAlertAction(() => action); // Store the action to be called on OK
        setShowAlertModal(true);
    };

    // Function to close custom alert modal
    const closeCustomAlert = () => {
        setShowAlertModal(false);
        setAlertMessage('');
        if (alertAction) {
            alertAction(); // Execute the stored action
        }
        setAlertAction(null); // Clear the action
    };

    /**
     * Calculates the total amount for a purchase.
     * Uses 'actualBillableQty' for quantity, 'purchaseRate' for rate,
     * 'gstIgst' for GST, and 'disc' for discount percentage.
     * @param {Array<object>} items - Array of item objects in a purchase.
     * @returns {string} Total amount formatted to 2 decimal places.
     */
    const getTotalAmount = useCallback((items) => {
        if (!Array.isArray(items)) {
            console.warn('getTotalAmount received non-array items:', items);
            return '0.00'; // Return a default formatted string
        }
        return items.reduce((sum, item) => {
            // FIX: Use item.actualBillableQty for quantity and item.disc for discount
            const qty = parseFloat(item.actualBillableQty || 0);
            const rate = parseFloat(item.purchaseRate || 0);
            const gst = parseFloat(item.gstIgst || 0);
            const discPercent = parseFloat(item.disc || 0); // Corrected to 'item.disc'

            let itemTotal = qty * rate;

            // Apply discount if any (assuming it's a percentage off the item total)
            if (discPercent > 0) {
                itemTotal -= itemTotal * (discPercent / 100);
            }

            // Apply GST (assuming it's added to the item total)
            if (gst > 0) {
                itemTotal += itemTotal * (gst / 100);
            }
            return sum + itemTotal;
        }, 0).toFixed(2); // Format to 2 decimal places
    }, []);


    // Effect to find and set the purchase details when purchaseId or transactions change
    useEffect(() => {
        if (purchaseId && purchaseTransactions.length > 0) {
            const foundPurchase = purchaseTransactions.find(p => p.id === purchaseId);
            if (foundPurchase) {
                setPurchase(foundPurchase);
            } else {
                // If purchase not found, show alert and navigate back
                showCustomAlert('Purchase record not found.', () => navigate('/purchases-list'));
            }
        } else if (!purchaseId) {
            // If no purchaseId is provided, navigate back to list
            showCustomAlert('No purchase ID provided.', () => navigate('/purchases-list'));
        }
    }, [purchaseId, purchaseTransactions, navigate]); // Depend on purchaseId, purchaseTransactions, and navigate
    
    // Display loading message while purchase data is being fetched
    if (!purchase) {
        return <div className="text-center mt-8 text-gray-600">Loading purchase details...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto border border-gray-200 text-gray-900 font-inter">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-teal-800">
                    PURCHASE DETAILS (GRC NO: {purchase.id.substring(0, 8)})
                </h2>

                {/* Right-side buttons */}
                <div className="flex items-center gap-3">
                    <button
                    onClick={() => navigate(`/print-purchase/${purchase.id}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
                    >
                    Print Purchase
                    </button>

                    <button
                    onClick={() => navigate('/purchases-list')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                    >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    BACK TO PURCHASE LIST
                    </button>
                </div>
                </div>


            {/* GRC/PURCHASE DETAILS Header Information */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-teal-700 mb-4">GRC / PURCHASE HEADER INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-800">
                    {/* Displaying the main purchase date */}
                    <div><strong className="text-gray-700">Purchase Date:</strong> {purchase.date}</div>
                    {/* Directly display vendor name saved in the transaction */}
                    <div><strong className="text-gray-700">Vendor Name:</strong> {purchase.vendorName}</div>
                    <div><strong className="text-gray-700">Bill No.:</strong> {purchase.billNo}</div>
                    <div><strong className="text-gray-700">Bill Date:</strong> {purchase.billDate}</div>
                    <div><strong className="text-gray-700">Challan No.:</strong> {purchase.challanNo || 'N/A'}</div>
                    <div><strong className="text-gray-700">GRC Type:</strong> {purchase.grcType}</div>
                    <div className="col-span-full"><strong className="text-gray-700">Remarks:</strong> {purchase.remarks || 'N/A'}</div>
                    <div className="col-span-full text-lg mt-4"><strong className="text-teal-700">Total Purchase Value:</strong> ₹ {getTotalAmount(purchase.items)}</div>
                </div>
            </div>

            {/* PURCHASED ITEMS LIST */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-teal-700 mb-4">PURCHASED ITEMS LIST ({purchase.items.length} Items)</h3>
                {purchase.items.length === 0 ? (
                    <p className="text-gray-600">No items found for this purchase.</p>
                ) : (
                    <div className="overflow-x-auto purchase-items-table-container">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <th className="py-3 px-4 border-b">Item Name (Formulation)</th>
                                    <th className="py-3 px-4 border-b">Manufacturer</th>
                                    <th className="py-3 px-4 border-b">Batch/Srl No.</th>
                                    <th className="py-3 px-4 border-b">Exp. Date</th>
                                    <th className="py-3 px-4 border-b">Actual Qty.</th> {/* Updated header */}
                                    <th className="py-3 px-4 border-b">Unit</th>
                                    <th className="py-3 px-4 border-b">Pur. Rate</th>
                                    <th className="py-3 px-4 border-b">MRP</th>
                                    <th className="py-3 px-4 border-b">GST%</th>
                                    <th className="py-3 px-4 border-b">Free Qty</th>
                                    <th className="py-3 px-4 border-b">Disc%</th> {/* Updated header */}
                                    <th className="py-3 px-4 border-b">HSN/SAC</th>
                                    <th className="py-3 px-4 border-b">Rack Details</th>
                                    <th className="py-3 px-4 border-b">Packaging</th>
                                    <th className="py-3 px-4 border-b">Purchase Quantity</th>
                                    <th className="py-3 px-4 border-b">Barcode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase.items.map(item => (
                                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                                        {/* Display item name and formulation if available */}
                                        <td className="py-3 px-4">{item.nameOfItemMedicine} {item.formulation ? `(${item.formulation})` : ''}</td>
                                        {/* Directly display manufacturer name */}
                                        <td className="py-3 px-4">{item.itemManufacturerMake}</td>
                                        <td className="py-3 px-4">{item.batchSrlNo}</td>
                                        <td className="py-3 px-4">{item.expDate}</td>
                                        <td className="py-3 px-4">{item.actualBillableQty}</td> {/* Corrected to actualBillableQty */}
                                        <td className="py-3 px-4">{item.unit}</td>
                                        <td className="py-3 px-4">{item.purchaseRate}</td>
                                        <td className="py-3 px-4">{item.mrp}</td>
                                        <td className="py-3 px-4">{item.gstIgst}</td>
                                        <td className="py-3 px-4">{item.freeQty || 0}</td>
                                        <td className="py-3 px-4">{item.disc || 0}</td> {/* Corrected to disc */}
                                        <td className="py-3 px-4">{item.hsnSac || 'N/A'}</td>
                                        <td className="py-3 px-4">{item.rackDetails || 'N/A'}</td>
                                        <td className="py-3 px-4">{item.packaging || 'N/A'}</td>
                                        <td className="py-3 px-4">{item.purchaseQuantity || 'N/A'}</td>
                                        <td className="py-3 px-4">{item.barcode || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Custom Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-300">
                        <p className="text-lg font-medium text-gray-800 mb-4">{alertMessage}</p>
                        <button
                            onClick={closeCustomAlert}
                            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseDetails;
