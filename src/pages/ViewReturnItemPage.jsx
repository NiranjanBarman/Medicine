// src/components/ViewReturnItemPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSaleReturnStore from '../store/saleReturnStore'; // Ensure this path is correct

const ViewReturnItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const allSaleReturns = useSaleReturnStore((state) => state.saleReturns);
    const [saleReturn, setSaleReturn] = useState(null);

    // Helper function to format amount to 2 decimal places - Consistent with other views
    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : (0.00).toFixed(2);
    };

    // Helper function to format date and time - Consistent with other views
    // const formatDateTime = (isoString) => {
    //     if (!isoString) return 'N/A';
    //     try {
    //         const date = new Date(isoString);
    //         if (isNaN(date.getTime())) {
    //             console.warn('Invalid date string provided to formatDateTime:', isoString);
    //             return 'Invalid Date';
    //         }
    //         return date.toLocaleString('en-IN', {
    //             year: 'numeric',
    //             month: '2-digit', // Changed back to '2-digit' for consistency in date display
    //             day: '2-digit',   // Changed back to '2-digit' for consistency in date display
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             second: '2-digit',
    //             hour12: true,
    //         });
    //     } catch (error) {
    //         console.error("Error formatting date:", isoString, error);
    //         return 'N/A';
    //     }
    // };

    // Helper component for a super compact detail row - Identical to ViewCounterSaleItem/ViewIndoorSale
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

    useEffect(() => {
        const foundReturn = allSaleReturns.find(
            (sr) => String(sr.id) === String(id)
        );

        if (foundReturn) {
            setSaleReturn(foundReturn);
        } else {
            alert('Sale Return not found!');
            navigate('/sale-return-list'); // Navigate back to the list if not found, consistent with SellReturnListPage
        }
    }, [id, allSaleReturns, navigate]);

    if (!saleReturn) {
        return (
            <div className="text-center p-6 bg-white rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
                <p className="text-lg text-gray-600">Loading Sale Return details or no data found...</p>
            </div>
        );
    }

    // Access the single returned item object
    const returnedItem = saleReturn.returnedItem;

    if (!returnedItem) {
        return (
            <div className="text-center p-6 bg-white rounded-lg shadow-md mx-auto my-4 border border-gray-200 text-gray-900">
                <p className="text-lg text-gray-600">No returned item details found for this sale return.</p>
                <button
                    onClick={() => navigate('/sale-return-list')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                    Back to Return List
                </button>
            </div>
        );
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow-xl mx-auto my-4 border border-gray-100 text-gray-900 font-sans">
            {/* Header section with title and back button */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-teal-700">Sale Return Details (ID: {saleReturn.id || 'N/A'})</h2>
                <button
                    onClick={() => navigate('/view-sale-returns')} 
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center text-sm"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Return List
                </button>
            </div>

            {/* Sale Return Overview Section - Using CompactDetail and grid layout */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
                <h4 className="text-lg font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Return Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5">
                    <CompactDetail label="Return Date" value={saleReturn.returnDate} /> {/* Use saleReturn.returnDate directly */}
                    <CompactDetail label="Sale Type" value={saleReturn.saleType} /> {/* Corrected: saleReturn.saleType */}
                    <CompactDetail label="Original Bill No." value={saleReturn.originalSaleBillNo} />
                    <CompactDetail label="Patient Name" value={saleReturn.patientName} />
                    <CompactDetail label="Patient ID" value={saleReturn.patientId} /> {/* Corrected: patientId */}
                    <CompactDetail label="Patient Category" value={saleReturn.patientCategory} />
                    <CompactDetail label="Mobile No." value={saleReturn.mobileNo} /> {/* Corrected: mobileNo */}
                    <CompactDetail label="Sex" value={saleReturn.sex} /> {/* Corrected: sex */}
                    <CompactDetail label="Age" value={saleReturn.age} /> {/* Corrected: age */}
                    <CompactDetail label="State" value={saleReturn.state} /> {/* Corrected: state */}
                    <CompactDetail label="Doctor's Name" value={saleReturn.doctorName} />
                    <CompactDetail label="Consultant Reg No." value={saleReturn.consultantRegNo} />
                    {/* Address spanning full width */}
                    <CompactDetail label="Patient Address" value={saleReturn.patientAddress} className="col-span-full mt-1 pt-1 border-t border-blue-100" />
                    
                    {/* Totals at the bottom of the overview section */}
                    <div className="col-span-full grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t-2 border-blue-200">
                        <CompactDetail label="Total Items Returned" value={returnedItem.returnQty || 0} /> {/* Corrected: returnedItem.returnQty */}
                        <CompactDetail label="Total Return Amount" value={saleReturn.totalReturnAmount} isAmount isTotal className="text-right" /> {/* Corrected: saleReturn.totalReturnAmount directly */}
                    </div>
                </div>
            </div>

            {/* Returned Item Details - Accessing directly from 'returnedItem' */}
            <h3 className="text-xl font-semibold text-teal-700 mt-6 mb-4 border-b pb-2">Returned Item Details</h3>
            {returnedItem ? (
                <div className="overflow-x-auto border border-gray-300 rounded-md shadow-sm">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2 border-b text-left">Item Name (Formulation)</th>
                                <th className="px-3 py-2 border-b text-left">Batch/Srl No.</th>
                                <th className="px-3 py-2 border-b text-left">Exp. Date</th>
                                <th className="px-3 py-2 border-b text-left">Barcode</th>
                                <th className="px-3 py-2 border-b text-right">Sale Qty.</th>
                                <th className="px-3 py-2 border-b text-right">Rate</th>
                                <th className="px-3 py-2 border-b text-right">MRP</th>
                                <th className="px-3 py-2 border-b text-right">Item Disc. (%)</th> {/* Clarified name */}
                                <th className="px-3 py-2 border-b text-right">Overall Disc. (%)</th> {/* Clarified name */}
                                <th className="px-3 py-2 border-b text-right">Prev. Return Qty.</th>
                                <th className="px-3 py-2 border-b text-right">Return Qty.</th>
                                <th className="px-3 py-2 border-b text-left">Unit</th>
                                <th className="px-3 py-2 border-b text-right">Disc. (On Item)</th>
                                <th className="px-3 py-2 border-b text-right">Disc. (On Gross)</th>
                                <th className="px-3 py-2 border-b text-right">GST/IGST (%)</th> {/* Added GST/IGST percentage */}
                                <th className="px-3 py-2 border-b text-right">GST Amount</th> {/* Added GST Amount */}
                                <th className="px-3 py-2 border-b text-right">Net Return Amount</th> {/* Updated to Net Return Amount (incl. GST) */}
                            </tr>
                        </thead>
                        <tbody>
                            {/* No map needed, directly use returnedItem */}
                            <tr key={returnedItem.id || 'single-item'} className="hover:bg-gray-50 text-gray-800">
                                <td className="px-3 py-2 border-b">{returnedItem.nameOfItemMedicine || 'N/A'}</td> {/* Corrected: Formulation might not be in the stored item */}
                                <td className="px-3 py-2 border-b">{returnedItem.batchSrlNo || 'N/A'}</td>
                                <td className="px-3 py-2 border-b">{returnedItem.expDate || 'N/A'}</td>
                                <td className="px-3 py-2 border-b">{returnedItem.barcode || 'N/A'}</td>
                                <td className="px-3 py-2 border-b text-right">{returnedItem.saleQty ?? 'N/A'}</td> {/* Corrected: saleQty */}
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.rate)}</td> {/* Corrected: rate */}
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.mrp)}</td> {/* Corrected: mrp */}
                                <td className="px-3 py-2 border-b text-right">{returnedItem.discPercent ?? 'N/A'}%</td> {/* Corrected: discPercent */}
                                <td className="px-3 py-2 border-b text-right">{returnedItem.overallDiscPercent ?? 'N/A'}%</td> {/* Corrected: overallDiscPercent */}
                                <td className="px-3 py-2 border-b text-right">{returnedItem.prevReturnQty ?? '0'}</td>
                                <td className="px-3 py-2 border-b text-right">{returnedItem.returnQty ?? 'N/A'}</td>
                                <td className="px-3 py-2 border-b">{returnedItem.unit || 'N/A'}</td>
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.discOnItem)}</td>
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.discOnGross)}</td>
                                <td className="px-3 py-2 border-b text-right">{returnedItem.gstIgst ?? 'N/A'}%</td> {/* Added GST/IGST % */}
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.gstAmount)}</td> {/* Added GST Amount */}
                                <td className="px-3 py-2 border-b text-right">₹{formatAmount(returnedItem.netReturnAmount)}</td> {/* Corrected: netReturnAmount */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600 italic text-center p-4 border rounded-md bg-white">No items found for this return.</p>
            )}
        </div>
    );
};

export default ViewReturnItemPage;