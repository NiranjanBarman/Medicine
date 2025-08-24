// src/components/CounterSaleForm.jsx (Updated to handle payment updates)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation added
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useCounterSaleStore from "../store/useCounterSaleStore";

const safeParseFloat = (value) => parseFloat(value || 0) || 0;
const safeParseInt = (value) => parseInt(value || 0) || 0;

const CounterSaleForm = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object to read state
  const saleId = location.state?.saleId; // Extract saleId from navigation state

  // Zustand Store hooks
  const { inventoryItems, updateItemStockInPurchase } =
    usePurchaseTransactionStore();
  const addCounterSale = useCounterSaleStore((state) => state.addCounterSale);
  // Get updateCounterSale action and counterSales array from the store
  const updateCounterSale = useCounterSaleStore((state) => state.updateCounterSale);
  const counterSales = useCounterSaleStore((state) => state.counterSales);

  // Sale Transaction Header State
  const [saleDate, setSaleDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [category, setCategory] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [consultantRegNo, setConsultantRegNo] = useState("");
  const [billNo, setBillNo] = useState("");
  const [remarks, setRemarks] = useState("");

  // Payment related states
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [dueAmount, setDueAmount] = useState(0);
  
  // New state for the rounded total and the round off amount
  const [roundedTotalAmount, setRoundedTotalAmount] = useState(0);
  const [roundOffAmount, setRoundOffAmount] = useState(0);

  // Item Specific State for current item being added to sale
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemOriginalDetails, setSelectedItemOriginalDetails] =
    useState(null);
  const [purchaseRate, setPurchaseRate] = useState("");

  // User input/editable fields for the current item being added to sale
  const [stripQty, setStripQty] = useState("");
  const [looseQty, setLooseQty] = useState("");
  const [discPercent, setDiscPercent] = useState("");
  const [editableStripRate, setEditableStripRate] = useState("");
  const [editableLooseRate, setEditableLooseRate] = useState("");
  const [editablePureFreeQuantity, setEditablePureFreeQuantity] = useState("");

  // Other auto-filled/editable fields for the current item
  const [mrp, setMrp] = useState("");
  const [gstIgst, setGstIgst] = useState("");
  const [hsnSac, setHsnSac] = useState("");
  const [batchSrlNo, setBatchSrlNo] = useState("");
  const [expDate, setExpDate] = useState("");
  const [saleUnit, setSaleUnit] = useState("");
  const [cfQty, setCfQty] = useState("");
  const [packaging, setPackaging] = useState("");
  const [barcode, setBarcode] = useState("");
  const [formulation, setFormulation] = useState("");
  const [drugSchedule, setDrugSchedule] = useState("");
  const [cfUnit, setCfUnit] = useState("");

  const [currentStockDisplay, setCurrentStockDisplay] = useState(0);

  const [saleItems, setSaleItems] = useState([]);
  const [totalSaleQty, setTotalSaleQty] = useState(0);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  
  // New state to hold the original sale object when editing/paying a due sale
  const [originalSale, setOriginalSale] = useState(null);

  const labelClass = "block text-xs font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full p-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500 focus:border-teal-500";
  const readOnlyInputClass = `${inputClass} bg-gray-100 cursor-not-allowed`;
  const requiredSpan = <span className="text-red-500">*</span>;
  const paymentModes = ["Cash", "Credit Card", "UPI", "Net Banking", "Due"];

  const clearFormFields = useCallback(() => {
    setSaleDate(new Date().toISOString().split("T")[0]);
    setCustomerName("");
    setPatientId("");
    setCategory("");
    setContactNo("");
    setSex("");
    setAge("");
    setAddress("");
    setState("");
    setDoctorName("");
    setConsultantRegNo("");
    setBillNo("");
    setRemarks("");
    setSaleItems([]);
    setTotalSaleAmount(0);
    setTotalSaleQty(0);
    setCfUnit("");
    setSelectedItemId("");
    setSelectedItemOriginalDetails(null);
    setCurrentStockDisplay(0);
    setEditablePureFreeQuantity("");
    setMrp("");
    setEditableStripRate("");
    setEditableLooseRate("");
    setGstIgst("");
    setHsnSac("");
    setBatchSrlNo("");
    setExpDate("");
    setSaleUnit("");
    setCfQty("");
    setPackaging("");
    setBarcode("");
    setFormulation("");
    setDrugSchedule("");
    setStripQty("");
    setLooseQty("");
    setDiscPercent("");
    setPurchaseRate("");
    setOriginalSale(null); // Clear original sale reference
    
    // Reset payment and rounding states
    setPaymentAmount("");
    setPaymentMode("Cash");
    setDueAmount(0);
    setRoundedTotalAmount(0);
    setRoundOffAmount(0);
  }, []);

  // --- UPDATED useEffect hook with `clearFormFields` dependency ---
  useEffect(() => {
    if (saleId) {
      const existingSale = counterSales.find(sale => sale.id === saleId);
      if (existingSale) {
        setOriginalSale(existingSale); // Store the original sale object
        // Pre-fill header data (make these read-only for payment updates)
        setSaleDate(existingSale.saleDate);
        setCustomerName(existingSale.customerName);
        setPatientId(existingSale.patientId);
        setCategory(existingSale.category);
        setContactNo(existingSale.contactNo);
        setSex(existingSale.sex);
        setAge(existingSale.age);
        setAddress(existingSale.address);
        setState(existingSale.state);
        setDoctorName(existingSale.doctorName);
        setConsultantRegNo(existingSale.consultantRegNo);
        setBillNo(existingSale.billNo);
        setRemarks(existingSale.remarks);

        // Pre-fill payment data
        setTotalSaleAmount(existingSale.totalAmount);
        setRoundedTotalAmount(existingSale.roundedTotalAmount || existingSale.totalAmount); // Use the rounded amount if it exists
        // FIX: Autofill with the due amount, not the total paid amount
        setPaymentAmount(existingSale.dueAmount || 0); 
        setDueAmount(existingSale.dueAmount || 0); // Autofill with current due amount
        setPaymentMode(existingSale.paymentMode || "Cash");
        setRoundOffAmount(existingSale.roundOffAmount || 0);
        
        // Pre-fill sale items (read-only for payment updates)
        setSaleItems(existingSale.items);
        setTotalSaleQty(existingSale.totalQuantity); // Ensure total qty is also set
      }
    } else {
        // Reset to initial state for a new sale
        clearFormFields();
    }
  }, [saleId, counterSales, clearFormFields]); // Dependency array fix

  // Existing useEffect hooks (no changes)
  useEffect(() => {
    const item = inventoryItems.find(
      (item) => String(item.id) === String(selectedItemId)
    );
    if (item) {
        setSelectedItemOriginalDetails(item);
        setCurrentStockDisplay(
          safeParseFloat(item.currentStock || 0) +
            safeParseFloat(item.freeQty || 0)
        );
        setEditablePureFreeQuantity(item.freeQuantity || "");
        setMrp(item.mrp || "");
        setEditableStripRate(item.mrp || "");
        setEditableLooseRate(
          item.mrp && item.cfQty
            ? (safeParseFloat(item.mrp) / safeParseInt(item.cfQty)).toFixed(4)
            : ""
        );
        setGstIgst(
          item.gstIgst ||
            (item.gstCgst && item.gstSgst ? item.gstCgst + item.gstSgst : "")
        );
        setHsnSac(item.hsnSac || "");
        setBatchSrlNo(item.batchSrlNo || "N/A");
        setExpDate(item.expDate || "N/A");
        setSaleUnit(item.unit || "Unit");
        setCfQty(item.cfQty || "");
        setPackaging(item.packaging || "");
        setBarcode(item.barcode || "");
        setFormulation(item.formulation || "");
        setDrugSchedule(item.drugSchedule || "");
        setCfUnit(item.cfUnit || "");
        setPurchaseRate(item.purchaseRate || "");
        setStripQty("");
        setLooseQty("");
        setDiscPercent("");
      } else {
        setSelectedItemOriginalDetails(null);
        setCurrentStockDisplay(0);
        setEditablePureFreeQuantity("");
        setMrp("");
        setEditableStripRate("");
        setEditableLooseRate("");
        setGstIgst("");
        setHsnSac("");
        setBatchSrlNo("");
        setExpDate("");
        setSaleUnit("");
        setCfQty("");
        setPackaging("");
        setBarcode("");
        setFormulation("");
        setDrugSchedule("");
        setCfUnit("");
        setStripQty("");
        setLooseQty("");
        setDiscPercent("");
        setPurchaseRate("");
      }
  }, [selectedItemId, inventoryItems]);

  useEffect(() => {
    if (stripQty && looseQty) {
      setLooseQty("");
    }
  }, [stripQty, looseQty]);

  useEffect(() => {
    if (looseQty && stripQty) {
      setStripQty("");
    }
  }, [looseQty, stripQty]);
  
  // Effect to update dueAmount and roundedTotalAmount when totalSaleAmount or paymentAmount changes
  useEffect(() => {
    const total = safeParseFloat(totalSaleAmount);
    const paid = safeParseFloat(paymentAmount);

    const roundedTotal = Math.round(total);
    const roundOff = total - roundedTotal;

    setRoundedTotalAmount(roundedTotal);
    setRoundOffAmount(roundOff);

    const newDue = roundedTotal > paid ? roundedTotal - paid : 0;
    setDueAmount(newDue);
  }, [totalSaleAmount, paymentAmount]);

  const {
    totalSoldQtyInStrips,
    subTotal,
    discAmount,
    itemNetValue,
    mrpPerTablet, // Corrected: Removed unused maxAllowedStripRate and maxAllowedLooseRate
  } = useMemo(() => {
    if (!selectedItemOriginalDetails) {
        return {
          totalSoldQtyInStrips: 0,
          subTotal: 0,
          discAmount: 0,
          itemNetValue: 0,
          mrpPerTablet: 0,
        };
      }
  
      const currentStripQty = safeParseInt(stripQty);
      const currentLooseQty = safeParseInt(looseQty);
      const currentDiscPercent = safeParseFloat(discPercent);
      const currentCfQty = safeParseInt(cfQty);
  
      const currentSaleRateStrip = safeParseFloat(editableStripRate);
      const currentLooseRate = safeParseFloat(editableLooseRate);
      const currentMrp = safeParseFloat(mrp);
  
      const looseQtyInStrips =
        currentCfQty > 0 ? currentLooseQty / currentCfQty : 0;
      const calculatedTotalSoldQtyInStrips = currentStripQty + looseQtyInStrips;
  
      let calculatedSubTotal =
        currentStripQty * currentSaleRateStrip +
        currentLooseQty * currentLooseRate;
      let calculatedDiscAmount = calculatedSubTotal * (currentDiscPercent / 100);
  
      let calculatedItemNetValue = calculatedSubTotal - calculatedDiscAmount;
  
      let calculatedMrpPerTablet = 0;
      if (currentCfQty > 0 && currentMrp > 0) {
        calculatedMrpPerTablet = currentMrp / currentCfQty;
      }
  
      return {
        totalSoldQtyInStrips: calculatedTotalSoldQtyInStrips,
        subTotal: calculatedSubTotal,
        discAmount: calculatedDiscAmount,
        itemNetValue: calculatedItemNetValue,
        mrpPerTablet: calculatedMrpPerTablet,
      };
  }, [
    selectedItemOriginalDetails,
    stripQty,
    looseQty,
    discPercent,
    editableStripRate,
    editableLooseRate,
    cfQty,
    mrp,
  ]);

  const handleAddItemToSale = (e) => {
    e.preventDefault();
    if (saleId) {
        alert("Cannot add new items to an existing sale. Please create a new sale if you need to add items.");
        return;
    }
    // ... (existing logic for adding items)
    if (!selectedItemOriginalDetails) {
        alert("Please select an Item/Medicine.");
        return;
      }
      if (totalSoldQtyInStrips <= 0) {
        alert("Please enter a valid quantity to sell (Strip Qty or Loose Qty).");
        return;
      }
  
      if (totalSoldQtyInStrips > currentStockDisplay) {
        alert(
          `Not enough stock. Available: ${currentStockDisplay} ${
            selectedItemOriginalDetails.saleUnit || "Strip"
          }.`
        );
        return;
      }
  
      const currentMrp = safeParseFloat(mrp);
      const currentCfQty = safeParseInt(cfQty);
      const currentSaleRateStrip = safeParseFloat(editableStripRate);
      const currentLooseRate = safeParseFloat(editableLooseRate);
  
      if (currentSaleRateStrip > currentMrp + 0.001 && currentMrp > 0) {
        alert(
          `Strip rate (₹${currentSaleRateStrip.toFixed(
            2
          )}) must not exceed MRP (₹${currentMrp.toFixed(2)}).`
        );
        return;
      }
  
      if (currentCfQty > 0 && currentMrp > 0) {
        const mrpPerTablet = currentMrp / currentCfQty;
        if (currentLooseRate > mrpPerTablet + 0.001) {
          alert(
            `Loose rate (₹${currentLooseRate.toFixed(
              2
            )}) must not exceed per-tablet MRP (₹${mrpPerTablet.toFixed(3)}).`
          );
          return;
        }
      }
  
      const newItem = {
        id: selectedItemOriginalDetails.id,
        saleEntryId: crypto.randomUUID(),
        nameOfItemMedicine: selectedItemOriginalDetails.nameOfItemMedicine,
        itemManufacturerMake: selectedItemOriginalDetails.itemManufacturerMake,
        batchSrlNo: batchSrlNo,
        expDate: expDate,
        saleUnit: saleUnit,
        stripQty: safeParseInt(stripQty),
        looseQty: safeParseInt(looseQty),
        totalSoldQtyInStrips: totalSoldQtyInStrips,
        saleRateStrip: safeParseFloat(editableStripRate),
        looseRate: safeParseFloat(editableLooseRate),
        mrp: safeParseFloat(mrp),
        discountPercent: safeParseFloat(discPercent),
        discountAmount: discAmount,
        gstIgst: safeParseFloat(gstIgst || 0),
        hsnSac: hsnSac,
        itemSubTotal: subTotal,
        netAmount: itemNetValue,
        packaging: packaging,
        barcode: barcode,
        pureFreeQuantity: safeParseInt(editablePureFreeQuantity),
        formulation: formulation,
        drugSchedule: drugSchedule,
        cfQty: safeParseInt(cfQty),
        cfUnit: cfUnit,
        purchaseRate: purchaseRate,
      };
  
      setSaleItems((prevItems) => [...prevItems, newItem]);
  
      setTotalSaleAmount((prevTotal) => prevTotal + itemNetValue);
      setTotalSaleQty((prevQty) => prevQty + totalSoldQtyInStrips);
  
      console.log(
        `Item added to sale: ${newItem.nameOfItemMedicine}, Qty: ${totalSoldQtyInStrips}`
      );
      setSelectedItemId("");
  };

  const handleRemoveSaleItem = (
    saleEntryIdToRemove,
    itemId,
    quantityToRevert,
    netAmount
  ) => {
    if (saleId) {
        alert("Cannot remove items from an existing sale. Please delete the entire sale if needed.");
        return;
    }
    // ... (existing logic for removing items)
    setSaleItems((prevItems) => {
        const removedItem = prevItems.find(
          (item) => item.saleEntryId === saleEntryIdToRemove
        );
        if (removedItem) {
          updateItemStockInPurchase(
            {
              nameOfItemMedicine: removedItem.nameOfItemMedicine,
              batchSrlNo: removedItem.batchSrlNo,
              expDate: removedItem.expDate,
            },
            removedItem.totalSoldQtyInStrips,
            "add"
          );
          console.log(
            `Item removed from sale and stock reverted: ${removedItem.nameOfItemMedicine}, Qty: ${removedItem.totalSoldQtyInStrips}`
          );
        }
        return prevItems.filter(
          (item) => item.saleEntryId !== saleEntryIdToRemove
        );
      });
  
      setTotalSaleAmount((prevTotal) => prevTotal - netAmount);
      setTotalSaleQty((prevQty) => prevQty - quantityToRevert);
  };

  const handleResetForm = useCallback(() => {
    // Only revert stock if it's a new sale being reset, not an existing one
    if (!saleId) {
        saleItems.forEach((item) => {
            updateItemStockInPurchase(
                {
                    nameOfItemMedicine: item.nameOfItemMedicine,
                    batchSrlNo: item.batchSrlNo,
                    expDate: item.expDate,
                },
                // item.totalSoldQtyInStrips,
                // "add"
            );
            console.log(
                `Stock reverted for reset: ${item.nameOfItemMedicine}, Qty: ${item.totalSoldQtyInStrips}`
            );
        });
    }
    clearFormFields();
  }, [saleItems, updateItemStockInPurchase, clearFormFields, saleId]);

  // --- UPDATED handleSubmitSale LOGIC with rounding ---
  const handleSubmitSale = (e) => {
    e.preventDefault();

    const newPaymentInput = safeParseFloat(paymentAmount);
    const totalSaleAmountAfterPayment = safeParseFloat(totalSaleAmount);

    if (saleId) {
        // --- CASE 1: Updating payment for an existing sale ---
        const alreadyPaid = safeParseFloat(originalSale.paymentAmount);
        
        // Validate if the new payment is not negative
        if (newPaymentInput < 0) {
            alert("Payment amount cannot be negative.");
            return;
        }

        const newTotalPaidAmount = alreadyPaid + newPaymentInput;

        // The total amount for due sales is the rounded total, so we check against that.
        const originalRoundedTotal = originalSale.roundedTotalAmount || originalSale.totalAmount;

        // Validate if the new total paid amount doesn't exceed the total sale amount
        if (newTotalPaidAmount > originalRoundedTotal + 0.01) {
             alert(`The total paid amount (₹${newTotalPaidAmount.toFixed(2)}) cannot exceed the total sale amount (₹${originalRoundedTotal.toFixed(2)}).`);
            return;
        }
        
        const newDue = originalRoundedTotal - newTotalPaidAmount;

        const updatedSale = {
            ...originalSale, // Keep all original sale details
            paymentAmount: newTotalPaidAmount, // Update with the new total paid amount
            paymentMode, // Update payment mode
            dueAmount: newDue, // Update due amount
            paymentStatus: newDue > 0 ? "Due" : "Paid", // Update payment status
            updatedAt: new Date().toISOString(), // Add an updated timestamp
        };

        try {
            updateCounterSale(updatedSale); // Call store action with the updated sale object
            alert("Payment updated successfully!");
            navigate('/view-counter-sales'); // Redirect back to the list after update
        } catch (error) {
            console.error("Error updating sale payment:", error);
            alert("There was an error updating the payment. Please try again.");
        }
    } else {
        // --- CASE 2: Creating a new sale (original logic) ---
        if (!saleDate || !customerName || !billNo || saleItems.length === 0) {
            alert(
                "Please fill in required sale details (Date, Customer Name, Bill No.) and add at least one item to the sale list."
            );
            return;
        }

        if (paymentMode === "Due" && !customerName) {
            alert("Customer Name is required for 'Due' payment mode.");
            return;
        }

        if (newPaymentInput < 0) {
            alert("Payment amount cannot be negative.");
            return;
        }

        // --- NEW LOGIC: ROUNDING THE TOTAL AMOUNT ---
        const roundedTotal = Math.round(totalSaleAmountAfterPayment);
        const roundOff = totalSaleAmountAfterPayment - roundedTotal;
        const currentDue = roundedTotal > newPaymentInput ? roundedTotal - newPaymentInput : 0;

        const saleTransaction = {
            id: crypto.randomUUID(),
            saleDate,
            customerName,
            patientId,
            category,
            contactNo,
            sex,
            age: age ? parseInt(age) : null,
            address,
            state,
            doctorName,
            consultantRegNo,
            billNo,
            remarks,
            cfUnit,
            purchaseRate,
            items: saleItems,
            createdAt: new Date().toISOString(),
            totalAmount: totalSaleAmountAfterPayment,
            roundedTotalAmount: roundedTotal, // NEW: Store the rounded total
            roundOffAmount: roundOff, // NEW: Store the round off amount
            totalQuantity: totalSaleQty,
            paymentAmount: newPaymentInput,
            paymentMode,
            dueAmount: currentDue,
            paymentStatus: currentDue > 0 ? "Due" : "Paid", // Set initial status for new sale
            saleType: "Counter Sale", // Explicitly set sale type
        };

        try {
            // Only decrease stock for a new sale
            saleItems.forEach((item) => {
                updateItemStockInPurchase(
                    {
                        nameOfItemMedicine: item.nameOfItemMedicine,
                        batchSrlNo: item.batchSrlNo,
                        expDate: item.expDate,
                    },
                    item.totalSoldQtyInStrips,
                    "decrease"
                );
            });

            addCounterSale(saleTransaction);
            alert("Sale completed successfully!");
            // ADDED: Navigate to the print page with the new sale's ID
            navigate(`/print-bill/${saleTransaction.id}`);
            clearFormFields();
        } catch (error) {
            console.error("Error saving sale:", error);
            alert("There was an error saving the sale. Please try again.");
        }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-2 border border-gray-200 text-gray-900">
      <div className="flex justify-between items-center mb-2 border-b pb-1">
        <h2 className="text-xl font-bold text-teal-800">
          {saleId ? "UPDATE PAYMENT OF COUNTER SALE" : "COUNTER SALE"} {/* Dynamic heading */}
        </h2>
        <div>
          <button
            type="button"
            onClick={() => navigate("/view-counter-sales")}
            className="px-3.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md flex items-center text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            COUNTER SALES LIST
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitSale} noValidate>
        {/* Sale Details Section */}
        <fieldset className="border border-gray-300 p-2 rounded-md mb-2">
          <legend className="text-teal-700 text-sm font-bold px-2">
            SALE DETAILS
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
            {/* All form fields are here. Added readOnly/disabled based on saleId */}
            <div>
              <label htmlFor="saleDate" className={labelClass}>
                Sale Date {requiredSpan}
              </label>
              <input
                type="date"
                id="saleDate"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className={inputClass}
                required
                readOnly={!!saleId} // Make read-only if updating existing sale
                disabled={!!saleId} // Disable if updating existing sale
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="customerName" className={labelClass}>
                Customer Name {requiredSpan}
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
                required
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="patientId" className={labelClass}>
                Patient ID / Pn No.
              </label>
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={inputClass}
                placeholder="ID / Pn No."
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                readOnly={!!saleId}
                disabled={!!saleId}
              >
                <option value="">-- Select --</option>
                <option value="General">General</option>
                <option value="Private">Private</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label htmlFor="contactNo" className={labelClass}>
                Contact No.
              </label>
              <input
                type="text"
                id="contactNo"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className={inputClass}
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="sex" className={labelClass}>
                Sex
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className={inputClass}
                readOnly={!!saleId}
                disabled={!!saleId}
              >
                <option value="">-- Select --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className={labelClass}>
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
                placeholder="Age"
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-1">
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
                placeholder="Enter Address"
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="state" className={labelClass}>
                State
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
                placeholder="Enter State"
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="doctorName" className={labelClass}>
                Doctor's Name
              </label>
              <input
                type="text"
                id="doctorName"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className={inputClass}
                placeholder="Enter Doctor Name"
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div>
              <label htmlFor="consultantRegNo" className={labelClass}>
                Consultant Reg. No.
              </label>
              <input
                type="text"
                id="consultantRegNo"
                value={consultantRegNo}
                onChange={(e) => setConsultantRegNo(e.target.value)}
                className={inputClass}
                placeholder="Consultant Reg. No."
                readOnly={!!saleId}
                disabled={!!saleId}
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
                required
                readOnly={!!saleId}
                disabled={!!saleId}
              />
            </div>
            <div className="lg:col-span-3">
              <label htmlFor="remarks" className={labelClass}>
                Remarks
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={`${inputClass} h-16`}
                readOnly={!!saleId}
                disabled={!!saleId}
              ></textarea>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Left: ADD ITEM TO SALE - Hidden if editing an existing sale */}
            {!saleId && (
              <fieldset className="border border-gray-300 p-2 rounded-md w-full lg:w-2/3">
                <legend className="text-teal-700 text-sm font-bold px-2">
                  ADD ITEM TO SALE
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5 mt-2">
                    {/* Item dropdown */}
                    <div className="md:col-span-full">
                    <label
                        htmlFor="selectedItem"
                        className="block text-xs font-medium text-gray-700 mb-1"
                    >
                        Select Item/Medicine <span className="text-red-500">*</span>
                    </label>

                    {(() => {
                        const today = new Date();
                        const currentMonth = today.getMonth() + 1;
                        const currentYear = today.getFullYear();

                        const parsedDate = (dateStr) => {
                        try {
                            const parts = dateStr?.split("/");
                            if (parts?.length === 2) {
                            const [month, year] = parts;
                            return {
                                month: parseInt(month),
                                year: parseInt(year),
                            };
                            }
                            const fullDate = new Date(dateStr);
                            return {
                            month: fullDate.getMonth() + 1,
                            year: fullDate.getFullYear(),
                            };
                        } catch {
                            return { month: 1, year: 2100 };
                        }
                        };

                        const sortedAvailableInventoryItems = [...inventoryItems]
                        .filter((item) => {
                            const stock = parseFloat(item.currentStock || 0);
                            const { month: expMonth, year: expYear } = parsedDate(
                            item.expDate
                            );

                            const notExpired =
                            expYear > currentYear ||
                            (expYear === currentYear && expMonth >= currentMonth);

                            return stock > 0 && notExpired;
                        })
                        .sort((a, b) => {
                            const aDate = parsedDate(a.expDate);
                            const bDate = parsedDate(b.expDate);
                            if (aDate.year !== bDate.year)
                            return aDate.year - bDate.year;
                            return aDate.month - bDate.month;
                        });

                        return (
                        <>
                            <select
                            id="selectedItem"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500 focus:border-teal-500"
                            required
                            >
                            <option value="">-- Select an Item --</option>
                            {sortedAvailableInventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                Exp: {item.expDate || "N/A"},{" "}
                                {item.nameOfItemMedicine || "Unnamed Item"} (
                                {item.itemManufacturerMake || "No Manufacturer"})
                                (Batch: {item.batchSrlNo || "N/A"}, Stock:{" "}
                                {item.currentStock || 0} Strip,{" "}
                                {item.saleUnit || "Units"})
                                </option>
                            ))}
                            </select>

                            {sortedAvailableInventoryItems.length === 0 && (
                            <p className="text-red-500 text-xs mt-0.5">
                                No non-expired items with stock available. Please
                                check purchase stock.
                            </p>
                            )}
                        </>
                        );
                    })()}
                    </div>

                    {selectedItemOriginalDetails && (
                    <>
                        <div>
                        <label htmlFor="currentStock" className={labelClass}>
                            Stock Qty.
                        </label>
                        <input
                            type="text"
                            id="currentStock"
                            value={`${currentStockDisplay} ${
                            selectedItemOriginalDetails.saleUnit || "Strip"
                            }`}
                            className={readOnlyInputClass}
                            readOnly
                        />
                        </div>
                        <div>
                        <label htmlFor="pureFreeQuantity" className={labelClass}>
                            Pure Free Qty.
                        </label>
                        <input
                            type="number"
                            id="pureFreeQuantity"
                            value={editablePureFreeQuantity}
                            onChange={(e) =>
                            setEditablePureFreeQuantity(e.target.value)
                            }
                            className={inputClass}
                            placeholder="0"
                            min="0"
                        />
                        </div>
                        <div>
                        <label htmlFor="purchaseRate" className={labelClass}>
                            Pure. Rate {requiredSpan}
                        </label>
                        <input
                            type="number"
                            id="purchaseRate"
                            name="purchaseRate"
                            value={purchaseRate}
                            onChange={(e) => setPurchaseRate(e.target.value)}
                            className={inputClass}
                            required
                            step="0.01"
                        />
                        </div>

                        <div>
                        <label htmlFor="mrp" className={labelClass}>
                            MRP {requiredSpan}
                        </label>
                        <input
                            type="number"
                            id="mrp"
                            name="mrp"
                            value={mrp}
                            onChange={(e) => setMrp(e.target.value)}
                            className={inputClass}
                            required
                            step="0.01"
                        />
                        </div>
                        <div>
                        <label htmlFor="gstIgst" className={labelClass}>
                            GST/IGST (%)
                        </label>
                        <input
                            type="number"
                            id="gstIgst"
                            value={gstIgst}
                            onChange={(e) => setGstIgst(e.target.value)}
                            className={inputClass}
                            step="0.01"
                        />
                        </div>
                        <div>
                        <label htmlFor="hsnSac" className={labelClass}>
                            HSN/SAC
                        </label>
                        <input
                            type="text"
                            id="hsnSac"
                            value={hsnSac}
                            onChange={(e) => setHsnSac(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="batchSrlNo" className={labelClass}>
                            Batch/Srl No.
                        </label>
                        <input
                            type="text"
                            id="batchSrlNo"
                            value={batchSrlNo}
                            onChange={(e) => setBatchSrlNo(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="expDate" className={labelClass}>
                            Exp. Date
                        </label>
                        <input
                            type="text"
                            id="expDate"
                            value={expDate}
                            onChange={(e) => setExpDate(e.target.value)}
                            className={inputClass}
                            placeholder="YYYY-MM-DD"
                        />
                        </div>
                        <div>
                        <label htmlFor="saleUnit" className={labelClass}>
                            Unit
                        </label>
                        <input
                            type="text"
                            id="saleUnit"
                            value={saleUnit}
                            onChange={(e) => setSaleUnit(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="cfUnit" className={labelClass}>
                            C.F Unit
                        </label>
                        <input
                            type="text"
                            id="cfUnit"
                            value={cfUnit}
                            onChange={(e) => setCfUnit(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="cfQty" className={labelClass}>
                            C.F Qty.
                        </label>
                        <input
                            type="number"
                            id="cfQty"
                            value={cfQty}
                            onChange={(e) => setCfQty(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                        />
                        </div>
                        <div>
                        <label htmlFor="packaging" className={labelClass}>
                            Packaging
                        </label>
                        <input
                            type="text"
                            id="packaging"
                            value={packaging}
                            onChange={(e) => setPackaging(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="barcode" className={labelClass}>
                            Barcode
                        </label>
                        <input
                            type="text"
                            id="barcode"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="formulation" className={labelClass}>
                            Formulation
                        </label>
                        <input
                            type="text"
                            id="formulation"
                            value={formulation}
                            onChange={(e) => setFormulation(e.target.value)}
                            className={inputClass}
                        />
                        </div>
                        <div>
                        <label htmlFor="drugSchedule" className={labelClass}>
                            Drug Schedule
                        </label>
                        <input
                            type="text"
                            id="drugSchedule"
                            value={drugSchedule}
                            onChange={(e) => setDrugSchedule(e.target.value)}
                            className={inputClass}
                        />
                        </div>

                        <div>
                        <label htmlFor="stripQty" className={labelClass}>
                            Strip Qty. {requiredSpan}
                        </label>
                        <input
                            type="number"
                            id="stripQty"
                            name="stripQty"
                            value={stripQty}
                            onChange={(e) => setStripQty(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                            min="0"
                        />
                        </div>

                        <div>
                        <label htmlFor="saleRateStrip" className={labelClass}>
                            Strip Rate
                        </label>
                        <input
                            type="number"
                            id="saleRateStrip"
                            name="saleRateStrip"
                            value={editableStripRate}
                            onChange={(e) => setEditableStripRate(e.target.value)}
                            className={inputClass}
                            placeholder={`Max allowed: ₹${mrp.toFixed(
                                3
                            )}`} // Use mrp directly
                            step="0.001"
                        />
                        </div>

                        <div>
                        <label htmlFor="looseQty" className={labelClass}>
                            Loose Qty.
                        </label>
                        <input
                            type="number"
                            id="looseQty"
                            name="looseQty"
                            value={looseQty}
                            onChange={(e) => setLooseQty(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                            min="0"
                        />
                        </div>

                        <div>
                        <label htmlFor="looseRate" className={labelClass}>
                            Loose Rate
                        </label>
                        <input
                            type="number"
                            id="looseRate"
                            name="looseRate"
                            value={editableLooseRate}
                            onChange={(e) => setEditableLooseRate(e.target.value)}
                            className={inputClass}
                            placeholder={`Max allowed: ₹${mrpPerTablet.toFixed(
                                3
                            )}`} // Use mrpPerTablet
                            step="0.001"
                        />
                        </div>

                        <div>
                        <label htmlFor="discPercent" className={labelClass}>
                            Disc. (%)
                        </label>
                        <input
                            type="number"
                            id="discPercent"
                            name="discPercent"
                            value={discPercent}
                            onChange={(e) => setDiscPercent(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            max="100"
                        />
                        </div>

                        <div>
                        <label htmlFor="discAmount" className={labelClass}>
                            Disc. Amt.
                        </label>
                        <input
                            type="text"
                            id="discAmount"
                            value={`₹${discAmount.toFixed(2)}`}
                            className={readOnlyInputClass}
                            readOnly
                        />
                        </div>
                    </>
                    )}

                    {/* Current Item Preview */}
                    {selectedItemOriginalDetails && (
                    <div className="md:col-span-full mt-1 p-1.5 bg-teal-50 rounded-md text-teal-700 border border-teal-100">
                        <h4 className="font-medium mb-0.5 text-sm">
                        Current Item Preview:
                        </h4>
                        <p className="text-xs">
                        <strong>Total Qty:</strong>{" "}
                        {totalSoldQtyInStrips.toFixed(2)}{" "}
                        {selectedItemOriginalDetails?.saleUnit || "Strip"}
                        </p>
                        <p className="text-xs">
                        <strong>Net Amount (after Disc):</strong> ₹
                        {itemNetValue.toFixed(2)}
                        </p>
                        {safeParseFloat(editableStripRate) >
                            safeParseFloat(mrp) + 0.001 &&
                            safeParseFloat(mrp) > 0 && (
                            <p className="text-red-600 text-xs mt-0.5">
                                Warning: Strip rate (₹
                                {safeParseFloat(editableStripRate).toFixed(2)}) must
                                not exceed MRP (₹{mrp.toFixed(2)}).
                            </p>
                        )}
                        {safeParseFloat(editableLooseRate) >
                            mrpPerTablet + 0.001 &&
                            safeParseFloat(mrp) > 0 &&
                            safeParseInt(cfQty) > 0 && (
                            <p className="text-red-600 text-xs mt-0.5">
                                Warning: Loose rate (₹
                                {safeParseFloat(editableLooseRate).toFixed(2)}) must
                                not exceed per-tablet MRP (₹{(mrp / cfQty).toFixed(3)}
                                ).
                            </p>
                        )}
                    </div>
                    )}
                </div>

                {/* + ADD button aligned right */}
                <div className="md:col-span-full flex justify-end mt-2">
                    <button
                        type="button"
                        onClick={handleAddItemToSale}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center text-sm"
                    >
                        + ADD
                    </button>
                </div>
              </fieldset>
            )}
            
            {/* Right: SUMMARY & PAYMENT SECTION */}
            <div className={`w-full ${saleId ? "lg:w-full" : "lg:w-1/3"} flex flex-col gap-3`}>
                <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                    <legend className="text-teal-700 text-sm font-bold px-2">
                        SUMMARY
                    </legend>
                    <div className="space-y-2 mt-1">
                        <div className="flex justify-between text-base font-medium">
                          <span>Total Qty.:</span>
                            {totalSaleQty.toFixed(2)}{" "}
                        {selectedItemOriginalDetails?.saleUnit || "Strip"}
                        </div>
                        
                        {/* Display the original total amount */}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Sub-Total:</span>
                            <span>₹{totalSaleAmount.toFixed(2)}</span>
                        </div>
                        {/* NEW: Display the round off amount */}
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Round Off:</span>
                            <span className={roundOffAmount > 0 ? "text-red-500" : "text-green-500"}>
                                {roundOffAmount > 0 ? "- " : "+ "}₹{Math.abs(roundOffAmount).toFixed(2)}
                            </span>
                        </div>
                        {/* Display the rounded total amount */}
                        <div className="flex justify-between text-lg font-bold text-teal-700 border-t pt-2">
                            <span>Net Amount:</span>
                            <span>₹{roundedTotalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </fieldset>

                {/* Payment Section - Always visible */}
                <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                    <legend className="text-teal-700 text-sm font-bold px-2">
                        PAYMENT
                    </legend>
                    <div className="space-y-2 mt-1">
                        <div>
                            <label htmlFor="paymentAmount" className={labelClass}>
                                {saleId ? "Amount to Pay" : "Payment Amount"}
                            </label>
                            <input
                                type="number"
                                id="paymentAmount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className={inputClass}
                                placeholder={`Due: ₹${dueAmount.toFixed(2)}`}
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="paymentMode" className={labelClass}>
                                Payment Mode
                            </label>
                            <select
                                id="paymentMode"
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className={inputClass}
                            >
                                {paymentModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between text-base font-bold text-red-600 border-t pt-2">
                            <span>Due Amount:</span>
                            <span>₹{dueAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </fieldset>
            </div>
          </div>

          {/* Bottom section - Sale Items Table */}
          {saleItems.length > 0 && (
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 px-2 pt-2">
                Items for Sale
              </h3>
              <table className="min-w-full bg-white text-xs">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-2 py-1.5 border-b">Item Name</th>
                    <th className="px-2 py-1.5 border-b">Batch/Exp</th>
                    <th className="px-2 py-1.5 border-b">Barcode</th>
                    <th className="px-2 py-1.5 border-b">Strip Qty</th>
                    <th className="px-2 py-1.5 border-b">Loose Qty</th>
                    <th className="px-2 py-1.5 border-b">Pure Free Qty</th>
                    <th className="px-2 py-1.5 border-b">CF Qty</th>
                    <th className="px-2 py-1.5 border-b">Unit</th>
                    <th className="px-2 py-1.5 border-b">Strip Rate</th>
                    <th className="px-2 py-1.5 border-b">Loose Rate</th>
                    <th className="px-2 py-1.5 border-b">Disc (%)</th>
                    <th className="px-2 py-1.5 border-b">Disc Amt</th>
                    <th className="px-2 py-1.5 border-b">Net Amount</th>
                    <th className="px-2 py-1.5 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item) => (
                    <tr key={item.saleEntryId} className="hover:bg-gray-50 text-gray-800">
                        <td className="px-2 py-1.5 border-b">
                            {item.nameOfItemMedicine}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            {item.batchSrlNo}/{item.expDate}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            {item.barcode || "N/A"}
                        </td>
                        <td className="px-2 py-1.5 border-b">{item.stripQty}</td>
                        <td className="px-2 py-1.5 border-b">{item.looseQty}</td>
                        <td className="px-2 py-1.5 border-b">
                            {item.pureFreeQuantity || "0"}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            {item.cfQty || "0"}
                        </td>
                        <td className="px-2 py-1.5 border-b">{item.saleUnit}</td>
                        <td className="px-2 py-1.5 border-b">
                            ₹{item.saleRateStrip.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            ₹{item.looseRate.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            {item.discountPercent.toFixed(2)}%
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            ₹{item.discountAmount.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            ₹{item.netAmount.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 border-b">
                            {/* Disable remove button when updating a sale */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemoveSaleItem(
                                        item.saleEntryId,
                                        item.id,
                                        item.totalSoldQtyInStrips,
                                        item.netAmount
                                    )
                                }
                                className={`text-red-500 hover:text-red-700 ${saleId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!!saleId}
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={handleResetForm}
            // Hide reset button if updating a sale, as it's not a "new form" reset
            className={`px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center text-sm ${saleId ? 'hidden' : ''}`}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-15.356-2m0 0v5h-.582"
              ></path>
            </svg>
            RESET FORM
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-md flex items-center text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              ></path>
            </svg>
            {saleId ? "UPDATE PAYMENT" : "COMPLETE SALE"} {/* Dynamic button text */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CounterSaleForm;