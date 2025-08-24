// src/components/ItemWiseReturnForm.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useReturnStore from "../store/itemwisereturnStore";

const ItemWiseReturnForm = () => {
  const navigate = useNavigate();

  const allItems = usePurchaseTransactionStore((state) => state.inventoryItems);
  const purchaseTransactions = usePurchaseTransactionStore(
    (state) => state.purchaseTransactions
  );
  const addReturnItemToStore = useReturnStore((state) => state.addReturnItem);
  const clearCurrentSessionReturnItems = useReturnStore(
    (state) => state.clearCurrentSessionReturnItems
  );
  const addReturnDocumentToStore = useReturnStore(
    (state) => state.addReturnDocument
  );
  const removeReturnItemFromStore = useReturnStore(
    (state) => state.removeReturnItem
  );
  const itemsToReturn = useReturnStore(
    (state) => state.currentSessionReturnItems
  );
  const allReturnDocuments = useReturnStore((state) => state.returnDocuments); // Get all return documents to calculate previous returns

  // --- Header Fields ---
  const [returnDate, setReturnDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [grcType, setGrcType] = useState("CREDIT");
  const [remarks, setRemarks] = useState("");

  // --- Item Selection States ---
  const [selectedMasterItemId, setSelectedMasterItemId] = useState("");
  const [selectedMasterItemDetails, setSelectedMasterItemDetails] =
    useState(null);

  // --- States for the Purchase List Table ---
  const [purchaseRecords, setPurchaseRecords] = useState([]);

  useEffect(() => {
    const item = allItems.find((itm) => itm.id === selectedMasterItemId);
    setSelectedMasterItemDetails(item);

    if (item) {
      const allPurchaseRecordsForItem = [];
      const previousReturnsMap = {};

      // Calculate previous return quantity
      const normalizeExp = (exp) => {
        if (!exp) return "";
        const parts = exp.split("/");
        if (parts.length === 2) {
          // MM/YYYY format
          return exp;
        } else if (parts.length === 3) {
          // DD/MM/YYYY format, or YYYY-MM-DD
          const [m, y] = parts;
          return `${m}/${y}`;
        }
        return exp;
      };

      allReturnDocuments.forEach((doc) => {
        doc.items.forEach((returnedItem) => {
          const key = `${
            returnedItem.existingName || returnedItem.nameOfGeneric
          }-${returnedItem.batchSrNo}-${normalizeExp(returnedItem.expDate)}`;
          if (previousReturnsMap[key]) {
            previousReturnsMap[key] += returnedItem.returnQty;
          } else {
            previousReturnsMap[key] = returnedItem.returnQty;
          }
        });
      });

      purchaseTransactions.forEach((transaction) => {
        const itemInTransaction = transaction.items.find(
          (itm) =>
            String(itm.nameOfItemMedicine).toLowerCase().trim() ===
              String(item.nameOfItemMedicine).toLowerCase().trim() &&
            String(itm.batchSrlNo).toLowerCase().trim() ===
              String(item.batchSrlNo).toLowerCase().trim() &&
            String(normalizeExp(itm.expDate)).trim() ===
              String(normalizeExp(item.expDate)).trim()
        );

        if (itemInTransaction) {
          const key = `${itemInTransaction.nameOfItemMedicine}-${
            itemInTransaction.batchSrlNo
          }-${normalizeExp(itemInTransaction.expDate)}`;
          const prevReturnQty = previousReturnsMap[key] || 0;

          allPurchaseRecordsForItem.push({
            id: itemInTransaction.id,
            grcDetails: transaction.id,
            vendorName: transaction.vendorName,
            batchSrNo: itemInTransaction.batchSrlNo,
            expDate: itemInTransaction.expDate,
            purchQty: itemInTransaction.purchaseQuantity,
            freeQty: itemInTransaction.freeQty,
            prevReturnQty: prevReturnQty, // Use the calculated previous return quantity
            purchRate: itemInTransaction.purchaseRate,
            disc: itemInTransaction.purrDisc,
            purchUnit: itemInTransaction.purchUnit || "Unit",
            billNo: transaction.billNo, // Add billNo from transaction
            billDate: transaction.billDate, // Add billDate from transaction
          });
        }
      });

      const sortedHistory = [...allPurchaseRecordsForItem].sort((a, b) => {
        const dateA = new Date(a.expDate);
        const dateB = new Date(b.expDate);
        return dateA.getTime() - dateB.getTime();
      });

      setPurchaseRecords(
        sortedHistory.map((record) => ({
          ...record,
          returnQtyInput: "",
        }))
      );
    } else {
      setPurchaseRecords([]);
    }
  }, [
    selectedMasterItemId,
    allItems,
    purchaseTransactions,
    allReturnDocuments,
  ]);

  const handleItemSelect = (e) => {
    const selectedValue = e.target.value;
    setSelectedMasterItemId(selectedValue);
    // Auto-fill Bill No and Bill Date when an item is selected.
    // We will use the first purchase record's details.
    if (selectedValue) {
      const selectedItemPurchases = purchaseTransactions.filter(transaction =>
        transaction.items.some(item =>
          String(item.nameOfItemMedicine).toLowerCase().trim() ===
          String(allItems.find(i => i.id === selectedValue)?.nameOfItemMedicine).toLowerCase().trim()
        )
      );
      if (selectedItemPurchases.length > 0) {
        setBillNo(selectedItemPurchases[0].billNo || "");
        setBillDate(selectedItemPurchases[0].billDate || "");
      }
    } else {
      // Clear fields if no item is selected
      setBillNo("");
      setBillDate("");
    }
  };

  const updateItemStockInPurchase = usePurchaseTransactionStore(
    (s) => s.updateItemStockInPurchase
  );

  const handleReturnQtyChange = (purchaseRecordId, value) => {
    const numValue = parseFloat(value);
    setPurchaseRecords((prevRecords) =>
      prevRecords.map((record) => {
        if (record.id === purchaseRecordId) {
          const availableQty =
            parseFloat(record.purchQty || 0) +
            parseFloat(record.freeQty || 0) -
            parseFloat(record.prevReturnQty || 0);
          let validatedValue =
            isNaN(numValue) || numValue < 0 ? "" : numValue.toString();

          if (parseFloat(validatedValue) > availableQty) {
            validatedValue = availableQty.toString();
          }

          return { ...record, returnQtyInput: validatedValue };
        }
        return record;
      })
    );
  };

  const handleAddSelectedItemsToReturn = () => {
    if (!selectedMasterItemDetails) {
      alert("Please select a Medicine/Item first.");
      return;
    }

    const itemsToAdd = purchaseRecords.filter(
      (record) => parseFloat(record.returnQtyInput) > 0
    );

    if (itemsToAdd.length === 0) {
      alert(
        "Please enter a valid Return Quantity greater than 0 for at least one item."
      );
      return;
    }

    itemsToAdd.forEach((record) => {
      const newItem = {
        id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        masterItemId: selectedMasterItemDetails.id,
        purchaseRecordId: record.id,
        grcDetails: record.grcDetails || "N/A",
        vendorName: record.vendorName || "N/A",
        batchSrNo: record.batchSrNo || "N/A",
        expDate: record.expDate || "N/A",
        purchQtyInclFree:
          parseFloat(record.purchQty || 0) + parseFloat(record.freeQty || 0),
        prevReturnQty: parseFloat(record.prevReturnQty || 0),
        returnQty: parseFloat(record.returnQtyInput),
        actRate: parseFloat(record.purchRate || 0),
        disc: parseFloat(record.disc || 0),
        existingName: selectedMasterItemDetails.nameOfItemMedicine || "N/A",
        nameOfGeneric:
          selectedMasterItemDetails.nameOfGeneric ||
          selectedMasterItemDetails.nameOfItemMedicine ||
          "N/A",
        tradeName:
          selectedMasterItemDetails.tradeName ||
          selectedMasterItemDetails.nameOfItemMedicine ||
          "N/A",
        itemCode: selectedMasterItemDetails.itemCode || "N/A",
        manufacturer: selectedMasterItemDetails.itemManufacturerMake || "N/A",
        productType: selectedMasterItemDetails.productType || "N/A",
        saleRate: parseFloat(selectedMasterItemDetails.saleRateStrip || 0),
        mrp: parseFloat(selectedMasterItemDetails.mrp || 0),
        schDisc: parseFloat(selectedMasterItemDetails.schDisc || 0),
        returnUnit: selectedMasterItemDetails.saleUnit || "N/A",
        cfQty: parseFloat(selectedMasterItemDetails.cfQty || 0),
        cfUnit: selectedMasterItemDetails.cfUnit || "N/A",
        stockQty: parseFloat(selectedMasterItemDetails.currentStock || 0),
        productCategory: selectedMasterItemDetails.productCategory || "N/A",
        subCategory: selectedMasterItemDetails.subCategory || "N/A",
        subSubCategory: selectedMasterItemDetails.subSubCategory || "N/A",
        hsnCode: selectedMasterItemDetails.hsnSac || "N/A",
        gstIgst: selectedMasterItemDetails.gstIgst || "N/A",
        gstCgst: selectedMasterItemDetails.gstCgst || "N/A",
        gstSgst: selectedMasterItemDetails.gstSgst || "N/A",
        formulation: selectedMasterItemDetails.formulation || "N/A",
        strength: selectedMasterItemDetails.strength || "N/A",
        drugSchedule: selectedMasterItemDetails.drugSchedule || "N/A",
        brandName: selectedMasterItemDetails.brandName || "N/A",
        packaging: selectedMasterItemDetails.packaging || "N/A",
        stockAlertQty:
          selectedMasterItemDetails.stockAlertQty !== undefined
            ? selectedMasterItemDetails.stockAlertQty
            : "N/A",
        expiryCheckMonth:
          selectedMasterItemDetails.expiryCheckMonth !== undefined
            ? selectedMasterItemDetails.expiryCheckMonth
            : "N/A",
        onlineItem:
          selectedMasterItemDetails.onlineItem !== undefined
            ? selectedMasterItemDetails.onlineItem
            : false,
        popularItem:
          selectedMasterItemDetails.popularItem !== undefined
            ? selectedMasterItemDetails.popularItem
            : false,
        returnable:
          selectedMasterItemDetails.returnable !== undefined
            ? selectedMasterItemDetails.returnable
            : false,
        status: selectedMasterItemDetails.status || "N/A",
      };
      addReturnItemToStore(newItem);
    });

    alert(`${itemsToAdd.length} item(s) added to current return session.`);

    setPurchaseRecords((prevRecords) =>
      prevRecords.map((record) => ({ ...record, returnQtyInput: "" }))
    );
  };

  const handleFinalSubmitReturn = (e) => {
    e.preventDefault();

    if (itemsToReturn.length === 0) {
      alert(
        "Please add at least one item to return before saving the document."
      );
      return;
    }

    const allVendors = new Set(itemsToReturn.map((item) => item.vendorName));
    const documentVendorName =
      allVendors.size === 1
        ? allVendors.values().next().value
        : "Multiple Vendors";

    const newReturnDocument = {
      documentId: Date.now(),
      returnDate,
      vendorName: documentVendorName,
      billNo, // Include billNo in the saved document
      billDate, // Include billDate in the saved document
      challanNo,
      grcType,
      remarks,
      items: itemsToReturn,
      savedAt: new Date().toISOString(),
    };
    itemsToReturn.forEach((it) => {
      // Normalize expiry date so matching always works
      const normalizeExp = (exp) => {
        if (!exp) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(exp)) {
          // case: YYYY-MM-DD
          const [y, m] = exp.split("-");
          return `${m}/${y}`; // convert to MM/YYYY
        }
        return exp; // already in MM/YYYY
      };

      const expDateNormalized = normalizeExp(it.expDate);

      console.log("RETURN DEDUCT CALL:", {
        name: it.nameOfItemMedicine,
        batch: it.batchSrNo,
        expBefore: it.expDate,
        expAfter: expDateNormalized,
        qty: it.returnQty,
        bill:it.billNo, // FIX: Use it.returnQty instead of it.itemsToReturn
        billdate:it.billDate,
      });

      updateItemStockInPurchase(
        {
          nameOfItemMedicine: it.existingName, // ya jo bhi tere store me match hota ho
          batchSrlNo: it.batchSrNo,
          expDate: expDateNormalized,
        },
        it.returnQty, // yaha correct field
        "decrease"
      );
    });
    console.log("Saving new Return Document:", newReturnDocument);
    addReturnDocumentToStore(newReturnDocument);
    alert("GRT/Purchase Return Document saved successfully!");
    navigate("/item-return-voucher", { state: { returnDocument: newReturnDocument } });

    setReturnDate(new Date().toISOString().split("T")[0]);
    setBillNo("");
    setBillDate("");
    setChallanNo("");
    setGrcType("CREDIT");
    setRemarks("");
    clearCurrentSessionReturnItems();

    setSelectedMasterItemId("");
    setSelectedMasterItemDetails(null);
    setPurchaseRecords([]);
  };

  const handleRemoveFromCurrentSession = (itemIdToRemove) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from the current return session?"
      )
    ) {
      removeReturnItemFromStore(itemIdToRemove);
    }
  };

  const handleReset = () => {
    setSelectedMasterItemId("");
    setSelectedMasterItemDetails(null);
    setPurchaseRecords([]);
    setBillNo(""); // Also reset Bill No
    setBillDate(""); // And Bill Date
  };

  const labelClass = "block text-xs font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full p-1 bg-white border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none rounded-none text-sm";
  const readOnlyInputClass =
    "w-full p-1 bg-gray-50 border-b-2 border-gray-300 rounded-none text-sm cursor-not-allowed";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto my-4 border border-gray-200 text-gray-900">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-teal-700">
          GRT/PURCHASE RETURN DETAILS (ITEM WISE)
        </h2>
        <button
          onClick={() => navigate("/return-list")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
        >
          View All Return Documents
        </button>
      </div>
      <p className="text-right text-sm text-red-600 mb-4 font-semibold">
        Business Currency is : ₹
      </p>

      {/* Header Fields Section */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6 bg-gray-50">
        <legend className="text-blue-700 font-semibold px-2">
          RETURN DOCUMENT DETAILS
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="returnDate" className={labelClass}>
              Return Date {requiredSpan}
            </label>
            <input
              type="date"
              id="returnDate"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="billNo" className={labelClass}>
              Bill No. {requiredSpan}
            </label>
            <input
              type="text"
              id="billNo"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className={inputClass}
              placeholder="Enter Bill No."
            />
          </div>
          <div>
            <label htmlFor="billDate" className={labelClass}>
              Bill Date
            </label>
            <input
              type="date"
              id="billDate"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="challanNo" className={labelClass}>
              Challan No.
            </label>
            <input
              type="text"
              id="challanNo"
              value={challanNo}
              onChange={(e) => setChallanNo(e.target.value)}
              className={inputClass}
              placeholder="Enter Challan No."
            />
          </div>
          <div>
            <label htmlFor="grcType" className={labelClass}>
              GRC Type {requiredSpan}
            </label>
            <select
              id="grcType"
              value={grcType}
              onChange={(e) => setGrcType(e.target.value)}
              className={`${inputClass} rounded-md`}
            >
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="remarks" className={labelClass}>
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={`${inputClass} rounded-md`}
              rows="2"
              placeholder="Enter remarks (if any)"
            ></textarea>
          </div>
        </div>
      </fieldset>

      {/* Item Selection and Details Section */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6 bg-yellow-50">
        <legend className="text-blue-700 font-semibold px-2">
          SELECT ITEM & VIEW DETAILS
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="itemSelect" className={labelClass}>
              SELECT ITEM / MEDICINE NAME : {requiredSpan}
            </label>
            <select
              id="itemSelect"
              value={selectedMasterItemId}
              onChange={handleItemSelect}
              className={`${inputClass} border rounded-md`}
            >
              <option value="">-- Select an Item --</option>
              {allItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nameOfItemMedicine || "N/A"}
                </option>
              ))}
            </select>
          </div>
          {/* Header Display Fields for selected item */}
          <div>
            <label htmlFor="manufacturer" className={labelClass}>
              Manufacturer/Make
            </label>
            <input
              type="text"
              id="manufacturer"
              value={selectedMasterItemDetails?.itemManufacturerMake || ""}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="cfQty" className={labelClass}>
              C.F. Qty.
            </label>
            <input
              type="text"
              id="cfQty"
              value={selectedMasterItemDetails?.cfQty || ""}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="stockQty" className={labelClass}>
              Stock Qty.
            </label>
            <input
              type="text"
              id="stockQty"
              value={selectedMasterItemDetails?.currentStock || ""}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="saleRate" className={labelClass}>
              Sale Rate
            </label>
            <input
              type="text"
              id="saleRate"
              value={selectedMasterItemDetails?.saleRateStrip?.toFixed(2) || ""}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="mrp" className={labelClass}>
              MRP
            </label>
            <input
              type="text"
              id="mrp"
              value={selectedMasterItemDetails?.mrp?.toFixed(2) || ""}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold w-full"
            >
              RESET
            </button>
          </div>
        </div>
      </fieldset>

      {/* PURCHASE LIST OF ITEM/MEDICINES Table */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
        <legend className="text-blue-700 font-semibold px-2">
          PURCHASE LIST OF ITEM/MEDICINES
        </legend>
        {purchaseRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    GRC Details
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Item/Medicine Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch No.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Purch. Qty.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Free Qty.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Prev. Return Qty.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Return Qty.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Purch. Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Discount (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.grcDetails}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.vendorName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {selectedMasterItemDetails?.nameOfItemMedicine || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.batchSrNo}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.expDate}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.purchQty} {record.purchUnit}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.freeQty}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.prevReturnQty}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <input
                        type="number"
                        min="0"
                        value={record.returnQtyInput}
                        onChange={(e) =>
                          handleReturnQtyChange(record.id, e.target.value)
                        }
                        className="w-20 p-1 border border-gray-300 rounded-md text-sm text-center"
                        max={
                          parseFloat(record.purchQty || 0) +
                          parseFloat(record.freeQty || 0) -
                          parseFloat(record.prevReturnQty || 0)
                        }
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₹{record.purchRate?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {record.disc}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {selectedMasterItemDetails
              ? "No purchase history available for this item."
              : "Please select an item to see its purchase history."}
          </p>
        )}
        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
          <button
            type="button"
            onClick={handleAddSelectedItemsToReturn}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
            disabled={
              purchaseRecords.filter((r) => parseFloat(r.returnQtyInput) > 0)
                .length === 0
            }
          >
            + Add Selected Items to Return
          </button>
        </div>
      </fieldset>

      {/* CURRENT SESSION RETURN ITEMS Display */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
        <legend className="text-blue-700 font-semibold px-2">
          CURRENT SESSION RETURN ITEMS
        </legend>
        {itemsToReturn.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch No.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Return Qty.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemsToReturn.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.nameOfGeneric || item.tradeName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.batchSrNo}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.expDate}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.vendorName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.returnQty} {item.returnUnit}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₹{item.actRate?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <button
                        onClick={() => handleRemoveFromCurrentSession(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No items added to the current return session.
          </p>
        )}
      </fieldset>

      {/* Final Submit Button */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={handleFinalSubmitReturn}
          className="px-8 py-3 bg-teal-600 text-white font-bold text-lg rounded-md hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          disabled={itemsToReturn.length === 0}
        >
          SAVE RETURN DOCUMENT
        </button>
      </div>
    </div>
  );
};

export default ItemWiseReturnForm;