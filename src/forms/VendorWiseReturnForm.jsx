// src/components/VendorWiseReturnForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
// import useVendorStore from "../store/vendorStore";
import useVendorWiseReturnStore from "../store/vendorWiseReturnStore";

// Helper function to format the date from MM/yyyy to yyyy-MM-dd
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("/");
  if (parts.length === 2 && parts[0].length <= 2 && parts[1].length === 4) {
    const month = parts[0].padStart(2, "0");
    const year = parts[1];
    // We assume the last day of the month as a placeholder since a specific day isn't provided.
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  }
  return dateString;
};

const VendorWiseReturnForm = () => {
  const navigate = useNavigate();

  // ---- Stores
  const purchaseTransactions =
    usePurchaseTransactionStore((s) => s.purchaseTransactions) || [];
  const updateItemStockInPurchase = usePurchaseTransactionStore(
    (s) => s.updateItemStockInPurchase
  );
  // const vendors = useVendorStore((s) => s.vendors) || [];

  const addReturnItemToStore = useVendorWiseReturnStore((s) => s.addReturnItem);
  const clearCurrentSessionReturnItems = useVendorWiseReturnStore(
    (s) => s.clearCurrentSessionReturnItems
  );
  const addReturnDocumentToStore = useVendorWiseReturnStore(
    (s) => s.addReturnDocument
  );
  const itemsToReturn =
    useVendorWiseReturnStore((s) => s.currentSessionReturnItems) || [];
  const removeReturnItemFromStore = useVendorWiseReturnStore(
    (s) => s.removeReturnItem
  );
  const allReturnDocuments =
    useVendorWiseReturnStore((s) => s.vendorReturnDocuments) || [];

  // ---- Header fields
  const [selectedVendorName, setSelectedVendorName] = useState("");
  const [returnDate, setReturnDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [grcType, setGrcType] = useState("CREDIT");
  const [remarks, setRemarks] = useState("");

  // ---- Item selection
  const [selectedItemId, setSelectedItemId] = useState(""); // id from flattened list
  const [currentItemDetails, setCurrentItemDetails] = useState(null);
  
  const [itemInputFields, setItemInputFields] = useState({
    grcDetails: "",
    batchSrlNo: "",
    expDate: "",
    cfQty: "",
    cfUnit: "",
    stockQty: "",
    purchQtyInclFree: "",
    prevReturnQty: "",
    returnQty: "",
    returnUnit: "",
    actRate: "",
    saleRate: "",
    mrp: "",
    schDisc: "",
    disc: "",
    gstSgst: "",
    gstCgst: "",
    gstIgst: "",
    manufacturer: "",
    itemCode: "",
    productType: "",
    formulation: "",
    strength: "",
    drugSchedule: "",
    brandName: "",
    packaging: "",
    stockAlertQty: "",
    expiryCheckMonth: "",
    onlineItem: false,
    popularItem: false,
    returnable: false,
    status: "",
    tradeName: "",
    productCategory: "",
    subCategory: "",
    subSubCategory: "",
    hsnCode: "",
  });

  // normalize vendors
  const safePurchases = Array.isArray(purchaseTransactions)
    ? purchaseTransactions
    : [];
  const norm = (s) => (s || "").trim().toLowerCase();
  const selectedVendorNameNorm = norm(selectedVendorName);

  // Get unique vendors from purchase transactions for the dropdown
  const uniqueVendors = useMemo(() => {
    const vendorsSet = new Set();
    safePurchases.forEach((transaction) => {
      if (transaction.vendorName) {
        vendorsSet.add(transaction.vendorName);
      }
    });
    return Array.from(vendorsSet);
  }, [safePurchases]);

  // Handle vendor selection and auto-filling of bill details
  const handleVendorChange = (e) => {
    const vendorName = e.target.value;
    setSelectedVendorName(vendorName);

    if (vendorName) {
      // Find the last purchase transaction for the selected vendor
      const lastPurchase = [...safePurchases]
        .reverse()
        .find((p) => p.vendorName === vendorName);

      if (lastPurchase) {
        // If a purchase exists, use its bill details
        setBillNo(lastPurchase.billNo || "");
        setBillDate(lastPurchase.billDate || "");
      } else {
        // If no purchase exists, generate new bill details
        const today = new Date().toISOString().split("T")[0];
        setBillNo(`VR-${Date.now()}`);
        setBillDate(today);
      }
    } else {
      // If no vendor is selected, clear the fields
      setBillNo("");
      setBillDate("");
    }
  };

  // Build items for the selected vendor
  const flattenedPurchasedItems = useMemo(() => {
    if (!selectedVendorNameNorm || safePurchases.length === 0) return [];

    const filteredPurchases = safePurchases.filter(
      (p) => norm(p.vendorName) === selectedVendorNameNorm
    );

    return filteredPurchases.flatMap((purchase) => {
      const lines = purchase.items || [];
      return lines.map((item, idx) => {
        const uniqueItemId = `${purchase.documentId || purchase.id || "doc"}-${
          item.nameOfItemMedicine || "no-name"
        }-${item.batchSrlNo || "no-batch"}-${item.expDate || "no-exp"}-${idx}`;

        const purchaseQty = parseFloat(item.purchaseQuantity || 0);
        const freeQty = parseFloat(item.freeQty || 0);
        const calculatedCurrentStock = purchaseQty + freeQty;

        return {
          id: uniqueItemId,
          purchaseId: purchase.id, // ✅ purchaseTransaction.id as GRC
          vendorName: purchase.vendorName,
          billNo: purchase.billNo,
          billDate: purchase.billDate,

          itemCode: item.itemCode,
          nameOfGeneric: item.nameOfGeneric,
          tradeName: item.tradeName,
          nameOfItemMedicine: item.nameOfItemMedicine,

          manufacturer: item.itemManufacturerMake,
          productType: item.productType,
          batchSrlNo: item.batchSrlNo, // ✅ Corrected key name
          expDate: item.expDate,

          purchaseRateStrip: item.purchaseRate,
          saleRateStrip: item.saleRateStrip,
          purchaseMrpStrip: item.mrp,
          schDisc: item.schDisc,
          disc: item.purrDisc,
          cfQty: item.cfQty,
          cfUnit: item.cfUnit,
          receiveQty: purchaseQty,
          freeQty: freeQty,
          currentStock: calculatedCurrentStock,
          saleUnit: item.saleUnit,

          productCategory: item.productCategory,
          subCategory: item.subCategory,
          subSubCategory: item.subSubCategory,
          hsnCode: item.hsnSac,
          gstIgst: item.gstIgst,
          gstCgst: item.gstCgst,
          gstSgst: item.gstSgst,
          formulation: item.formulation,
          strength: item.strength,
          drugSchedule: item.drugSchedule,
          brandName: item.brandName,
          packaging: item.packaging,
          stockAlertQty: item.stockAlertQty,
          expiryCheckMonth: item.expiryCheckMonth,
          onlineItem: item.onlineItem,
          popularItem: item.popularItem,
          returnable: item.returnable,
          status: item.status,
        };
      });
    });
  }, [selectedVendorNameNorm, safePurchases]);

  const getPreviousReturnedQty = useMemo(() => {
    return (itemToMatch) => {
      if (!itemToMatch || !allReturnDocuments) return 0;

      const itemToMatchExpDate = formatDateForInput(itemToMatch.expDate);

      // Use reduce to sum all matching items across all documents
      return allReturnDocuments.reduce((totalSum, doc) => {
        const docItemsTotal = (doc.items || []).reduce(
          (itemSum, returnedItem) => {
            if (
              norm(returnedItem.nameOfItemMedicine) ===
                norm(itemToMatch.nameOfItemMedicine) &&
              norm(returnedItem.batchSrlNo) === norm(itemToMatch.batchSrlNo) &&
              norm(formatDateForInput(returnedItem.expDate)) ===
                norm(itemToMatchExpDate)
            ) {
              return itemSum + (Number(returnedItem.returnQty) || 0);
            }
            return itemSum;
          },
          0
        );
        return totalSum + docItemsTotal;
      }, 0);
    };
  }, [allReturnDocuments]);

  // Reset when vendor changes
  useEffect(() => {
    setSelectedItemId("");
    setCurrentItemDetails(null);
    setItemInputFields((prev) => ({ ...prev, grcDetails: "" }));
  }, [selectedVendorName]);

  // When item is selected -> autofill + GRC
  useEffect(() => {
    if (!selectedItemId) {
      setCurrentItemDetails(null);
      return;
    }
    const item =
      flattenedPurchasedItems.find((it) => it.id === selectedItemId) || null;
    setCurrentItemDetails(item);

    if (item) {
      const prevReturnQty = getPreviousReturnedQty(item);

      setItemInputFields((prev) => ({
        ...prev,
        tradeName: item.tradeName || "",
        itemCode: item.itemCode || "",
        manufacturer: item.manufacturer || "",
        productType: item.productType || "",
        batchSrlNo: item.batchSrlNo || "", // ✅ Corrected key name here
        expDate: formatDateForInput(item.expDate), // Apply the formatter here
        cfQty: item.cfQty != null ? String(item.cfQty) : "",
        cfUnit: item.cfUnit || "",
        stockQty: item.currentStock != null ? String(item.currentStock) : "",
        purchQtyInclFree:
          item.receiveQty != null
            ? String(Number(item.receiveQty) + Number(item.freeQty || 0))
            : "",
        prevReturnQty: String(prevReturnQty),
        returnUnit: item.saleUnit || "",
        actRate:
          item.purchaseRateStrip != null
            ? Number(item.purchaseRateStrip).toFixed(2)
            : "",
        saleRate:
          item.saleRateStrip != null
            ? Number(item.saleRateStrip).toFixed(2)
            : "",
        mrp:
          item.purchaseMrpStrip != null
            ? Number(item.purchaseMrpStrip).toFixed(2)
            : "",
        schDisc: item.schDisc != null ? String(item.schDisc) : "0",
        disc: item.disc != null ? String(item.disc) : "0",
        gstSgst: item.gstSgst != null ? String(item.gstSgst) : "N/A",
        gstCgst: item.gstCgst != null ? String(item.gstCgst) : "N/A",
        gstIgst: item.gstIgst != null ? String(item.gstIgst) : "N/A",
        formulation: item.formulation || "",
        strength: item.strength || "",
        drugSchedule: item.drugSchedule || "",
        brandName: item.brandName || "",
        packaging: item.packaging || "",
        stockAlertQty:
          item.stockAlertQty != null ? String(item.stockAlertQty) : "",
        expiryCheckMonth:
          item.expiryCheckMonth != null ? String(item.expiryCheckMonth) : "",
        onlineItem: !!item.onlineItem,
        popularItem: !!item.popularItem,
        returnable: !!item.returnable,
        status: item.status || "",
        productCategory: item.productCategory || "",
        subCategory: item.subCategory || "",
        subSubCategory: item.subSubCategory || "",
        hsnCode: item.hsnCode || "",
        grcDetails: item.purchaseId, // ✅ autofill with PurchaseTransaction.id
        returnQty: "",
      }));
    }
  }, [selectedItemId, flattenedPurchasedItems, getPreviousReturnedQty]);

  const handleItemInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItemInputFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---- Add item
  const handleAddItemToReturn = () => {
    if (!currentItemDetails) {
      alert("Please select a Medicine/Item first.");
      return;
    }
    const qty = parseFloat(itemInputFields.returnQty);
    const stock = parseFloat(itemInputFields.stockQty || 0);
    if (!qty || qty <= 0) {
      alert("Please enter a valid Return Quantity greater than 0.");
      return;
    }
    if (qty > stock) {
      alert("Return quantity cannot be more than the current stock.");
      return;
    }

    const gstIgst = parseFloat(itemInputFields.gstIgst || 0);
    let gstCgst = parseFloat(itemInputFields.gstCgst || 0);
    let gstSgst = parseFloat(itemInputFields.gstSgst || 0);

    // New Logic: If IGST is present, calculate CGST and SGST as half of IGST
    if (gstIgst > 0) {
      gstCgst = gstIgst / 2;
      gstSgst = gstIgst / 2;
    }

    const newItem = {
      id: Date.now(),
      masterItemId: currentItemDetails.id,
      originalPurchaseId: currentItemDetails.purchaseId,
      vendorName: currentItemDetails.vendorName,
      nameOfItemMedicine: currentItemDetails.nameOfItemMedicine,
      batchSrlNo: currentItemDetails.batchSrlNo || "", // ✅ Corrected key name here
      ...itemInputFields,
      returnQty: qty,
      actRate: parseFloat(itemInputFields.actRate || 0),
      saleRate: parseFloat(itemInputFields.saleRate || 0),
      mrp: parseFloat(itemInputFields.mrp || 0),
      disc: parseFloat(itemInputFields.disc || 0),
      schDisc: parseFloat(itemInputFields.schDisc || 0),
      gstIgst: gstIgst,
      gstCgst: gstCgst, // Use the new calculated value
      gstSgst: gstSgst, // Use the new calculated value
    };

    addReturnItemToStore(newItem);

    setSelectedItemId("");
    setCurrentItemDetails(null);
    setItemInputFields((prev) => ({
      ...prev,
      grcDetails: "",
      returnQty: "",
      prevReturnQty: "", // ✅ Reset prev return qty when a new item is added
    }));
  };

  const handleRemoveFromCurrentSession = (id) => {
    if (window.confirm("Remove this item from the current return session?")) {
      removeReturnItemFromStore(id);
    }
  };

  const handleFinalSubmitReturn = (e) => {
    e.preventDefault();
    if (!selectedVendorName || itemsToReturn.length === 0) {
      alert(
        "Please select a Vendor and add at least one item to return before saving."
      );
      return;
    }

    const newReturnDocument = {
      documentId: Date.now(),
      returnDate,
      vendorName: selectedVendorName,
      billNo,
      billDate,
      challanNo,
      grcType,
      remarks,
      items: itemsToReturn,
      savedAt: new Date().toISOString(),
    };

    addReturnDocumentToStore(newReturnDocument);
    alert("GRT/Purchase Return Document saved successfully!");

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
        batch: it.batchSrlNo,
        expBefore: it.expDate,
        expAfter: expDateNormalized,
        qty: it.returnQty,
      });

      updateItemStockInPurchase(
        {
          nameOfItemMedicine: it.nameOfItemMedicine,
          batchSrlNo: it.batchSrlNo,
          expDate: expDateNormalized, // ✅ guaranteed to match purchaseTransactions
        },
        it.returnQty,
        "decrease"
      );
    });

    // Clear state after saving
    setReturnDate(new Date().toISOString().split("T")[0]);
    setSelectedVendorName("");
    setBillNo("");
    setBillDate("");
    setChallanNo("");
    setGrcType("CREDIT");
    setRemarks("");
    clearCurrentSessionReturnItems();

    // Navigate to the new voucher page and pass the document data via state
    navigate("/vendor-return-voucher", {
      state: { returnDocument: newReturnDocument },
    });
  };

  // ---- UI
  const labelClass = "block text-sm font-medium text-blue mb-1";
  const inputClass =
    "w-full p-2 border border-gray-300 rounded-md text-sm text-blue bg-white";
  const readOnlyInputClass = inputClass + " bg-gray-100 cursor-not-allowed";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto my-4 border border-gray-200 text-gray-900">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-teal-700">
          GRT / PURCHASE RETURN DETAILS
        </h2>
        <button
          onClick={() => navigate("/vendor-return-list")}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          View Return List
        </button>
      </div>

      <p className="text-right text-sm text-gray-600 mb-4">
        Business Currency is : ₹
      </p>

      {/* Vendor Information */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
        <legend className="text-teal-700 font-semibold px-2">
          VENDOR INFORMATION
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="returnDate" className={labelClass}>
              Date {requiredSpan}
            </label>
            <input
              type="date"
              id="returnDate"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="vendorSelect" className={labelClass}>
              Vendor / Supplier Name {requiredSpan}
            </label>
            <select
              id="vendorSelect"
              value={selectedVendorName}
              onChange={handleVendorChange}
              className={inputClass}
              required
            >
              <option value="">-- Select a Vendor --</option>
              {uniqueVendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="billNo" className={labelClass}>
              Bill No.
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
            />
          </div>
          <div>
            <label htmlFor="grcType" className={labelClass}>
              GRC Type
            </label>
            <select
              id="grcType"
              value={grcType}
              onChange={(e) => setGrcType(e.target.value)}
              className={inputClass}
            >
              <option value="CREDIT">CREDIT</option>
              <option value="RETURN">RETURN</option>
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
              className={inputClass}
              rows="2"
              placeholder="Any specific remarks..."
            ></textarea>
          </div>
        </div>
      </fieldset>

      {/* Return Item Information */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
        <legend className="text-teal-700 font-semibold px-2">
          RETURN ITEM INFORMATION
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Item selector */}
          <div className="md:col-span-2">
            <label htmlFor="itemSelect" className={labelClass}>
              Medicine/Item Name {requiredSpan}
            </label>
            <select
              id="itemSelect"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className={inputClass}
              required
              disabled={!selectedVendorName}
            >
              <option value="">-- Select Medicine/Item --</option>
              {flattenedPurchasedItems.length > 0 ? (
                flattenedPurchasedItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.itemCode ? `(${item.itemCode}) ` : ""}
                    {item.nameOfGeneric ||
                      item.tradeName ||
                      item.nameOfItemMedicine ||
                      "Unknown Item"}
                    {item.batchSrlNo ? ` (Batch: ${item.batchSrlNo})` : ""}
                  </option>
                ))
              ) : (
                <option disabled>
                  No items found for the selected vendor.
                </option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="grcDetails" className={labelClass}>
              GRC Details
            </label>
            <input
              type="text"
              id="grcDetails"
              name="grcDetails"
              value={itemInputFields.grcDetails}
              onChange={handleItemInputChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="manufacturer" className={labelClass}>
              Manufacturer / Make
            </label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={itemInputFields.manufacturer}
              className={readOnlyInputClass}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="batchSrlNo" className={labelClass}>
              Batch No. / Serial No.
            </label>
            <input
              type="text"
              id="batchSrlNo"
              name="batchSrlNo"
              value={itemInputFields.batchSrlNo}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="expDate" className={labelClass}>
              Expiry Date
            </label>
            <input
              type="date"
              id="expDate"
              name="expDate"
              value={itemInputFields.expDate}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="stockQty" className={labelClass}>
              Current Stock
            </label>
            <input
              type="text"
              id="stockQty"
              name="stockQty"
              value={itemInputFields.stockQty}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="purchQtyInclFree" className={labelClass}>
              Purch. Qty. (Incl. Free)
            </label>
            <input
              type="text"
              id="purchQtyInclFree"
              name="purchQtyInclFree"
              value={itemInputFields.purchQtyInclFree}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="prevReturnQty" className={labelClass}>
              Prev. Return Qty.
            </label>
            <input
              type="text"
              id="prevReturnQty"
              name="prevReturnQty"
              value={itemInputFields.prevReturnQty}
              className={readOnlyInputClass}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="returnQty" className={labelClass}>
              Return Qty. {requiredSpan}
            </label>
            <input
              type="number"
              id="returnQty"
              name="returnQty"
              value={itemInputFields.returnQty}
              onChange={handleItemInputChange}
              className={inputClass}
              min="1"
              required
            />
          </div>
          <div>
            <label htmlFor="returnUnit" className={labelClass}>
              Return Unit
            </label>
            <input
              type="text"
              id="returnUnit"
              name="returnUnit"
              value={itemInputFields.cfUnit}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="actRate" className={labelClass}>
              Actual Rate
            </label>
            <input
              type="text"
              id="actRate"
              name="actRate"
              value={itemInputFields.actRate}
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
              name="saleRate"
              value={itemInputFields.saleRate}
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
              name="mrp"
              value={itemInputFields.mrp}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="schDisc" className={labelClass}>
              Scheme Disc. %
            </label>
            <input
              type="text"
              id="schDisc"
              name="schDisc"
              value={itemInputFields.schDisc}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="disc" className={labelClass}>
              Disc. %
            </label>
            <input
              type="text"
              id="disc"
              name="disc"
              value={itemInputFields.disc}
              className={readOnlyInputClass}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="gstSgst" className={labelClass}>
              GST SGST %
            </label>
            <input
              type="text"
              id="gstSgst"
              name="gstSgst"
              value={itemInputFields.gstIgst / 2 || 0}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="gstCgst" className={labelClass}>
              GST CGST %
            </label>
            <input
              type="text"
              id="gstCgst"
              name="gstCgst"
              value={itemInputFields.gstIgst / 2 || 0}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
          <div>
            <label htmlFor="gstIgst" className={labelClass}>
              GST IGST %
            </label>
            <input
              type="text"
              id="gstIgst"
              name="gstIgst"
              value={itemInputFields.gstIgst}
              className={readOnlyInputClass}
              readOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedItemId("");
              setCurrentItemDetails(null);
              setItemInputFields({
                grcDetails: "",
                batchSrlNo: "",
                expDate: "",
                cfQty: "",
                cfUnit: "",
                stockQty: "",
                purchQtyInclFree: "",
                prevReturnQty: "",
                returnQty: "",
                returnUnit: "",
                actRate: "",
                saleRate: "",
                mrp: "",
                schDisc: "",
                disc: "",
                gstSgst: "",
                gstCgst: "",
                gstIgst: "",
                manufacturer: "",
                itemCode: "",
                productType: "",
                formulation: "",
                strength: "",
                drugSchedule: "",
                brandName: "",
                packaging: "",
                stockAlertQty: "",
                expiryCheckMonth: "",
                onlineItem: false,
                popularItem: false,
                returnable: false,
                status: "",
                tradeName: "",
                productCategory: "",
                subCategory: "",
                subSubCategory: "",
                hsnCode: "",
              });
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Reset Item
          </button>
          <button
            type="button"
            onClick={handleAddItemToReturn}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            disabled={!selectedItemId || !itemInputFields.returnQty}
          >
            + Add Item
          </button>
        </div>
      </fieldset>

      {/* Current Return Summary */}
      <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
        <legend className="text-teal-700 font-semibold px-2">
          CURRENT RETURN SUMMARY
        </legend>
        {itemsToReturn.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Batch No.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemsToReturn.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.vendorName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.nameOfGeneric ||
                        item.tradeName ||
                        item.nameOfItemMedicine}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.batchSrlNo}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item.returnQty} {item.returnUnit}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₹{Number(item.actRate || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleRemoveFromCurrentSession(item.id)
                          }
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
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

      {/* Final Submit */}
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

export default VendorWiseReturnForm;
