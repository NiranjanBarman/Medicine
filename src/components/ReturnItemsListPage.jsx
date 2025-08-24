// src/components/ReturnItemsListPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePurchaseStore from '../store/purchaseStore'; // Now using purchaseStore for session items

const ReturnItemsListPage = () => {
    const navigate = useNavigate();

    // Get currentSessionReturnItems and actions from usePurchaseStore
    const itemsToReturn = usePurchaseStore((state) => state.currentSessionReturnItems);
    const setItemData = usePurchaseStore((state) => state.setItemData); // To set item for detail view
    const deleteCurrentSessionReturnItem = usePurchaseStore((state) => state.deleteCurrentSessionReturnItem);
    const clearCurrentSessionReturnItems = usePurchaseStore((state) => state.clearCurrentSessionReturnItems);

    const handleViewItem = (item) => {
        setItemData(item); // Set the item to be viewed in the store
        navigate(`/return-item-detail/${item.id}`); // Navigate to the detail page
    };

    const handleEditItem = (item) => {
        alert('Edit functionality not fully implemented. This would typically take you back to the form with pre-filled data.');
        console.log('Attempting to edit item:', item);
        // Implement navigation back to VendorWiseReturnForm and populate its fields for editing.
        // For example: navigate('/vendor-return', { state: { itemToEdit: item } });
        // The form would then need to read this state and handle editing logic.
    };

    const handleDeleteItem = (itemId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this item from the current return list?");
        if (confirmDelete) {
            deleteCurrentSessionReturnItem(itemId); // Use the dedicated action to remove from store
            alert('Item removed successfully!');
        }
    };

    const handleGoBackToForm = () => {
        navigate('/vendor-return');
    };

    const handleClearAllItems = () => {
        const confirmClear = window.confirm("Are you sure you want to clear ALL items from the current return list?");
        if (confirmClear) {
            clearCurrentSessionReturnItems();
            alert('All items cleared from current return session!');
        }
    };

    return (
        <div className="bg-white p-6 w-full min-h-screen border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-teal-800 border-b-2 pb-3">CURRENT SESSION RETURN ITEMS</h2>

            {itemsToReturn.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-md">
                    <p className="text-xl text-gray-600 mb-4">No items added to the current return list yet.</p>
                    <button
                        onClick={handleGoBackToForm}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                        Add Items to Return
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-6">
                        {itemsToReturn.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between bg-yellow-100 py-2 px-4 rounded-md shadow-sm border border-yellow-200"
                            >
                                <div className="flex flex-col md:flex-row md:items-center space-y-0 md:space-y-0 md:space-x-6 text-sm text-gray-800 flex-grow">
                                    <p>
                                        <span className="font-semibold">Vendor / Supplier Name:</span> {item.existingName || 'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Medicine/Item Name:</span> {item.nameOfGeneric || item.tradeName || 'N/A'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Return Qty:</span> {item.returnQty !== undefined && item.returnQty !== null ? item.returnQty : '0'} {item.returnUnit || ''}
                                    </p>
                                </div>

                                <div className="flex space-x-2 ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => handleEditItem(item)}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleViewItem(item)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleGoBackToForm}
                            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                        >
                            ← Back to Form
                        </button>
                        <button
                            onClick={handleClearAllItems}
                            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
                        >
                            Clear All Items
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReturnItemsListPage;