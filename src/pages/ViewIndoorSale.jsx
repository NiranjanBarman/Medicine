// src/components/ViewIndoorSale.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useIndoorSaleStore from '../store/useIndoorSaleStore'; // Ensure this path is correct

const ViewIndoorSale = () => {
    const navigate = useNavigate();
    const indoorSales = useIndoorSaleStore((state) => state.indoorSales);

    // Helper function to format amount to 2 decimal places
    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : (0).toFixed(2);
    };

    // Helper function to format date and time - Identical to ViewCounterSaleItem
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string provided to formatDateTime:', isoString);
                return 'Invalid Date'; // Consistent with ViewCounterSaleItem
            }
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch (error) {
            console.error("Error formatting date:", isoString, error);
            return 'Error Formatting Date'; // Consistent with ViewCounterSaleItem
        }
    };

    // Helper component for a super compact detail row (Identical to ViewCounterSaleItem)
    const CompactDetail = ({ label, value, isAmount = false, isTotal = false, className = '' }) => {
        const displayValue = isAmount ? `₹${formatAmount(value)}` : (value ?? 'N/A');
        return (
            <div className={`flex items-baseline ${className}`}>
                <span className="font-medium text-gray-700 text-xs mr-1">{label}:</span> 
                <span className={`${isTotal ? 'font-bold text-base text-green-700' : 'text-gray-800 text-sm'}`}>
                    {displayValue}
                </span>
            </div>
        );
    };

    // Sort sales by date in descending order (most recent first) and then by billNo
    const sortedSales = [...indoorSales].sort((a, b) => {
        const dateA = new Date(a.saleDate);
        const dateB = new Date(b.saleDate);
        if (dateA < dateB) return 1;
        if (dateA > dateB) return -1;
        // Secondary sort by billNo (case-insensitive for robustness)
        return (a.billNo || '').localeCompare(b.billNo || '', undefined, { sensitivity: 'base' }); 
    });

    return (
        // Outermost container - No scrolling here
        <div className="bg-white p-6 rounded-lg shadow-xl mx-auto my-4 border border-gray-100 text-gray-900  font-sans">
            {/* Removed the main header section */}

            {/* Scrollable Content Wrapper - This section will scroll */}
            <div className="space-y-8 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar"> {/* Adjusted max-height */}
                {sortedSales.length > 0 ? (
                    sortedSales.map((sale) => (
                        // Individual sale block - now with the same styling as ViewCounterSaleItem
                        <div key={sale.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                            {/* Header for each sale with dynamic bill number and back button */}
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-teal-800">
                                    Sale Bill No: <span className="text-blue-600">{sale.billNo || 'N/A'}</span>
                                </h3>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => navigate('/indoor-sales-list')}
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center text-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                        </svg>
                                        Go back to Sales List
                                    </button>

                                    <button
                                        onClick={() => navigate(`/print-indoor/${sale.id}`)}
                                        className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition text-sm"
                                    >
                                        View Invoice
                                    </button>
                                </div>
                            </div>

                            
                            {/* Patient/Customer and Sale Header Information - Identical compact structure */}
                            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
                                <h4 className="text-lg font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Sale Overview</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5">
                                    <CompactDetail label="Date & Time" value={formatDateTime(sale.saleDate)} />
                                    <CompactDetail label="Type" value={sale.saleType || 'Indoor Sale'} />
                                    <CompactDetail label="Customer" value={sale.customerName || sale.patientName} />
                                    <CompactDetail label="Patient ID" value={sale.patientId || sale.pnNo} />
                                    <CompactDetail label="Category" value={sale.category} />
                                    <CompactDetail label="Contact No." value={sale.contactNo} />
                                    <CompactDetail label="Sex" value={sale.sex} />
                                    <CompactDetail label="Age" value={sale.age} />
                                    <CompactDetail label="State" value={sale.state} />
                                    <CompactDetail label="Doctor" value={sale.doctorName} />
                                    <CompactDetail label="Consultant Reg. No." value={sale.consultantRegNo} />
                                    <CompactDetail label="Bed Details" value={sale.bedDetails} />
                                    
                                    {sale.cashAmount !== undefined && <CompactDetail label="Cash" value={sale.cashAmount} isAmount />}
                                    {sale.cardAmount !== undefined && <CompactDetail label="Card" value={sale.cardAmount} isAmount />}
                                    {sale.upiAmount !== undefined && <CompactDetail label="UPI" value={sale.upiAmount} isAmount />}
                                    {sale.onlineAmount !== undefined && <CompactDetail label="Online" value={sale.onlineAmount} isAmount />}
                                    {sale.creditAmount !== undefined && <CompactDetail label="Credit" value={sale.creditAmount} isAmount />}

                                    <CompactDetail label="Address" value={sale.address} className="col-span-full mt-1 pt-1 border-t border-blue-100" />
                                    <CompactDetail label="Remarks" value={sale.remarks} className="col-span-full" />
                                    
                                    <div className="col-span-full grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t-2 border-blue-200">
                                        <CompactDetail label="Total Qty" value={sale.totalSaleQty} />
                                        
                                        <CompactDetail label="Total Amount" value={sale.netAmount} isAmount isTotal className="text-right" />
                                        <CompactDetail label="Overall Discount" value={`${sale.bulkDiscountPercentApplied || 0}%`} />
                                        <CompactDetail label="Paid Amount" value={sale.amountPaid} isAmount isTotal className="text-right" />
                                    </div>
                                </div>
                            </div>

                            {/* Items Sold Table - Identical structure and columns to ViewCounterSaleItem */}
                            <h4 className="text-xl font-semibold text-teal-700 mb-4 border-b pb-2">Items Sold ({sale.items?.length || 0} Items)</h4>
                            {sale.items && Array.isArray(sale.items) && sale.items.length > 0 ? (
                                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                                    <table className="min-w-full bg-white text-sm">
                                        <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-3 py-2 border-b text-left">Item Name (Formulation)</th>
                                                <th className="px-3 py-2 border-b text-left">Batch No</th>
                                                <th className="px-3 py-2 border-b text-left">Exp Date</th>
                                                <th className="px-3 py-2 border-b text-left">Strip Qty</th>
                                                <th className="px-3 py-2 border-b text-left">Loose Qty</th>
                                                <th className="px-3 py-2 border-b text-right">Unit Price (Strip)</th>
                                                <th className="px-3 py-2 border-b text-right">MRP</th>
                                                <th className="px-3 py-2 border-b text-right">GST%</th>
                                                <th className="px-3 py-2 border-b text-right">Disc%</th>
                                                <th className="px-3 py-2 border-b text-right">Free Qty</th>
                                                <th className="px-3 py-2 border-b text-right">Pure Free Qty</th>
                                                <th className="px-3 py-2 border-b text-right">C.F. Qty</th>
                                                <th className="px-3 py-2 border-b text-left">Unit</th>
                                                <th className="px-3 py-2 border-b text-left">C.F. Unit</th>
                                                <th className="px-3 py-2 border-b text-left">HSN/SAC</th>
                                                <th className="px-3 py-2 border-b text-left">Packaging</th>
                                                <th className="px-3 py-2 border-b text-left">Barcode</th>
                                                <th className="px-3 py-2 border-b text-left">Drug Schedule</th>
                                                <th className="px-3 py-2 border-b text-right">Net Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale.items.map((item, index) => (
                                                <tr key={item.saleEntryId || index} className="hover:bg-gray-50 text-gray-800">
                                                    <td className="px-3 py-2 border-b">{item.nameOfItemMedicine || 'N/A'} {item.formulation ? `(${item.formulation})` : ''}</td>
                                                    <td className="px-3 py-2 border-b">{item.batchSrlNo || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.expDate || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.stripQty ?? 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.looseQty ?? 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">₹{formatAmount(item.saleRateStrip)}</td>
                                                    <td className="px-3 py-2 border-b">₹{formatAmount(item.mrp)}</td>
                                                    <td className="px-3 py-2 border-b">{item.gstIgst ?? 'N/A'}%</td>
                                                    <td className="px-3 py-2 border-b">{item.discountPercent ?? 'N/A'}%</td>
                                                    <td className="px-3 py-2 border-b">{item.freeQty ?? '0'}</td>
                                                    <td className="px-3 py-2 border-b">{item.pureFreeQuantity ?? '0'}</td>
                                                    <td className="px-3 py-2 border-b">{item.cfQty ?? '0'}</td>
                                                    <td className="px-3 py-2 border-b">{item.saleUnit || '0'}</td>
                                                    <td className="px-3 py-2 border-b">{item.cfUnit || '0'}</td>
                                                    <td className="px-3 py-2 border-b">{item.hsnSac || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.packaging || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.barcode || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">{item.drugSchedule || 'N/A'}</td>
                                                    <td className="px-3 py-2 border-b">₹{formatAmount(item.netAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-600 italic text-center p-4 border rounded-md bg-white">No items found for this sale.</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md">
                        <p className="text-lg text-gray-600">No Indoor Sales found.</p>
                        <button
                            onClick={() => navigate('/sell-items-list')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                        >
                            Go back to Sales List
                        </button>
                    </div>
                )}
            </div> 
            
            {/* Custom Scrollbar Styling (can be put in a global CSS file or <style> tag) */}
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
                    background: #a7f3d0; /* Tailwind teal-200 */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #38b2ac; /* Tailwind teal-500 */
                }
            `}</style>
        </div>
    );
};

export default ViewIndoorSale;