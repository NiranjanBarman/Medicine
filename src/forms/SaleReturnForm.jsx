import React, { useState, useEffect, useCallback } from 'react';
import useCounterSaleStore from '../store/useCounterSaleStore';
import useIndoorSaleStore from '../store/useIndoorSaleStore';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';
import useSaleReturnStore from '../store/saleReturnStore';
import { useNavigate } from 'react-router-dom';

const SaleReturnForm = () => {
    // --- State Variables ---
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [type, setType] = useState('CounterSale'); // Default to CounterSale
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState('');
    const [patientCategory, setPatientCategory] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [sex, setSex] = useState('');
    const [age, setAge] = useState('');
    const [patientAddress, setPatientAddress] = useState('');
    const [state, setState] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [consultantRegNo, setConsultantRegNo] = useState('');
    const [billNo, setBillNo] = useState('');

    const [selectedReturnItemValue, setSelectedReturnItemValue] = useState('');
    const [selectedReturnItemDetails, setSelectedReturnItemDetails] = useState(null);
    const [filteredSaleItemsForDropdown, setFilteredSaleItemsForDropdown] = useState([]);

    // Item-specific states to populate
    const [saleQty, setSaleQty] = useState('');
    const [rate, setRate] = useState('');
    const [mrp, setMrp] = useState('');
    const [discPercent, setDiscPercent] = useState('');
    const [overallDiscPercent, setOverallDiscPercent] = useState('');
    const [prevReturnQty, setPrevReturnQty] = useState('');
    const [returnQty, setReturnQty] = useState('');
    const [unit, setUnit] = useState('');
    const [batchSrlNo, setBatchSrlNo] = useState('');
    const [expDate, setExpDate] = useState('');
    const [barcode, setBarcode] = useState('');
    const [gstIgst, setGstIgst] = useState('');
    const [hsnSac, setHsnSac] = useState('');

    const [discOnItem, setDiscOnItem] = useState(0);
    const [discOnGross, setDiscOnGross] = useState(0);
    const [returnAmount, setReturnAmount] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);
    const [finalReturnAmount, setFinalReturnAmount] = useState(0);

    // --- Stores data ---
    const counterSales = useCounterSaleStore((state) => state.counterSales);
    const indoorSales = useIndoorSaleStore((state) => state.indoorSales);
    const addSaleReturn = useSaleReturnStore((state) => state.addSaleReturn);
    const saleReturns = useSaleReturnStore((state) => state.saleReturns); // Added to get previous returns
    const updateItemStockInPurchase = usePurchaseTransactionStore((state) => state.updateItemStockInPurchase);

    const navigate = useNavigate();

    // Common CSS classes
    const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900";
    const readOnlyInputClass = "w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 text-sm focus:outline-none";
    const labelClass = "block text-blue-700 text-sm font-medium mb-0.5";
    const requiredSpan = <span className="text-red-500">*</span>;

    // Helper functions
    const safeParseFloat = (value) => parseFloat(value || 0) || 0;
    const safeParseInt = (value) => parseInt(value || 0) || 0;

    // Effect to filter items based on 'Type' selection and populate dropdown
    useEffect(() => {
        let itemsToProcess = [];

        if (type === 'CounterSale') {
            itemsToProcess = counterSales;
        } else if (type === 'Indoor') {
            itemsToProcess = indoorSales;
        }

        let itemsForDropdown = [];

        if (Array.isArray(itemsToProcess)) {
            itemsToProcess.forEach(sale => {
                if (Array.isArray(sale.items)) {
                    const itemsWithSaleInfo = sale.items.map(item => ({
                        ...item,
                        originalSaleTransactionId: sale.id,
                        originalSaleBillNo: sale.billNo,
                        saleDate: sale.saleDate,
                        patientName: sale.patientName || sale.customerName || '',
                        patientId: sale.patientId || '',
                        patientCategory: sale.category || '',
                        contactNo: sale.mobileNo || sale.contactNo || '',
                        sex: sale.sex || '',
                        age: sale.age || '',
                        patientAddress: sale.patientAddress || sale.address || '',
                        state: sale.state || '',
                        doctorName: sale.doctorName || '',
                        consultantRegNo: sale.consultantRegNo || '',
                        saleQty: item.totalSoldQty !== undefined && item.totalSoldQty !== null
                            ? safeParseInt(item.totalSoldQty)
                            : (safeParseInt(item.stripQty) * safeParseInt(item.packing || 1)) + safeParseInt(item.looseQty),
                        saleRate: item.saleRate || item.saleRateStrip || 0,
                        mrp: item.mrp || 0,
                        discPercent: item.discountPercent || item.discPercent || 0,
                        overallDiscPercent: sale.overallDiscountPercent || 0,
                        unit: item.saleUnit || item.unit || '',
                        batchSrlNo: item.batchSrlNo || '',
                        expDate: item.expDate || '',
                        barcode: item.barcode || '',
                        gstIgst: item.gstIgst,
                        hsnSac: item.hsnSac,
                    }));
                    itemsForDropdown = [...itemsForDropdown, ...itemsWithSaleInfo];
                }
            });
        }

        const uniqueItemsMap = new Map();
        itemsForDropdown.forEach(item => {
            const uniqueKey = `${item.id}-${item.batchSrlNo || 'N/A'}-${item.originalSaleTransactionId}`;
            if (!uniqueItemsMap.has(uniqueKey)) {
                uniqueItemsMap.set(uniqueKey, item);
            }
        });

        const finalFilteredItems = Array.from(uniqueItemsMap.values());
        finalFilteredItems.sort((a, b) => (a.nameOfItemMedicine || '').localeCompare(b.nameOfItemMedicine || ''));

        setFilteredSaleItemsForDropdown(finalFilteredItems);
        setSelectedReturnItemValue('');
        setSelectedReturnItemDetails(null);
        setSaleQty(''); setRate(''); setMrp(''); setDiscPercent(''); setOverallDiscPercent('');
        setPrevReturnQty(''); setReturnQty(''); setUnit(''); setBatchSrlNo(''); setExpDate(''); setBarcode('');
        setDiscOnItem(0); setDiscOnGross(0); setReturnAmount(0);
        setGstAmount(0);
        setFinalReturnAmount(0);
        setHsnSac('');

        setDate(new Date().toISOString().slice(0, 10));
        setPatientName(''); setPatientId(''); setPatientCategory(''); setMobileNo('');
        setSex(''); setAge(''); setPatientAddress(''); setState(''); setDoctorName('');
        setConsultantRegNo(''); setBillNo('');

    }, [type, counterSales, indoorSales]);

    const handleTypeChange = (e) => {
        setType(e.target.value);
    };

    const calculateReturnAmounts = useCallback((qty, itemRate, itemDiscPercent, overallSaleDiscPercent, itemGstIgst) => {
        const parsedQty = safeParseInt(qty);
        const parsedRate = safeParseFloat(itemRate);
        const parsedItemDiscPercent = safeParseFloat(itemDiscPercent);
        const parsedOverallSaleDiscPercent = safeParseFloat(overallSaleDiscPercent);
        const parsedGstIgst = safeParseFloat(itemGstIgst);

        let calculatedSubTotal = parsedQty * parsedRate;
        let calculatedDiscOnItem = calculatedSubTotal * (parsedItemDiscPercent / 100);
        let amountAfterItemDisc = calculatedSubTotal - calculatedDiscOnItem;

        let calculatedDiscOnGross = amountAfterItemDisc * (parsedOverallSaleDiscPercent / 100);
        let amountAfterAllDiscounts = amountAfterItemDisc - calculatedDiscOnGross;

        let calculatedGstAmount = 0;
        if (parsedGstIgst > 0) {
            calculatedGstAmount = amountAfterAllDiscounts * (parsedGstIgst / 100);
        }

        let calculatedNetReturnAmount = amountAfterAllDiscounts + calculatedGstAmount;

        setDiscOnItem(calculatedDiscOnItem);
        setDiscOnGross(calculatedDiscOnGross);
        setReturnAmount(amountAfterAllDiscounts);
        setGstAmount(calculatedGstAmount);
        setFinalReturnAmount(calculatedNetReturnAmount);

    }, []);

    const handleItemSelect = (e) => {
        const selectedValue = e.target.value;
        setSelectedReturnItemValue(selectedValue);
        const foundItem = filteredSaleItemsForDropdown.find(item => {
            const uniqueKey = `${item.id}-${item.batchSrlNo || 'N/A'}-${item.originalSaleTransactionId}`;
            return uniqueKey === selectedValue;
        });
        setSelectedReturnItemDetails(foundItem);

        if (foundItem) {
            setDate(foundItem.saleDate || new Date().toISOString().slice(0, 10));
            setPatientName(foundItem.patientName || '');
            setPatientId(foundItem.patientId || '');
            setPatientCategory(foundItem.patientCategory || '');
            setMobileNo(foundItem.contactNo || '');
            setSex(foundItem.sex || '');
            setAge(foundItem.age || '');
            setPatientAddress(foundItem.patientAddress || '');
            setState(foundItem.state || '');
            setDoctorName(foundItem.doctorName || '');
            setConsultantRegNo(foundItem.consultantRegNo || '');
            setBillNo(foundItem.originalSaleBillNo || '');

            setSaleQty(foundItem.saleQty || '');
            setRate(foundItem.saleRate || foundItem.saleRateStrip || '');
            setMrp(foundItem.mrp || '');
            setDiscPercent(foundItem.discPercent || 0);
            setOverallDiscPercent(foundItem.overallDiscPercent || 0);
            setUnit(foundItem.unit || foundItem.saleUnit || '');
            setBatchSrlNo(foundItem.batchSrlNo || '');
            setExpDate(foundItem.expDate || '');
            setBarcode(foundItem.barcode || '');
            setGstIgst(foundItem.gstIgst || 0);
            setHsnSac(foundItem.hsnSac || '');

            // FIX: Calculate previously returned quantity for this item
            const previouslyReturnedQty = saleReturns
                .filter(
                    (returnItem) =>
                        returnItem.originalSaleTransactionId === foundItem.originalSaleTransactionId &&
                        returnItem.returnedItem.itemId === foundItem.id &&
                        returnItem.returnedItem.batchSrlNo === foundItem.batchSrlNo
                )
                .reduce((total, returnItem) => total + safeParseInt(returnItem.returnedItem.returnQty), 0);
            
            setPrevReturnQty(previouslyReturnedQty);
            
            const maxReturnableQty = safeParseInt(foundItem.saleQty) - previouslyReturnedQty;
            
            // Set default returnQty to 1 if available, otherwise 0
            setReturnQty(Math.max(0, Math.min(1, maxReturnableQty)));
            
            calculateReturnAmounts(
                Math.max(0, Math.min(1, maxReturnableQty)),
                foundItem.saleRate || foundItem.saleRateStrip,
                foundItem.discPercent,
                foundItem.overallDiscPercent,
                foundItem.gstIgst
            );
        } else {
            setDate(new Date().toISOString().slice(0, 10));
            setPatientName(''); setPatientId(''); setPatientCategory(''); setMobileNo('');
            setSex(''); setAge(''); setAge(''); setPatientAddress(''); setState(''); setDoctorName('');
            setConsultantRegNo(''); setBillNo('');
            setSaleQty(''); setRate(''); setMrp(''); setDiscPercent(''); setOverallDiscPercent('');
            setPrevReturnQty(''); setReturnQty(''); setUnit(''); setBatchSrlNo(''); setExpDate(''); setBarcode('');
            setDiscOnItem(0); setDiscOnGross(0); setReturnAmount(0);
            setGstAmount(0);
            setFinalReturnAmount(0);
            setGstIgst('');
            setHsnSac('');
        }
    };

    const handleReturnQtyChange = (e) => {
        const newQty = safeParseInt(e.target.value);
        const availableQtyForReturn = safeParseInt(saleQty) - safeParseInt(prevReturnQty);

        if (newQty < 0) {
            // DO NOT use alert(), use a modal or a message box instead
            console.warn("Return quantity cannot be negative.");
            setReturnQty(0);
            calculateReturnAmounts(0, rate, discPercent, overallDiscPercent, gstIgst);
            return;
        }

        if (newQty > availableQtyForReturn) {
            // DO NOT use alert(), use a modal or a message box instead
            console.warn(`Return quantity (${newQty}) exceeds available quantity (${availableQtyForReturn}). Max allowed return: ${availableQtyForReturn}.`);
            setReturnQty(availableQtyForReturn);
            calculateReturnAmounts(availableQtyForReturn, rate, discPercent, overallDiscPercent, gstIgst);
            return;
        }

        setReturnQty(newQty);
        calculateReturnAmounts(newQty, rate, discPercent, overallDiscPercent, gstIgst);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedReturnItemDetails || !returnQty || returnQty <= 0) {
            // DO NOT use alert(), use a modal or a message box instead
            console.warn("Please select an item and enter a valid return quantity.");
            return;
        }

        const newSaleReturn = {
            id: crypto.randomUUID(),
            returnDate: new Date().toISOString(),
            saleType: type,
            originalSaleTransactionId: selectedReturnItemDetails.originalSaleTransactionId,
            originalSaleBillNo: billNo,
            patientName: patientName,
            patientId: patientId,
            patientCategory: patientCategory,
            mobileNo: mobileNo,
            sex: sex,
            age: age,
            patientAddress: patientAddress,
            state: state,
            doctorName: doctorName,
            consultantRegNo: consultantRegNo,
            
            returnedItem: {
                itemId: selectedReturnItemDetails.id,
                nameOfItemMedicine: selectedReturnItemDetails.nameOfItemMedicine,
                batchSrlNo: batchSrlNo,
                expDate: expDate,
                barcode: barcode,
                unit: unit,
                saleQty: safeParseInt(saleQty),
                rate: safeParseFloat(rate),
                mrp: safeParseFloat(mrp),
                discPercent: safeParseFloat(discPercent),
                overallDiscPercent: safeParseFloat(overallDiscPercent),
                prevReturnQty: safeParseInt(prevReturnQty),
                returnQty: safeParseInt(returnQty),
                discOnItem: discOnItem,
                discOnGross: discOnGross,
                itemReturnAmount: returnAmount,
                gstIgst: safeParseFloat(gstIgst),
                hsnSac: hsnSac,
                netReturnAmount: finalReturnAmount,
            },
            totalReturnAmount: finalReturnAmount,
            createdAt: new Date().toISOString(),
        };

        try {
            addSaleReturn(newSaleReturn);
            updateItemStockInPurchase({
                nameOfItemMedicine: selectedReturnItemDetails.nameOfItemMedicine,
                batchSrlNo: batchSrlNo,
                expDate: expDate,
            }, safeParseInt(returnQty), 'add');
            // DO NOT use alert(), use a modal or a message box instead
            console.log("Sale return successfully processed!");
            console.log("New Return Saved:", newSaleReturn);
            navigate(`/sale-return-voucher/${newSaleReturn.id}`);

            // Reset states
            setSelectedReturnItemValue('');
            setSelectedReturnItemDetails(null);
            setDate(new Date().toISOString().slice(0, 10));
            setType('CounterSale');
            setPatientName(''); setPatientId(''); setPatientCategory(''); setMobileNo('');
            setSex(''); setAge(''); setPatientAddress(''); setState(''); setDoctorName('');
            setConsultantRegNo(''); setBillNo('');
            setSaleQty(''); setRate(''); setMrp(''); setDiscPercent(''); setOverallDiscPercent('');
            setPrevReturnQty(''); setReturnQty(''); setUnit(''); setBatchSrlNo(''); setExpDate(''); setBarcode('');
            setDiscOnItem(0); setDiscOnGross(0); setReturnAmount(0);
            setGstAmount(0);
            setFinalReturnAmount(0);
            setGstIgst('');
            setHsnSac('');
        } catch (error) {
            console.error("Error processing sale return:", error);
            // DO NOT use alert(), use a modal or a message box instead
            console.warn("Error processing sale return. Please try again.");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-blue-800 text-center">SALE RETURN COUNTER/INDOOR</h1>
                <button
                    type="button"
                    onClick={() => navigate('/view-sale-returns')} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    View Sale Return Items
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
                    <div>
                        <label htmlFor="returnDate" className={labelClass}>Return Date {requiredSpan}</label>
                        <input
                            type="date"
                            id="returnDate"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="saleType" className={labelClass}>Sale Type {requiredSpan}</label>
                        <select
                            id="saleType"
                            value={type}
                            onChange={handleTypeChange}
                            className={inputClass}
                            required
                        >
                            <option value="CounterSale">Counter Sale</option>
                            <option value="Indoor">Indoor Sale</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="originalBillNo" className={labelClass}>Original Bill No.</label>
                        <input
                            type="text"
                            id="originalBillNo"
                            value={billNo}
                            readOnly
                            className={readOnlyInputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="patientName" className={labelClass}>Patient/Customer Name</label>
                        <input
                            type="text"
                            id="patientName"
                            value={patientName}
                            readOnly
                            className={readOnlyInputClass}
                        />
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-md shadow-sm border border-green-200">
                    <h2 className="text-lg font-semibold text-green-700 mb-4">Item Details for Return</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label htmlFor="selectItem" className={labelClass}>Select Item/Medicine to Return {requiredSpan}</label>
                            <select
                                id="selectItem"
                                value={selectedReturnItemValue}
                                onChange={handleItemSelect}
                                className={inputClass}
                                required
                            >
                                <option value="">-- Select an item from previous sales --</option>
                                {filteredSaleItemsForDropdown.map((item) => {
                                    const displayBatch = item.batchSrlNo ? ` (Batch: ${item.batchSrlNo})` : '';
                                    const displayExpDate = item.expDate ? ` (Exp: ${item.expDate})` : '';
                                    const uniqueKey = `${item.id}-${item.batchSrlNo || 'N/A'}-${item.originalSaleTransactionId}`;
                                    return (
                                        <option key={uniqueKey} value={uniqueKey}>
                                            {item.nameOfItemMedicine} - Bill No: {item.originalSaleBillNo} - Sale Date: {item.saleDate} {displayBatch} {displayExpDate}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="saleQty" className={labelClass}>Sold Qty (Original Sale)</label>
                            <input
                                type="text"
                                id="saleQty"
                                value={saleQty}
                                readOnly
                                className={readOnlyInputClass}
                            />
                        </div>
                    </div>
                    {selectedReturnItemDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div>
                                <label htmlFor="itemRate" className={labelClass}>Rate (per unit)</label>
                                <input type="text" id="itemRate" value={rate} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemMrp" className={labelClass}>MRP</label>
                                <input type="text" id="itemMrp" value={mrp} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemDiscPercent" className={labelClass}>Item Disc (%)</label>
                                <input type="text" id="itemDiscPercent" value={discPercent} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemOverallDiscPercent" className={labelClass}>Overall Disc (%)</label>
                                <input type="text" id="itemOverallDiscPercent" value={overallDiscPercent} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemUnit" className={labelClass}>Unit</label>
                                <input type="text" id="itemUnit" value={unit} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemBatch" className={labelClass}>Batch/Srl No.</label>
                                <input type="text" id="itemBatch" value={batchSrlNo} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemExpDate" className={labelClass}>Exp. Date</label>
                                <input type="text" id="itemExpDate" value={expDate} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemBarcode" className={labelClass}>Barcode</label>
                                <input type="text" id="itemBarcode" value={barcode} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemHsnSac" className={labelClass}>HSN/SAC</label>
                                <input type="text" id="itemHsnSac" value={hsnSac} readOnly className={readOnlyInputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemGstIgst" className={labelClass}>GST/IGST (%)</label>
                                <input type="text" id="itemGstIgst" value={gstIgst} readOnly className={readOnlyInputClass} />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4 border-gray-200">
                        <div>
                            <label htmlFor="prevReturnQty" className={labelClass}>Previously Returned Qty</label>
                            <input
                                type="number"
                                id="prevReturnQty"
                                value={prevReturnQty}
                                readOnly
                                className={readOnlyInputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="returnQty" className={labelClass}>Return Qty {requiredSpan}</label>
                            <input
                                type="number"
                                id="returnQty"
                                value={returnQty}
                                onChange={handleReturnQtyChange}
                                className={inputClass}
                                min="0"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="availableQty" className={labelClass}>Available Qty to Return</label>
                            <input
                                type="text"
                                id="availableQty"
                                value={selectedReturnItemDetails ? (safeParseInt(selectedReturnItemDetails.saleQty) - safeParseInt(prevReturnQty)) : ''}
                                readOnly
                                className={readOnlyInputClass}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md shadow-sm border border-yellow-200">
                    <h2 className="text-lg font-semibold text-yellow-700 mb-4">Return Amount Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Discount on Item (₹)</label>
                            <input type="text" value={discOnItem.toFixed(2)} readOnly className={readOnlyInputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Discount on Gross (₹)</label>
                            <input type="text" value={discOnGross.toFixed(2)} readOnly className={readOnlyInputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Return Amount (Before GST) (₹)</label>
                            <input type="text" value={returnAmount.toFixed(2)} readOnly className={readOnlyInputClass} />
                        </div>
                        <div>
                           <label className={labelClass}>GST Amount (₹)</label>
                            <input type="text" value={gstAmount.toFixed(2)} readOnly className={readOnlyInputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={`${labelClass} font-bold text-lg`}>Final Return Amount (₹)</label>
                            <input type="text" value={finalReturnAmount.toFixed(2)} readOnly className={`${readOnlyInputClass} text-xl font-bold text-blue-800`} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/sales-returns')}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Process Return
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SaleReturnForm;
