import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useIndoorSaleStore from '../store/useIndoorSaleStore';

// const safeParseFloat = (value) => parseFloat(value || 0) || 0;

const IndoorSalesList = () => {
    const navigate = useNavigate();
    const { indoorSales, deleteIndoorSale } = useIndoorSaleStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');

    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : (0).toFixed(2);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this Indoor Sale record? This action cannot be undone.')) {
            deleteIndoorSale(id);
            alert('Indoor Sale record deleted successfully!');
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/view-indoor-sale/${id}`);
    };

    const handlePay = (saleId) => {
        navigate(`/indoor-sale/pay/${saleId}`);
    };
    
    const handleBulkPayment = () => {
        navigate("/indoor-bulk-payment");
    };

    const filteredSales = useMemo(() => {
        return indoorSales.filter(sale => {
            const matchesSearch = searchTerm === '' ||
                sale.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPaymentStatus = filterPaymentStatus === 'All' ||
                (filterPaymentStatus === 'Paid' && sale.isPaid) ||
                (filterPaymentStatus === 'Unpaid' && !sale.isPaid);

            return matchesSearch && matchesPaymentStatus;
        });
    }, [indoorSales, searchTerm, filterPaymentStatus]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-indigo-800">Indoor Sales List</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={handleBulkPayment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center"
                    >
                        Bulk Payment
                    </button>
                    <button
                        onClick={() => navigate('/indoor-sale')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        ADD/BACK INDOOR SALE
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Bill No., Customer Name, Patient ID, Doctor, or Remarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                 <select
                    value={filterPaymentStatus}
                    onChange={(e) => setFilterPaymentStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="All">All Payment Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                </select>
            </div>

            {filteredSales.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg shadow-inner">
                    <p className="text-lg text-gray-600">No Indoor Sale records found.</p>
                    <p className="text-sm text-gray-500 mt-2">Try adding a new indoor sale or adjusting your search filters.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-b text-left">Bill No.</th>
                                <th className="px-3 py-2 border-b text-left">Sale Date</th>
                                <th className="px-3 py-2 border-b text-left">Customer Name</th>
                                <th className="px-3 py-2 border-b text-right">Total Qty</th> {/* New Column */}
                                <th className="px-3 py-2 border-b text-right">Total Amount</th>
                                <th className="px-3 py-2 border-b text-right">Paid Amount</th> {/* New Column */}
                                <th className="px-3 py-2 border-b text-right">Due Amount</th> {/* New Column */}
                                <th className="px-3 py-2 border-b text-left">Status</th>
                                <th className="px-3 py-2 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 text-gray-800">
                                    <td className="px-3 py-2 border-b">{sale.billNo}</td>
                                    <td className="px-3 py-2 border-b">{sale.saleDate}</td>
                                    <td className="px-3 py-2 border-b">{sale.customerName}</td>
                                    <td className="px-3 py-2 border-b text-right">{sale. totalSaleQty ? sale. totalSaleQty.toFixed(2) : '0.00'}</td> {/* Display Total Quantity */}
                                    <td className="px-3 py-2 border-b text-right">₹{formatAmount(sale.netAmount)}</td>
                                    <td className="px-3 py-2 border-b text-right">₹{formatAmount(sale.amountPaid)}</td> {/* Display Paid Amount */}
                                    <td className="px-3 py-2 border-b text-right">₹{formatAmount(sale.balanceDue)}</td> {/* Display Due Amount */}
                                    <td className="px-3 py-2 border-b">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {sale.isPaid ? 'Paid' : `Due`}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(sale.id)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                                title="View Details"
                                            >
                                                View
                                            </button>
                                            {!sale.isPaid && (
                                                <button
                                                    onClick={() => handlePay(sale.id)}
                                                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                    title="Record Payment"
                                                >
                                                    Pay
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(sale.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                title="Delete Sale Record"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default IndoorSalesList;
