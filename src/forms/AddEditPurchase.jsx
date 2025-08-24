import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useItemMedicineStore from '../store/itemMedicineStore';
import useGenericStore from '../store/genericStore';
import useManufacturerStore from '../store/manufacturerStore';
import useVendorStore from '../store/vendorStore';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';
// import BulkPurchaseEntry from '../forms/BulkPurchaseEntry';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// Constants for dropdown options
const grcTypes = ['CREDIT', 'DEBIT', 'RETURN'];
const units = ['PCS', 'BOX', 'KG', 'LTR', 'ML', 'STRIP', 'BOTTLE', 'PACKET'];

const AddEditPurchase = () => {
    const navigate = useNavigate();
    const { purchaseId } = useParams();

    const items = useItemMedicineStore((state) => state.items);
    const generics = useGenericStore((state) => state.generics);
    const manufacturers = useManufacturerStore((state) => state.manufacturers);
    const vendors = useVendorStore((state) => state.vendors);
    const addPurchaseTransaction = usePurchaseTransactionStore((state) => state.addPurchaseTransaction);
    const updatePurchaseTransaction = usePurchaseTransactionStore((state) => state.updatePurchaseTransaction);
    const purchaseTransactions = usePurchaseTransactionStore((state) => state.purchaseTransactions);

    const [isEditing, setIsEditing] = useState(false);
    const [currentPurchaseId, setCurrentPurchaseId] = useState(null);

    const [date, setDate] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState('');
    const [challanNo, setChallanNo] = useState('');
    const [grcType, setGrcType] = useState('CREDIT');
    const [remarks, setRemarks] = useState('');

    const [nameOfItemMedicine, setNameOfItemMedicine] = useState('');
    const [itemManufacturerMake, setItemManufacturerMake] = useState('');
    const [batchSrlNo, setBatchSrlNo] = useState('');
    const [expDate, setExpDate] = useState('');
    const [unit, setUnit] = useState('');
    const [freeQty, setFreeQty] = useState('');
    const [cfQty, setCfQty] = useState('');
    const [cfUnit, setCfUnit] = useState('');
    const [saleRate, setSaleRate] = useState('');
    const [actualBillableQty, setActualBillableQty] = useState('');
    const [purchaseRate, setPurchaseRate] = useState('');
    const [mrp, setMrp] = useState('');
    const [schDisc, setSchDisc] = useState('');
    const [disc, setDisc] = useState('');
    const [barcode, setBarcode] = useState('');
    const [lastFreeQty, setLastFreeQty] = useState('');
    const [lastDiscount, setLastDiscount] = useState('');
    const [rackDetails, setRackDetails] = useState('');
    const [drugSchedule, setDrugSchedule] = useState('');
    const [hsnSac, setHsnSac] = useState('');
    const [gstIgst, setGstIgst] = useState('');
    const [packaging, setPackaging] = useState('');
    const [strength, setStrength] = useState('');
    const [formulation, setFormulation] = useState('');
    const [tradeName, setTradeName] = useState('');
    const [purchaseQuantity, setPurchaseQuantity] = useState(''); // Added Purchase Quantity state

    const [purchaseItems, setPurchaseItems] = useState([]);

    const resetAllFields = useCallback(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        setDate(formattedDate);
        setVendorName('');
        setBillNo('');
        setBillDate(formattedDate);
        setChallanNo('');
        setGrcType('CREDIT');
        setRemarks('');

        setNameOfItemMedicine('');
        setItemManufacturerMake('');
        setBatchSrlNo('');
        setExpDate('');
        setUnit('');
        setFreeQty('');
        setCfQty('');
        setCfUnit('');
        setSaleRate('');
        setActualBillableQty('');
        setPurchaseRate('');
        setMrp('');
        setSchDisc('');
        setDisc('');
        setBarcode('');
        setLastFreeQty('');
        setLastDiscount('');
        setRackDetails('');
        setDrugSchedule('');
        setHsnSac('');
        setGstIgst('');
        setPackaging('');
        setStrength('');
        setFormulation('');
        setTradeName('');
        setPurchaseQuantity(''); // Reset Purchase Quantity

        setPurchaseItems([]);
    }, []);

    useEffect(() => {
        if (purchaseId) {
            setIsEditing(true);
            setCurrentPurchaseId(purchaseId);
            const existingPurchase = purchaseTransactions.find(p => p.id === purchaseId);

            if (existingPurchase) {
                setDate(existingPurchase.date);
                setVendorName(existingPurchase.vendorName);
                setBillNo(existingPurchase.billNo);
                setBillDate(existingPurchase.billDate);
                setChallanNo(existingPurchase.challanNo || '');
                setGrcType(existingPurchase.grcType);
                setRemarks(existingPurchase.remarks || '');
                setPurchaseItems(existingPurchase.items || []);
                console.log("Loaded existing purchase for editing:", existingPurchase);
            } else {
                alert('Purchase record not found for editing. Redirecting to new purchase form.', true);
                navigate('/purchase-details');
            }
        } else {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${dd}-${mm}-${yyyy}`;
            setDate(formattedDate);
            setBillDate(formattedDate);
            setIsEditing(false);
            setCurrentPurchaseId(null);
            resetAllFields();
        }
    }, [purchaseId, purchaseTransactions, navigate, resetAllFields]);

    const combinedItemOptions = useCallback(() => {
        const uniqueNames = new Set();
        items.forEach(item => {
            if (item.brandName) uniqueNames.add(item.brandName);
        });
        generics.forEach(generic => {
            if (generic.generic1) uniqueNames.add(generic.generic1);
        });
        return Array.from(uniqueNames).sort();
    }, [items, generics]);

    const combinedManufacturerOptions = useCallback(() => {
        const uniqueManufacturers = new Set();
        manufacturers.forEach(mfg => {
            if (mfg.name) uniqueManufacturers.add(mfg.name);
        });
        items.forEach(item => {
            if (item.manufacturerMake) uniqueManufacturers.add(item.manufacturerMake);
        });
        return Array.from(uniqueManufacturers).sort();
    }, [manufacturers, items]);

    const handleItemMedicineChange = (e) => {
        const selectedValue = e.target.value;
        setNameOfItemMedicine(selectedValue);

        setItemManufacturerMake('');
        setBatchSrlNo('');
        setExpDate('');
        setUnit('');
        setFreeQty('');
        setCfQty('');
        setCfUnit('');
        setSaleRate('');
        setPurchaseRate('');
        setMrp('');
        setSchDisc('');
        setDisc('');
        setBarcode('');
        setLastFreeQty('');
        setLastDiscount('');
        setRackDetails('');
        setDrugSchedule('');
        setHsnSac('');
        setGstIgst('');
        setPackaging('');
        setStrength('');
        setFormulation('');
        setTradeName('');
        setPurchaseQuantity(''); // Reset Purchase Quantity on item change

        const matchedItem = items.find(item => item.brandName === selectedValue);
        if (matchedItem) {
            setItemManufacturerMake(matchedItem.manufacturerMake || '');
            setDrugSchedule(matchedItem.drugSchedule || '');
            setHsnSac(matchedItem.hsnCode || '');
            setGstIgst(matchedItem.gstIgst || '');
            setCfQty(matchedItem.cfQty || '');
            setCfUnit(matchedItem.cfUnit || '');
            setPurchaseRate(matchedItem.purchaseRateStrip || '');
            setMrp(matchedItem.purchaseMrpStrip || '');
            setSaleRate(matchedItem.saleRateStrip || '');
            setUnit(matchedItem.saleUnit || matchedItem.purchaseUnit || '');
            setPackaging(matchedItem.packaging || '');
            setStrength(matchedItem.strength || '');
            setFormulation(matchedItem.formulation || '');
            setTradeName(matchedItem.tradeName || '');
            return;
        }

        const matchedGeneric = generics.find(generic => generic.generic1 === selectedValue);
        if (matchedGeneric) {
            setFormulation(matchedGeneric.formulation || '');
            setStrength(matchedGeneric.strength || '');
            setDrugSchedule(matchedGeneric.drugSchedule || '');
        }
    };

    //Template Download (XL)
    const downloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            {
            ITEM_NAME: '',
            MANUFACTURER: '',
            BATCH_SRL_NO: '',
            ACTUAL_BILLABLE_QTY: '',
            PURCHASE_QUANTITY: '', // Added to template
            PURCHASE_RATE: '',
            MRP: '',
            UNIT: '',
            FREE_QTY: '',
            CF_QTY: '',
            CF_UNIT: '',
            SALE_RATE: '',
            SCH_DISC: '',
            DISC: '',
            LAST_FREE_QTY: '',
            LAST_DISCOUNT: '',
            DRUG_SCHEDULE: '',
            RACK_DETAILS: '',
            HSN_SAC: '',
            GST_IGST: '',
            PACKAGING: '',
            FORMULATION: '',
            BARCODE: ''
            }
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, 'bulk-item template.xlsx');
    };

    const handleAddItemToPurchase = (e) => {
        e.preventDefault();

        if (!nameOfItemMedicine || !itemManufacturerMake || !batchSrlNo || !expDate || !actualBillableQty || !purchaseRate || !mrp || !purchaseQuantity) { // Added purchaseQuantity to validation
            alert('Please fill in all required item fields (Name, Manufacturer, Batch/Srl No, Exp. Date, Actual/Billable Qty, Purchase Rate, MRP, Purchase Quantity).');
            return;
        }

        const newItem = {
            id: crypto.randomUUID(),
            nameOfItemMedicine,
            itemManufacturerMake,
            batchSrlNo,
            expDate,
            unit,
            freeQty,
            cfQty,
            cfUnit,
            saleRate,
            actualBillableQty,
            purchaseRate,
            mrp,
            schDisc,
            disc,
            barcode,
            lastFreeQty,
            lastDiscount,
            rackDetails,
            drugSchedule,
            hsnSac,
            gstIgst,
            packaging,
            strength,
            formulation,
            tradeName,
            purchaseQuantity,
            billDate, // Added Purchase Quantity
            vendorName
        };

        setPurchaseItems((prevItems) => [...prevItems, newItem]);

        // Reset item fields after adding
        setNameOfItemMedicine('');
        setItemManufacturerMake('');
        setBatchSrlNo('');
        setExpDate('');
        setUnit('');
        setFreeQty('');
        setCfQty('');
        setCfUnit('');
        setSaleRate('');
        setActualBillableQty('');
        setPurchaseRate('');
        setMrp('');
        setSchDisc('');
        setDisc('');
        setBarcode('');
        setLastFreeQty('');
        setLastDiscount('');
        setRackDetails('');
        setDrugSchedule('');
        setHsnSac('');
        setGstIgst('');
        setPackaging('');
        setStrength('');
        setFormulation('');
        setTradeName('');
        setPurchaseQuantity('');
        setBillDate(''); // Reset Purchase Quantity
        alert('Item added to purchase list!');
    };

    const handleRemovePurchaseItem = (id) => {
        setPurchaseItems((prevItems) => prevItems.filter(item => item.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("handleSubmit triggered.");

        // Basic validation for main purchase details
        if (!date || !vendorName || !billNo || !billDate || !grcType) {
            alert('Please fill in all required GRC/Purchase Details fields (marked with an asterisk).');
            console.log("Validation failed: GRC/Purchase Details missing.");
            return;
        }
        console.log("GRC/Purchase Details validation passed.");

        let finalPurchaseItems = [...purchaseItems];

        // Check if there's an item currently being composed in the "ITEM INFORMATION" section
        if (nameOfItemMedicine) {
            console.log("Item name present in item information section.");
            if (itemManufacturerMake && batchSrlNo && expDate && actualBillableQty && purchaseRate && mrp && purchaseQuantity) { // Added purchaseQuantity to validation
                const currentUnaddedItem = {
                    id: crypto.randomUUID(),
                    nameOfItemMedicine,
                    itemManufacturerMake,
                    batchSrlNo,
                    expDate,
                    unit,
                    freeQty,
                    cfQty,
                    cfUnit,
                    saleRate,
                    actualBillableQty,
                    purchaseRate,
                    mrp,
                    schDisc,
                    disc,
                    barcode,
                    lastFreeQty,
                    lastDiscount,
                    rackDetails,
                    drugSchedule,
                    hsnSac,
                    gstIgst,
                    packaging,
                    strength,
                    formulation,
                    tradeName,
                    purchaseQuantity,
                    billDate, // Added Purchase Quantity
                    vendorName
                };
                finalPurchaseItems.push(currentUnaddedItem);
                console.log('Current item automatically added to purchase list before saving.');
            } else {
                if (purchaseItems.length > 0) {
                    console.warn('Current item information is incomplete and will not be saved with this transaction:', {
                        nameOfItemMedicine, itemManufacturerMake, batchSrlNo, expDate, actualBillableQty, purchaseRate, mrp, purchaseQuantity // Added purchaseQuantity to warning log
                    });
                } else {
                    alert('Please fill all required fields for the current item or add at least one item to the list before saving.');
                    console.log("Validation failed: Incomplete current item and no items in list.");
                    return;
                }
            }
        }

        if (finalPurchaseItems.length === 0) {
            alert('Please add at least one item to the purchase list before saving.');
            console.log("Validation failed: No items in final purchase list.");
            return;
        }
        console.log("Item list validation passed. Final items count:", finalPurchaseItems.length);

        const purchaseData = {
            id: isEditing ? currentPurchaseId : crypto.randomUUID(),
            date,
            vendorName,
            billNo,
            billDate,
            challanNo,
            grcType,
            remarks,
            items: finalPurchaseItems,
            createdAt: isEditing ? purchaseTransactions.find(p => p.id === currentPurchaseId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log("Purchase Data to be saved/updated:", purchaseData);

        if (isEditing) {
            updatePurchaseTransaction(purchaseData);
            console.log('--- Purchase transaction updated in store ---', purchaseData);
            alert('GRC/Purchase Details updated successfully!', true);
            navigate('/purchases-list');
        } else {
            addPurchaseTransaction(purchaseData);
            console.log('--- Purchase transaction dispatched to store ---', purchaseData);
            alert('GRC/Purchase Details saved successfully!', true);
        }
    };
    // const [showBulkModal, setShowBulkModal] = useState(false);
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const selectClass = 'w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900 font-inter">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 border-b pb-2 gap-4">
                <h2 className="text-2xl font-bold text-teal-800">
                    {isEditing ? 'EDIT GRC/PURCHASE DETAILS' : 'GRC/PURCHASE DETAILS'}
                </h2>
                
                <div className="flex gap-2 items-center">
                    <button
                        onClick={downloadTemplate}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                        📄 Download Excel Format
                    </button>

                    <button
                        onClick={() => navigate("/bulk-purchases")}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Bulk Purchase
                    </button>

                    <button
                    onClick={() => navigate('/purchases-list')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    PURCHASE LIST
                </button>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                
            </div>
            {!isEditing && (
                <div className="mb-4 p-3 bg-blue-100 rounded-md text-blue-800 font-medium text-center">
                    Total Saved Purchases: {purchaseTransactions.length}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* GRC/PURCHASE DETAILS Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6 p-4 border border-blue-200 rounded-md bg-blue-50">
                    {/* Date */}
                    <div>
                        <label htmlFor="date" className={labelClass}>Date {requiredSpan}</label>
                        <input
                            type="text"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                            required
                            placeholder="DD-MM-YYYY"
                        />
                    </div>
                    {/* Name of Vendor/Supplier */}
                    <div>
                    <label htmlFor="vendorName" className={labelClass}>
                        Name of Vendor/Supplier {requiredSpan}
                    </label>

                    <div className="flex items-center gap-2">
                        <select
                        id="vendorName"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className={selectClass + " flex-1"} // allows select to take available width
                        required
                        >
                        <option value="">Select Vendor</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                        ))}
                        </select>

                        <button
                        type="button"
                        className="p-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                        onClick={() => navigate('/')} 
                        >
                        +
                        </button>
                    </div>
                    </div>

                    {/* Bill No. */}
                    <div>
                        <label htmlFor="billNo" className={labelClass}>Bill No. {requiredSpan}</label>
                        <input
                            type="text"
                            id="billNo"
                            value={billNo}
                            onChange={(e) => setBillNo(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    {/* Bill Date */}
                    <div>
                        <label htmlFor="billDate" className={labelClass}>Bill Date {requiredSpan}</label>
                        <input
                            type="text"
                            id="billDate"
                            value={billDate}
                            onChange={(e) => setBillDate(e.target.value)}
                            className={inputClass}
                            required
                            placeholder="DD-MM-YYYY"
                        />
                    </div>
                    {/* Challan No. */}
                    <div>
                        <label htmlFor="challanNo" className={labelClass}>Challan No.</label>
                        <input
                            type="text"
                            id="challanNo"
                            value={challanNo}
                            onChange={(e) => setChallanNo(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* GRC Type */}
                    <div>
                        <label htmlFor="grcType" className={labelClass}>GRC Type {requiredSpan}</label>
                        <select
                            id="grcType"
                            value={grcType}
                            onChange={(e) => setGrcType(e.target.value)}
                            className={selectClass}
                            required
                        >
                            {grcTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    {/* Remarks - Full width */}
                    <div className="lg:col-span-3">
                        <label htmlFor="remarks" className={labelClass}>Remarks</label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className={`${inputClass} h-20`}
                        ></textarea>
                    </div>
                </div>

                {/* ITEM INFORMATION Section */}
                <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50">
                    <h3 className="text-xl font-semibold text-green-800 mb-4 border-b pb-2">ITEM INFORMATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {/* Name of Item/Medicine (as select with + button) */}
                        <div className="col-span-2">
                        <label htmlFor="nameOfItemMedicine" className={labelClass}>
                            Name of Item/Medicine {requiredSpan}
                        </label>
                        <div className="flex items-center gap-2">
                            <select
                            id="nameOfItemMedicine"
                            value={nameOfItemMedicine}
                            onChange={handleItemMedicineChange}
                            className={selectClass + " flex-1"}
                            required
                            >
                            <option value="">Select Item/Generic</option>
                            {combinedItemOptions().map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                            </select>
                            <button
                            type="button"
                            className="p-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            onClick={() => navigate('/generic')} 
                            >
                            +
                            </button>
                        </div>
                        </div>

                        {/* Manufacturer/Make (select with + button) */}
                        <div className="col-span-2">
                        <label htmlFor="itemManufacturerMake" className={labelClass}>
                            Manufacturer/Make {requiredSpan}
                        </label>
                        <div className="flex items-center gap-2">
                            <select
                            id="itemManufacturerMake"
                            value={itemManufacturerMake}
                            onChange={(e) => setItemManufacturerMake(e.target.value)}
                            className={selectClass + " flex-1"}
                            required
                            >
                            <option value="">Select Manufacturer</option>
                            {combinedManufacturerOptions().map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                            </select>
                            <button
                            type="button"
                            className="p-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            onClick={() => navigate('/manufacturer')} 
                            >
                            +
                            </button>
                        </div>
                        </div>

                        {/* Batch/Srl No. */}
                        <div>
                            <label htmlFor="batchSrlNo" className={labelClass}>Batch/Srl No. {requiredSpan}</label>
                            <input
                                type="text"
                                id="batchSrlNo"
                                value={batchSrlNo}
                                onChange={(e) => setBatchSrlNo(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        {/* Exp. Date (MM/YYYY) */}
                        <div>
                            <label htmlFor="expDate" className={labelClass}>Exp. Date (MM/YYYY) {requiredSpan}</label>
                            <input
                                type="text"
                                id="expDate"
                                value={expDate}
                                onChange={(e) => setExpDate(e.target.value)}
                                className={inputClass}
                                placeholder="MM/YYYY"
                                required
                            />
                        </div>
                        {/* Unit */}
                        <div>
                            <label htmlFor="unit" className={labelClass}>Unit</label>
                            <select
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Select Unit</option>
                                {units.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        {/* Purchase Quantity - NEW FIELD */}
                        <div>
                            <label htmlFor="purchaseQuantity" className={labelClass}>Purchase Quantity {requiredSpan}</label>
                            <input
                                type="number"
                                id="purchaseQuantity"
                                value={purchaseQuantity}
                                onChange={(e) => setPurchaseQuantity(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        {/* Free Qty. */}
                        <div>
                            <label htmlFor="freeQty" className={labelClass}>Free Qty.</label>
                            <input
                                type="number"
                                id="freeQty"
                                value={freeQty}
                                onChange={(e) => setFreeQty(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Actual / Billable Qty. */}
                        <div>
                            <label htmlFor="actualBillableQty" className={labelClass}>Actual / Billable Qty. {requiredSpan}</label>
                            <input
                                type="number"
                                id="actualBillableQty"
                                value={actualBillableQty}
                                onChange={(e) => setActualBillableQty(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        {/* C.F. Qty. */}
                        <div>
                            <label htmlFor="cfQty" className={labelClass}>C.F. Qty.</label>
                            <input
                                type="number"
                                id="cfQty"
                                value={cfQty}
                                onChange={(e) => setCfQty(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* C.F. Unit */}
                        <div>
                            <label htmlFor="cfUnit" className={labelClass}>C.F. Unit</label>
                            <select
                                id="cfUnit"
                                value={cfUnit}
                                onChange={(e) => setCfUnit(e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Select C.F. Unit</option>
                                {units.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        {/* Sale Rate */}
                        <div>
                            <label htmlFor="saleRate" className={labelClass}>Sale Rate</label>
                            <input
                                type="number"
                                id="saleRate"
                                value={saleRate}
                                onChange={(e) => setSaleRate(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Drug Schedule */}
                        <div>
                            <label htmlFor="drugSchedule" className={labelClass}>Drug Schedule</label>
                            <input
                                type="text"
                                id="drugSchedule"
                                value={drugSchedule}
                                onChange={(e) => setDrugSchedule(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* HSN/SAC */}
                        <div>
                            <label htmlFor="hsnSac" className={labelClass}>HSN/SAC</label>
                            <input
                                type="text"
                                id="hsnSac"
                                value={hsnSac}
                                onChange={(e) => setHsnSac(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* GST/IGST (%) */}
                        <div>
                            <label htmlFor="gstIgst" className={labelClass}>GST/IGST (%)</label>
                            <input
                                type="number"
                                id="gstIgst"
                                value={gstIgst}
                                onChange={(e) => setGstIgst(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        
                        
                        {/* Purchase Rate */}
                        <div>
                            <label htmlFor="purchaseRate" className={labelClass}>Purchase Rate {requiredSpan}</label>
                            <input
                                type="number"
                                id="purchaseRate"
                                value={purchaseRate}
                                onChange={(e) => setPurchaseRate(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        {/* MRP */}
                        <div>
                            <label htmlFor="mrp" className={labelClass}>MRP {requiredSpan}</label>
                            <input
                                type="number"
                                id="mrp"
                                value={mrp}
                                onChange={(e) => setMrp(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        {/* Sch. Disc. (%) */}
                        <div>
                            <label htmlFor="schDisc" className={labelClass}>Sch. Disc. (%)</label>
                            <input
                                type="number"
                                id="schDisc"
                                value={schDisc}
                                onChange={(e) => setSchDisc(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Disc. (%) */}
                        <div>
                            <label htmlFor="disc" className={labelClass}>Disc. (%)</label>
                            <input
                                type="number"
                                id="disc"
                                value={disc}
                                onChange={(e) => setDisc(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Barcode */}
                        <div>
                            <label htmlFor="barcode" className={labelClass}>Barcode</label>
                            <input
                                type="text"
                                id="barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Last Free Qty. */}
                        <div>
                            <label htmlFor="lastFreeQty" className={labelClass}>Last Free Qty.</label>
                            <input
                                type="number"
                                id="lastFreeQty"
                                value={lastFreeQty}
                                onChange={(e) => setLastFreeQty(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Last Discount (%) */}
                        <div>
                            <label htmlFor="lastDiscount" className={labelClass}>Last Discount (%)</label>
                            <input
                                type="number"
                                id="lastDiscount"
                                value={lastDiscount}
                                onChange={(e) => setLastDiscount(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Rack Details */}
                        <div>
                            <label htmlFor="rackDetails" className={labelClass}>Rack Details</label>
                            <input
                                type="text"
                                id="rackDetails"
                                value={rackDetails}
                                onChange={(e) => setRackDetails(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Packaging (Autofilled/Editable) */}
                        <div>
                            <label htmlFor="packaging" className={labelClass}>Packaging</label>
                            <input
                                type="text"
                                id="packaging"
                                value={packaging}
                                onChange={(e) => setPackaging(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Strength (Autofilled/Editable) */}
                        {/* <div>
                            <label htmlFor="strength" className={labelClass}>Strength</label>
                            <input
                                type="text"
                                id="strength"
                                value={strength}
                                onChange={(e) => setStrength(e.target.value)}
                                className={inputClass}
                            />
                        </div> */}
                        {/* Formulation (Autofilled/Editable) */}
                        <div>
                            <label htmlFor="formulation" className={labelClass}>Formulation</label>
                            <input
                                type="text"
                                id="formulation"
                                value={formulation}
                                onChange={(e) => setFormulation(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        {/* Trade Name (Autofilled/Editable) */}
                        {/* <div>
                            <label htmlFor="tradeName" className={labelClass}>Trade Name</label>
                            <input
                                type="text"
                                id="tradeName"
                                value={tradeName}
                                onChange={(e) => setTradeName(e.target.value)}
                                className={inputClass}
                            />
                        </div> */}
                    </div>

                    {/* Add Item to Purchase List Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleAddItemToPurchase}
                            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
                        >
                            Add Item to Purchase List
                        </button>
                    </div>
                </div>

                {/* Display Added Items in a Table */}
                {purchaseItems.length > 0 && (
                    <div className="mb-6 p-4 border border-yellow-200 rounded-md bg-yellow-50">
                        <h3 className="text-xl font-semibold text-yellow-800 mb-4 border-b pb-2">Added Items</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-md overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Manufacturer</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Batch/Srl No.</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Exp. Date</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Actual/Billable Qty</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Purchase Qty</th> {/* New Column Header */}
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Purchase Rate</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">MRP</th>
                                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseItems.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.nameOfItemMedicine}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.itemManufacturerMake}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.batchSrlNo}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.expDate}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.actualBillableQty}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.purchaseQuantity}</td> {/* Display Purchase Quantity */}
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.purchaseRate}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">{item.mrp}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePurchaseItem(item.id)}
                                                    className="text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 shadow-lg font-semibold"
                    >
                        {isEditing ? 'UPDATE PURCHASE' : 'SAVE PURCHASE'}
                    </button>
                    <button
                        type="button"
                        onClick={resetAllFields}
                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 shadow-md font-semibold"
                    >
                        Reset Form
                    </button>
                </div>
{/* {showBulkModal && (
                    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-5xl relative">
                        <button
                        onClick={() => setShowBulkModal(false)}
                        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                        >
                        ✖
                        </button>

                        <BulkPurchaseEntry />
                    </div>
                    </div>
                )} */}
            </form>
        </div>
    );
};

export default AddEditPurchase;