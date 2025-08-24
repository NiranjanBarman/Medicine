import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import useVendorStore from '../store/vendorStore';
import usePurchaseTransactionStore from '../store/purchaseTransactionStore';
import useItemMedicineStore from '../store/itemMedicineStore'; // Import the item medicine store
import { useNavigate } from 'react-router-dom';

const SmartBulkImporter = () => {
  const navigate = useNavigate();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(getTodayDate());
  const [remarks, setRemarks] = useState('');
  const [grcType, setGrcType] = useState('CREDIT');
  const [challanNo, setChallanNo] = useState('');

  const vendors = useVendorStore((state) => state.vendors || []);
  const addBulkPurchaseTransactions = usePurchaseTransactionStore((state) => state.addBulkPurchaseTransactions);
  const itemMedicineStoreItems = useItemMedicineStore((state) => state.items); // Get all items from itemMedicineStore

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setItems([]);
  };

  const cleanValue = (val) => {
    if (val === undefined || val === null) return '';
    const str = String(val).replace(/%/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? str : num;
  };

  const handleProcessFile = () => {
    if (!file) {
      alert('Please select an Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const processed = rows.map((row, index) => ({
        id: `row-${index + 1}`,
        nameOfItemMedicine: row['ITEM_NAME'] || '',
        itemManufacturerMake: row['MANUFACTURER'] || '',
        batchSrlNo: row['BATCH_SRL_NO'] || '',
        expDate: row['EXPIRY_DATE'] || '',
        actualBillableQty: cleanValue(row['ACTUAL_BILLABLE_QTY']),
        purchaseQuantity: cleanValue(row['PURCHASE_QUANTITY']),
        purchaseRate: cleanValue(row['PURCHASE_RATE']),
        mrp: cleanValue(row['MRP']),
        unit: row['UNIT'] || '',
        freeQty: cleanValue(row['FREE_QTY']),
        cfQty: cleanValue(row['CF_QTY']),
        cfUnit: row['CF_UNIT'] || '',
        saleRate: cleanValue(row['SALE_RATE']),
        schDisc: cleanValue(row['SCH_DISC']),
        disc: cleanValue(row['DISC']),
        lastFreeQty: cleanValue(row['LAST_FREE_QTY']),
        lastDiscount: cleanValue(row['LAST_DISCOUNT']),
        drugSchedule: row['DRUG_SCHEDULE'] || '',
        rackDetails: row['RACK_DETAILS'] || '',
        hsnSac: row['HSN_SAC'] || '',
        gstIgst: cleanValue(row['GST_IGST']),
        packaging: row['PACKAGING'] || '',
        formulation: row['FORMULATION'] || '',
        barcode: row['BARCODE'] || '',
      }));

      setItems(processed);
      alert(`Loaded ${processed.length} items.`);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleItemChange = (index, key, value) => {
    const updated = [...items];
    if (key === 'id') {
      return;
    }
    updated[index][key] = value;
    setItems(updated);
  };

  const handleSave = () => {
    if (!vendorName || !billNo || !billDate) {
      alert('Please enter vendor name, bill no, and bill date.');
      return;
    }
    if (items.length === 0) {
      alert('No items loaded.');
      return;
    }

    // Validation: Check if all items exist in itemMedicineStore based on name, batch, and barcode
    const missingItemsDetails = [];
    for (const item of items) {
      const existsInStore = itemMedicineStoreItems.some(
        (storeItem) =>
          storeItem.brandName === item.nameOfItemMedicine &&
          storeItem.manufacturerMake === item.itemManufacturerMake 
          
      );
      if (!existsInStore) {
        missingItemsDetails.push(
          `Item: ${item.nameOfItemMedicine}, Batch: ${item.batchSrlNo}, Barcode: ${item.barcode}`
        );
      }
    }
    if (missingItemsDetails.length > 0) {
      alert(
        `Purchase failed! The following items are not found in your Item/Medicine Master with matching Name, Batch, and Barcode: \n${missingItemsDetails.join('\n')}\n\nPlease add them to the Item/Medicine Master before proceeding.`
      );
      return; // Stop the save process
    }
    // Helper: Generate custom GCR ID (8 digit)
    const generateGCRId = () => {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000); 
      return `GCR${randomNum}`;
    };

    const transaction = {
      id: generateGCRId(),
      vendorName,
      billNo,
      billDate,
      date: new Date().toISOString(),
      remarks,
      grcType,
      challanNo,
      items,
    };

    const result = addBulkPurchaseTransactions([transaction]);
    if (result.success) {
      alert('Purchase saved to store');
      setItems([]);
      setFile(null);
      setVendorName('');
      setBillNo('');
      setBillDate(getTodayDate());
      setRemarks('');
      setGrcType('CREDIT');
      setChallanNo('');
    } else {
      alert('Failed to save purchase');
    }
  };
  
  return (
    <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 border-b pb-2 gap-4">
        <h2 className="text-3xl font-extrabold mb-6 text-teal-700 border-b-2 pb-3 border-teal-200">
          BULK PURCHASE
        </h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate('/purchases-list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
          >
            PURCHASE LIST
          </button>
        </div>
      </div>

      {/* Purchase Details Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm mb-8 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="billDate" className="block text-sm font-medium text-gray-700 mb-1">
              Bill Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="billDate"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">
              Name of Vendor/Supplier <span className="text-red-500">*</span>
            </label>
            <select
              id="vendorName"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="billNo" className="block text-sm font-medium text-gray-700 mb-1">
              Bill No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="billNo"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="challanNo" className="block text-sm font-medium text-gray-700 mb-1">
              Challan No.
            </label>
            <input
              type="text"
              id="challanNo"
              value={challanNo}
              onChange={(e) => setChallanNo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="grcType" className="block text-sm font-medium text-gray-700 mb-1">
              GRC Type <span className="text-red-500">*</span>
            </label>
            <select
              id="grcType"
              value={grcType}
              onChange={(e) => setGrcType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="CREDIT">CREDIT</option>
              <option value="CASH">CASH</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm mb-8 border border-purple-200 flex flex-col md:flex-row items-center justify-between">
        <div>
          <label htmlFor="file-upload" className="block text-lg font-semibold text-purple-800 mb-2">
            Upload Excel File <span className="text-red-500">*</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-purple-50 file:text-purple-700
                       hover:file:bg-purple-100"
          />
          <p className="text-xs text-gray-600 mt-2">
            Please upload a .xlsx, .xls, or .csv file. Use the "Download Excel Format" from Add/Edit Purchase for
            template.
          </p>
        </div>
        <button
          onClick={handleProcessFile}
          disabled={!file}
          className={`mt-4 md:mt-0 px-6 py-2 rounded-md font-semibold transition duration-300 ease-in-out
                      ${!file ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-md'}`}
        >
          Process File
        </button>
      </div>

      {/* Items Table Section */}
      {items.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Processed Items</h3>
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-300 rounded-lg shadow-inner">
            <table className="min-w-full text-sm text-left divide-y divide-gray-300">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  {Object.keys(items[0]).map((key) => (
                    <th
                      key={key}
                      className={`px-4 py-2 whitespace-nowrap font-medium text-gray-700 capitalize tracking-wider
                                  ${key === 'id' ? 'sticky left-0 bg-gray-200 z-20 shadow-sm' : ''}`}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, rowIndex) => (
                  <tr key={item.id} className="hover:bg-gray-100 transition-colors duration-150">
                    {Object.entries(item).map(([key, val]) => (
                      <td
                        key={key}
                        className={`px-4 py-2 whitespace-nowrap
                                    ${key === 'id' ? 'sticky left-0 bg-white z-10 shadow-sm' : ''}`}
                      >
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleItemChange(rowIndex, key, e.target.value)}
                          readOnly={key === 'id'}
                          className={`w-full p-1 border rounded-md focus:outline-none
                                      ${key === 'id'
                                          ? 'min-w-[70px] bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200 focus:ring-0'
                                          : 'min-w-[180px] border-gray-300 focus:ring-blue-400 focus:border-blue-400'
                                      }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={items.length === 0 || !vendorName || !billNo || !billDate}
          className={`px-8 py-3 rounded-lg font-bold text-lg transition duration-300 ease-in-out
                      ${items.length === 0 || !vendorName || !billNo || !billDate
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'}`}
        >
          Save Bulk Purchase
        </button>
      </div>
    </div>
  );
};

export default SmartBulkImporter;