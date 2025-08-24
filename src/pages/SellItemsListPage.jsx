// src/components/SellItemsListPage.jsx (Updated for payment redirection)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useCounterSaleStore from '../store/useCounterSaleStore';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';

const SellItemsListPage = () => {
    // markSaleAsPaid is no longer directly used here as payment is handled via form redirection
    const { counterSales, deleteCounterSale } = useCounterSaleStore();
    const { updateItemStockInPurchase } = usePurchaseTransactionStore();
    const navigate = useNavigate();

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [modalType, setModalType] = useState('alert');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedSales, setDisplayedSales] = useState([]);

    useEffect(() => {
        const filteredAndTypedSales = counterSales.filter(sale => sale.saleType === 'Counter Sale' || !sale.saleType);

        const filteredBySearch = filteredAndTypedSales.filter(sale => {
            const matchesSearch = searchTerm === '' ||
                sale.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });

        // Sort by date, newest first
        setDisplayedSales(filteredBySearch.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)));
    }, [counterSales, searchTerm]);

    const closeCustomModal = () => {
        setShowConfirmModal(false);
        setModalMessage('');
        setModalAction(null);
        setModalType('alert');
    };

    const handleModalConfirm = () => {
        if (modalAction) {
            modalAction();
        }
        closeCustomModal();
    };

    const handleDeleteSale = (saleId, items) => {
        setModalMessage('Are you sure you want to delete this Counter Sale? This action cannot be undone and stock will be reverted.');
        setModalType('confirm');
        setModalAction(() => {
            return () => {
                items.forEach(item => {
                    updateItemStockInPurchase(
                        { nameOfItemMedicine: item.nameOfItemMedicine, batchSrlNo: item.batchSrlNo, expDate: item.expDate },
                        item.totalSoldQtyInStrips,
                        'add'
                    );
                });
                deleteCounterSale(saleId);
                alert('Counter Sale deleted successfully and stock reverted!');
            };
        });
        setShowConfirmModal(true);
    };

    // --- UPDATED handlePaymentClick to redirect to CounterSaleForm with saleId ---
    const handlePaymentClick = useCallback((saleId) => {
        navigate('/counter-sale', { state: { saleId } }); // Pass saleId in state
    }, [navigate]);


    return (
        <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">COUNTER SALES LIST</h2>
                <button
                    onClick={() => navigate('/counter-sale')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    NEW COUNTER SALE
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Bill No., Customer Name, Patient ID, Doctor, or Remarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Sales Table */}
            {displayedSales.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No Counter sales transactions found.</p>
                    <p className="text-sm text-gray-500">Start by creating a new Counter Sale.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/counter-sale')}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center mx-auto"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        New Counter Sale
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-b text-left">Bill No.</th>
                                <th className="px-3 py-2 border-b text-left">Sale Date</th>
                                <th className="px-3 py-2 border-b text-left">Customer Name</th>
                                <th className="px-3 py-2 border-b text-left">Total Amount</th>
                                <th className="px-3 py-2 border-b text-left">Paid Amount</th>
                                <th className="px-3 py-2 border-b text-left">Due Amount</th>
                                <th className="px-3 py-2 border-b text-left">Payment Status</th>
                                <th className="px-3 py-2 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSales.map((sale) => {
                                // Calculate paid and due amounts dynamically for display
                                const paidAmount = sale.paymentAmount || 0;
                                const dueAmount = (sale.totalAmount - paidAmount) > 0 ? (sale.totalAmount - paidAmount) : 0;
                                const paymentStatus = dueAmount > 0 ? 'Due' : 'Paid';

                                return (
                                    <tr key={sale.id} className="hover:bg-gray-50 text-gray-800">
                                        <td className="px-3 py-2 border-b">{sale.billNo}</td>
                                        <td className="px-3 py-2 border-b">{sale.saleDate}</td>
                                        <td className="px-3 py-2 border-b">{sale.customerName || 'N/A'}</td>
                                        <td className="px-3 py-2 border-b">₹{sale.totalAmount.toFixed(2)}</td>
                                        <td className="px-3 py-2 border-b">₹{paidAmount.toFixed(2)}</td>
                                        <td className="px-3 py-2 border-b">₹{dueAmount.toFixed(2)}</td>
                                        <td className="px-3 py-2 border-b">
                                            <span className={`font-semibold ${paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                {paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 border-b space-x-2">
                                            <button
                                                onClick={() => navigate(`/counter-sale-details/${sale.id}`)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                            {/* Show Payment button only if there's a due amount */}
                                            {dueAmount > 0 && (
                                                <button
                                                    onClick={() => handlePaymentClick(sale.id)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    Payment
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteSale(sale.id, sale.items)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Custom Confirmation/Alert Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-300">
                        <p className="text-lg font-medium text-gray-800 mb-4">{modalMessage}</p>
                        <div className="flex justify-center space-x-4">
                            {modalType === 'confirm' && (
                                <button
                                    onClick={closeCustomModal}
                                    className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleModalConfirm}
                                className={`px-5 py-2 rounded-md transition-colors duration-200 ${modalType === 'confirm' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellItemsListPage;