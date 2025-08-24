import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSaleReturnStore from '../store/saleReturnStore';

const SellReturnListPage = () => {
    const navigate = useNavigate();
    const allSaleReturns = useSaleReturnStore((state) => state.saleReturns);
    const deleteSaleReturn = useSaleReturnStore((state) => state.deleteSaleReturn);
    const [filterType, setFilterType] = useState('All');

    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : (0).toFixed(2);
    };

    const filteredSaleReturns = allSaleReturns.filter(saleReturn => {
        if (filterType === 'All') return true;
        // Corrected: Use saleReturn.saleType which is set in SaleReturnForm
        return saleReturn.saleType === filterType;
    });

    const sortedSaleReturns = [...filteredSaleReturns].sort((a, b) => {
        // Use the returnDate from the saleReturn object itself
        const dateA = new Date(a.returnDate);
        const dateB = new Date(b.returnDate);
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        return (a.originalSaleBillNo || '').localeCompare(b.originalSaleBillNo || '', undefined, { sensitivity: 'base' });
    });

    const handleDeleteReturn = (id) => {
        if (window.confirm('Are you sure you want to delete this sale return record?')) {
            deleteSaleReturn(id);
            alert('Sale Return deleted successfully!');
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/sale-return-details/${id}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900 max-w-full font-inter">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-2xl font-bold text-teal-800">All Sale Returns</h2>
                <button
                    onClick={() => navigate('/sale-return')} // Assuming '/sale-return' is the form route
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Add New Sale Return
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 flex items-center space-x-2">
                <label htmlFor="filterSaleType" className="text-gray-700 font-medium">View Returns For:</label>
                <select
                    id="filterSaleType"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">All Sale Types</option>
                    <option value="CounterSale">Counter Sales</option>
                    <option value="Indoor">Indoor Sales</option>
                </select>
            </div>

            {/* Sale Return Table */}
            <div className="overflow-x-auto max-h-[calc(100vh-230px)] overflow-y-auto custom-scrollbar border border-gray-300 rounded-lg shadow-sm">
                {sortedSaleReturns.length > 0 ? (
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase sticky top-0 z-10">
                            <tr>
                                {/* Removed redundant Return Date as CreatedAt serves similar purpose */}
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Return Date</th> {/* Added back for clarity */}
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Sale Type</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Original Bill No.</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Patient/Customer Name</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Item Name</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-right">Return Qty</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Unit</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-right">Return Amount (w/GST)</th> {/* Updated column header */}
                                <th className="px-3 py-2 border-b border-gray-300 text-right">GST Amount</th> {/* Added GST Amount column */}
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Batch No.</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Exp. Date</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-left">Returned At</th>
                                <th className="px-3 py-2 border-b border-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSaleReturns.map((saleReturn) => (
                                // Corrected: Access returnedItem directly
                                <tr key={saleReturn.id} className="hover:bg-gray-50 border-b border-gray-200">
                                    <td className="px-3 py-2">{saleReturn.returnDate || 'N/A'}</td> {/* Display return date */}
                                    <td className="px-3 py-2">{saleReturn.saleType || 'N/A'}</td> {/* Corrected: saleReturn.saleType */}
                                    <td className="px-3 py-2">{saleReturn.originalSaleBillNo || 'N/A'}</td>
                                    <td className="px-3 py-2">{saleReturn.patientName || 'N/A'}</td>
                                    {/* Corrected: Access saleReturn.returnedItem directly */}
                                    <td className="px-3 py-2">{saleReturn.returnedItem?.nameOfItemMedicine || 'N/A'}</td>
                                    <td className="px-3 py-2 text-right">{saleReturn.returnedItem?.returnQty ?? 'N/A'}</td> {/* Corrected: returnQty */}
                                    <td className="px-3 py-2 text-left">{saleReturn.returnedItem?.unit || 'N/A'}</td>
                                    <td className="px-3 py-2 text-right">₹{formatAmount(saleReturn.returnedItem?.netReturnAmount)}</td> {/* Corrected: netReturnAmount includes GST */}
                                    <td className="px-3 py-2 text-right">₹{formatAmount(saleReturn.returnedItem?.gstAmount)}</td> {/* Added GST Amount display */}
                                    <td className="px-3 py-2">{saleReturn.returnedItem?.batchSrlNo || 'N/A'}</td>
                                    <td className="px-3 py-2">{saleReturn.returnedItem?.expDate || 'N/A'}</td>
                                    <td className="px-3 py-2 text-left">
                                        {/* Corrected: Use saleReturn.createdAt for the timestamp */}
                                        {saleReturn.createdAt
                                            ? new Date(saleReturn.createdAt).toLocaleString('en-IN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: true,
                                            })
                                            : 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 text-center space-x-2">
                                        <button
                                            onClick={() => handleViewDetails(saleReturn.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                            title="View Details"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReturn(saleReturn.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                            title="Delete Return"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md">
                        <p className="text-lg text-gray-600">
                            {filterType === 'All' ? 'No Sale Returns recorded yet.' : `No ${filterType} Sale Returns found.`}
                        </p>
                        <button
                            onClick={() => navigate('/sale-return')} 
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                        >
                            Add New Sale Return
                        </button>
                    </div>
                )}
            </div>

            {/* Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #a7f3d0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #38b2ac;
                }
            `}</style>
        </div>
    );
};

export default SellReturnListPage;