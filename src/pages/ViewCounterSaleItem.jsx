import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCounterSaleStore from '../store/useCounterSaleStore';

const ViewCounterSaleItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const getCounterSaleById = useCounterSaleStore((state) => state.getCounterSaleById); 

    const [saleDetails, setSaleDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : (0).toFixed(2);
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string provided to formatDateTime:', isoString);
                return isoString;
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
            return isoString;
        }
    };

    useEffect(() => {
        setIsLoading(true);

        if (!id) {
            console.error('ViewCounterSaleItem: Sale ID not found in URL. Redirecting.');
            alert('Error: Sale ID not found. Redirecting to Sales list.');
            navigate('/view-counter-sales');
            return;
        }

        const foundSale = getCounterSaleById(id);

        if (foundSale) {
            if (foundSale.saleType === 'Counter Sale' || !foundSale.saleType) {
                setSaleDetails(foundSale);
            } else {
                console.error(`ViewCounterSaleItem: Sale ID ${id} found, but type is "${foundSale.saleType}". Expected 'Counter Sale'.`);
                alert('Sale found, but it is not a Counter Sale. Please check other sales lists if applicable. Redirecting.');
                navigate('/view-counter-sales');
            }
        } else {
            console.error(`ViewCounterSaleItem: No Counter Sale with ID: ${id} found in store.`);
            alert('Counter Sale not found. It might have been deleted or the ID is incorrect. Redirecting.');
            navigate('/view-counter-sales');
        }
        setIsLoading(false);
    }, [id, getCounterSaleById, navigate]);

    if (isLoading) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md mx-auto my-8">
                <p className="text-lg text-gray-600">Loading Counter Sale details...</p>
            </div>
        );
    }

    if (!saleDetails && !isLoading) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md mx-auto my-8">
                <p className="text-lg text-red-600">Counter Sale not found or an error occurred.</p>
                <button
                    onClick={() => navigate('/view-counter-sales')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Go back to Sales List
                </button>
            </div>
        );
    }

    // Helper component for a super compact detail row
    const CompactDetail = ({ label, value, isAmount = false, isTotal = false, className = '' }) => {
        const displayValue = isAmount ? `₹${formatAmount(value)}` : (value || 'N/A');
        return (
            <div className={`flex items-baseline ${className}`}>
                <span className="font-medium text-gray-700 text-xs mr-1">{label}:</span> {/* Smaller font for labels */}
                <span className={`${isTotal ? 'font-bold text-base text-green-700' : 'text-gray-800 text-sm'}`}>
                    {displayValue}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl mx-auto my-4 border border-gray-100 text-gray-900 font-sans">
           <div className="flex justify-between items-center mb-6 border-b pb-4">
  <h2 className="text-2xl font-extrabold text-teal-700">Bill No: {saleDetails.billNo || 'N/A'}</h2>
  <div className="flex space-x-2">
    <button
      onClick={() => navigate('/view-counter-sales')}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center text-sm"
    >
      ⬅ Back to Sales
    </button>

    <button
      onClick={() => navigate(`/print-bill/${id}`)}
      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md flex items-center text-sm"
    >
      🧾 Print Invoice
    </button>
  </div>
</div>


            {/* Patient/Customer and Sale Header Information - Extremely Compact Design */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 pb-2 border-b border-blue-200">Sale Overview</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5"> {/* Reduced gap-x and gap-y further */}
                    <CompactDetail label="Date & Time" value={formatDateTime(saleDetails.saleDate)} />
                    <CompactDetail label="Type" value={saleDetails.saleType || 'Counter Sale'} />
                    <CompactDetail label="Customer" value={saleDetails.customerName || saleDetails.patientName} />
                    <CompactDetail label="Patient ID" value={saleDetails.patientId || saleDetails.pnNo} />
                    <CompactDetail label="Category" value={saleDetails.category} />
                    <CompactDetail label="Contact No." value={saleDetails.contactNo} />
                    <CompactDetail label="Sex" value={saleDetails.sex} />
                    <CompactDetail label="Age" value={saleDetails.age} />
                    <CompactDetail label="State" value={saleDetails.state} />
                    <CompactDetail label="Doctor" value={saleDetails.doctorName} />
                    <CompactDetail label="Consultant Reg. No." value={saleDetails.consultantRegNo} />
                    <CompactDetail label="Bed Details" value={saleDetails.bedDetails} />
                    
                    {/* Payment Details - Grouped and using smaller labels */}
                    {saleDetails.cashAmount !== undefined && <CompactDetail label="Cash" value={saleDetails.cashAmount} isAmount />}
                    {saleDetails.cardAmount !== undefined && <CompactDetail label="Card" value={saleDetails.cardAmount} isAmount />}
                    {saleDetails.upiAmount !== undefined && <CompactDetail label="UPI" value={saleDetails.upiAmount} isAmount />}
                    {saleDetails.onlineAmount !== undefined && <CompactDetail label="Online" value={saleDetails.onlineAmount} isAmount />}
                    {saleDetails.creditAmount !== undefined && <CompactDetail label="Credit" value={saleDetails.creditAmount} isAmount />}

                    {/* Address & Remarks - now grouped with totals, always spanning full width */}
                    <CompactDetail label="Address" value={saleDetails.address} className="col-span-full mt-1 pt-1 border-t border-blue-100" /> {/* Added border for visual separation */}
                    <CompactDetail label="Remarks" value={saleDetails.remarks} className="col-span-full" />
                    
                    {/* Totals - More prominent, but still compact */}
                    <div className="col-span-full grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t-2 border-blue-200"> {/* New inner grid for totals */}
                        <CompactDetail label="Total Qty" value={saleDetails.totalQuantity} />
                        <CompactDetail label="Total Amount" value={saleDetails.totalAmount} isAmount isTotal className="text-right" /> {/* Align total amount to right */}
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-teal-700 mb-4 border-b pb-2">Items in this Sale ({saleDetails.items?.length || 0} Items)</h3>
            {saleDetails.items && Array.isArray(saleDetails.items) && saleDetails.items.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
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
                            {saleDetails.items.map((item, index) => (
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
                                    <td className="px-3 py-2 border-b">{item.freeQty || '0'}</td>
                                    <td className="px-3 py-2 border-b">{item.pureFreeQuantity || '0'}</td>
                                    <td className="px-3 py-2 border-b">{item.cfQty || '0'}</td>
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
                <p className="text-gray-600 text-center p-4 border rounded-md bg-white">No items found for this sale.</p>
            )}
        </div>
    );
};

export default ViewCounterSaleItem;