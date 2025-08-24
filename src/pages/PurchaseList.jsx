// src/components/PurchaseList.jsx
import React, { useCallback, useEffect} from 'react';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore'; // Adjust path as necessary
import { useNavigate } from 'react-router-dom';

const PurchaseList = () => {
    const { purchaseTransactions, deletePurchaseTransaction } = usePurchaseTransactionStore();
    const navigate = useNavigate();

    // State for custom alert modal
    // --- DEBUGGING: Check what purchaseTransactions holds ---
    useEffect(() => {
        console.log('PurchaseList: purchaseTransactions on render/update:', purchaseTransactions);
        if (purchaseTransactions.length === 0) {
            console.log('PurchaseList: purchaseTransactions array is currently empty.');
        }
    }, [purchaseTransactions]);
    // --- END DEBUGGING ---

    /**
     * Calculates the total quantity of items in a purchase.
     * Uses 'actualBillableQty' as saved in GRCPurchaseDetails.
     * @param {Array<object>} items - Array of item objects in a purchase.
     * @returns {number} Total quantity.
     */
    const getTotalQuantity = useCallback((items) => {
        if (!Array.isArray(items)) {
            console.warn('getTotalQuantity received non-array items:', items);
            return 0;
        }
        return items.reduce((sum, item) => sum + parseFloat(item.actualBillableQty || 0), 0);
    }, []);

    /**
     * Calculates the total amount for a purchase, considering quantity, rate, GST, and discount.
     * Uses 'actualBillableQty' and 'purchaseRate' as saved.
     * @param {Array<object>} items - Array of item objects in a purchase.
     * @returns {string} Total amount formatted to 2 decimal places.
     */
    const getTotalAmount = useCallback((items) => {
        if (!Array.isArray(items)) {
            console.warn('getTotalAmount received non-array items:', items);
            return 0;
        }
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.actualBillableQty || 0); // Use actualBillableQty
            const rate = parseFloat(item.purchaseRate || 0);
            const gst = parseFloat(item.gstIgst || 0);
            const discPercent = parseFloat(item.disc || 0); // Assuming 'disc' is the discount percentage

            let itemTotal = qty * rate;

            if (discPercent > 0) {
                itemTotal -= itemTotal * (discPercent / 100);
            }

            if (gst > 0) {
                itemTotal += itemTotal * (gst / 100);
            }
            return sum + itemTotal;
        }, 0).toFixed(2);
    }, []);

    /**
     * Handles the deletion of a specific purchase transaction.
     * @param {string} id - The ID of the purchase transaction to delete.
     */
    const handleDelete = (id) => {
        deletePurchaseTransaction(id);
        alert('Purchase record deleted successfully!');
    };

    /**
     * Navigates to the edit page for a specific purchase transaction.
     * @param {string} id - The ID of the purchase transaction to edit.
     */
    const handleEdit = (id) => {
        navigate(`/purchases/edit/${id}`); // Assuming you have an edit route
    };

    /**
     * Navigates to the view details page for a specific purchase transaction.
     * @param {string} id - The ID of the purchase transaction to view.
     */
    const handleViewDetails = (id) => {
        navigate(`/purchases/view/${id}`); // Assuming you have a view route
    };

    /**
     * Navigates to the page for adding a new purchase.
     */
    const handleAddPurchase = () => {
        navigate('/purchases-data'); // Adjust this path to your GRC/Purchase Details page route
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900 font-inter">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 border-b pb-2 gap-4">
                <h2 className="text-2xl font-bold text-teal-800">
                    PURCHASE LIST
                    {/* Display total number of purchase transactions */}
                    <span className="ml-4 text-teal-600 text-lg font-normal">
                        (Count: {purchaseTransactions.length})
                    </span>
                </h2>
                <button
                    onClick={handleAddPurchase}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    ADD/BACK PURCHASE
                </button>
            </div>

            {purchaseTransactions.length === 0 ? (
                <p className="text-gray-600 text-center mt-8">No purchase records found. Please add a new purchase.</p>
            ) : (
                <div className="overflow-x-auto mt-6">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="py-3 px-4 border-b">GRC NO.</th>
                                <th className="py-3 px-4 border-b">Bill No.</th>
                                <th className="py-3 px-4 border-b">Bill Date</th>
                                <th className="py-3 px-4 border-b">Purchase Date</th>
                                <th className="py-3 px-4 border-b">Vendor Name</th>
                                <th className="py-3 px-4 border-b">Items Count</th>
                                <th className="py-3 px-4 border-b">Total Qty.</th>
                                <th className="py-3 px-4 border-b">Total Amt.</th>
                                <th className="py-3 px-4 border-b">GRC Type</th>
                                <th className="py-3 px-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseTransactions.map(purchase => (
                                <tr key={purchase.id} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                                    <td className="py-3 px-4">{purchase.id.substring(0, 8)}...</td>
                                    <td className="py-3 px-4">{purchase.billNo}</td>
                                    <td className="py-3 px-4">{purchase.billDate}</td>
                                    <td className="py-3 px-4">{purchase.date}</td>
                                    <td className="py-3 px-4">{purchase.vendorName}</td>
                                    <td className="py-3 px-4">{Array.isArray(purchase.items) ? purchase.items.length : 0}</td>
                                    <td className="py-3 px-4">{getTotalQuantity(purchase.items)}</td>
                                    <td className="py-3 px-4">₹ {getTotalAmount(purchase.items)}</td>
                                    <td className="py-3 px-4">{purchase.grcType}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleViewDetails(purchase.id)}
                                            className="text-green-600 hover:text-green-900 mr-3 text-sm"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(purchase.id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(purchase.id)}
                                            className="text-red-600 hover:text-red-900 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PurchaseList;
