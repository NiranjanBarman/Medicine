import React, { useState, useEffect, useCallback } from "react";
import useItemMedicineStore from "../store/itemMedicineStore";
import useGenericStore from "../store/genericStore";
import useManufacturerStore from "../store/manufacturerStore";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { v4 as generateUUID } from 'uuid';

// --- GLOBAL CONSTANTS & UTILITIES (Moved outside component for stability) ---

const productTypes = ["MEDICINE", "EQUIPMENT"];
// 1. CRITICAL FIX: Changed from 'let' to 'const' for the initial list.
const initialProductCategories = [
  "TABLET",
  "SYRUP",
  "CAPSULE",
  "INJECTION",
  "N/A",
];
const strengths = [
  "Select Strength",
  "2 MG+40 MG+100 MG",
  "500 MG",
  "10 MG",
  "1G",
  "250MG",
  "100 ML",
  "N/A",
];
const cfUnits = [
  "AMPLE",
  "BOTTLE",
  "BOX",
  "CAPSULE",
  "DROP",
  "GM.",
  "JAR",
  "KG.",
  "LTR.",
  "ML.",
  "NOS.",
  "PACKET",
  "PAIR",
  "PFS",
  "PHYL",
  "PIECE",
];
const purchaseUnits = ["Strip", "Bottle", "Box", "Packet", "Piece", "N/A"];
const saleUnits = ["Strip", "Bottle", "Box", "Packet", "Piece", "N/A"];
const drugSchedules = ["H", "H1", "X", "G", "Other", "N/A"];
const statuses = ["ACTIVE", "INACTIVE"];

// 2. CLEANUP: Consolidated item code generation outside the component
const generateItemCode = () => {
  const date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();

  // Determine financial year (April to March)
  let financialYearStart = year;
  let financialYearEnd = (year % 100) + 1;

  if (month < 3) {
    // Months 0-2 are Jan-Mar, so previous financial year
    financialYearStart--;
    financialYearEnd = year % 100;
  }

  const uniquePart = generateUUID().replace(/-/g, "").substring(0, 10);
  return `ITM${uniquePart}_${String(financialYearStart).slice(2)}-${String(
    financialYearEnd
  ).padStart(2, "0")}`;
};

const AddEditItemMedicine = () => {
  const addItemsBulk = useItemMedicineStore.getState().addItemsBulk;

  // Use defensive defaults for store data retrieval
  const manufacturers = useManufacturerStore((state) => state.manufacturers) || [];
  const generics = useGenericStore((state) => state.generics) || [];

  const { items, addItem, updateItem } = useItemMedicineStore();

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const validItems = json.map((row) => ({
        id: generateUUID(),
        brandName: row["ITEM_NAME"] || "",
        cfQty: row["QTY"] || "",
        productCategory: row["PRODUCT_CATEGORY"] || "",
        expiryCheck: row["EXPIRY_DATE"] || "",
        manufacturerMake: row["MANUFACTURER"] || "",
        nameOfGeneric: row["GENERIC_NAME"] || "",
        purchaseRate: row["PURCHASE_RATE"] || "",
        purchaseMrpStrip: row["MRP"] || "",
        productType: "MEDICINE",
        // 3. FIX: Replace static placeholders with empty strings or default values for missing data
        subCategory: row["SUB_CATAGORY"] || "",
        formulation: row["FORMULATION"] || "",
        subSubCategory: row["SUB_SUB_CATAGORY"] || "",
        strength: row["STRENGTH"] || "",
        drugSchedule: row["DRUG_SCHEDULE"] || "",
        packaging: row["PACKAGING"] || "",
        tradeName: row["TRADE_NAME"] || "",
        hsnCode: row["HSN_CODE"] || "",
        gstIgst: row["GST_IGST"] || "",
        cgst: row["CGST"] || "",
        sgst: row["SGST"] || "",
        cfUnit: row["CF_UNIT"] || "",
        stockAlertQty: row["STOCK_ALERT"] || "",
        purchaseUnit: row["PURCHSE_UNIT"] || "",
        saleRateStrip: row["SALE_RATE_STRIP"] || "",
        saleUnit: row["SALE_UNIT"] || "",
        expiryCheckFormat: row["EXP"] || "EXP",
        onlineItem: false,
        popularItem: false,
        returnable: false,
        status: "ACTIVE",
        itemCode: generateItemCode(),
      }));

      addItemsBulk(validItems);
      // Using a simple alert for now, consider a custom modal for better UX
      alert(`${validItems.length} items saved successfully!`);
    };
    reader.readAsArrayBuffer(file);
  };

  const { itemId } = useParams();
  const navigate = useNavigate();
  
  // 4. CRITICAL FIX: Product categories managed by state
  const [currentProductCategories, setCurrentProductCategories] = useState(
    initialProductCategories
  );

  // --- FORM STATE ---
  const [productType, setProductType] = useState("MEDICINE");
  const [productCategory, setProductCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [nameOfGeneric, setNameOfGeneric] = useState("");
  const [formulation, setFormulation] = useState("");
  const [strength, setStrength] = useState("");
  const [drugSchedule, setDrugSchedule] = useState("");
  const [brandName, setBrandName] = useState("");
  const [packaging, setPackaging] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [manufacturerMake, setManufacturerMake] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [gstIgst, setGstIgst] = useState("");
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [cfQty, setCfQty] = useState("");
  const [cfUnit, setCfUnit] = useState("");
  const [stockAlertQty, setStockAlertQty] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [purchaseUnit, setPurchaseUnit] = useState("");
  const [saleRateStrip, setSaleRateStrip] = useState("");
  const [saleUnit, setSaleUnit] = useState("");
  const [purchaseMrpStrip, setPurchaseMrpStrip] = useState("");
  const [expiryCheck, setExpiryCheck] = useState("");
  const [expiryCheckFormat, setExpiryCheckFormat] = useState("MONTH");
  const [onlineItem, setOnlineItem] = useState(false);
  const [popularItem, setPopularItem] = useState(false);
  const [returnable, setReturnable] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [itemCode, setItemCode] = useState("");

  const isEditing = Boolean(itemId);

  // Wrap resetForm in useCallback
  const resetForm = useCallback(() => {
    setProductType("MEDICINE");
    setProductCategory("");
    setSubCategory("");
    setSubSubCategory("");
    setNameOfGeneric("");
    setFormulation("");
    setStrength("");
    setDrugSchedule("");
    setBrandName("");
    setPackaging("");
    setTradeName("");
    setManufacturerMake("");
    setHsnCode("");
    setGstIgst("");
    setCgst("");
    setSgst("");
    setCfQty("");
    setCfUnit("");
    setStockAlertQty("");
    setPurchaseRate("");
    setPurchaseUnit("");
    setSaleRateStrip("");
    setSaleUnit("");
    setPurchaseMrpStrip("");
    setExpiryCheck("");
    setExpiryCheckFormat("MONTH");
    setOnlineItem(false);
    setPopularItem(false);
    setReturnable(false);
    setStatus("ACTIVE");
    setItemCode(generateItemCode()); // Use the moved function
  }, []);

  useEffect(() => {
    if (isEditing && items.length > 0) {
      const itemToEdit = items.find((item) => item.id === itemId);
      if (itemToEdit) {
        setProductType(itemToEdit.productType || "MEDICINE");
        setProductCategory(itemToEdit.productCategory || "");
        setSubCategory(itemToEdit.subCategory || "");
        setSubSubCategory(itemToEdit.subSubCategory || "");
        setNameOfGeneric(itemToEdit.nameOfGeneric || "");
        setFormulation(itemToEdit.formulation || "");
        setStrength(itemToEdit.strength || "");
        setDrugSchedule(itemToEdit.drugSchedule || "");
        setBrandName(itemToEdit.brandName || "");
        setPackaging(itemToEdit.packaging || "");
        setTradeName(itemToEdit.tradeName || "");
        setManufacturerMake(itemToEdit.manufacturerMake || "");
        setHsnCode(itemToEdit.hsnCode || "");
        setGstIgst(itemToEdit.gstIgst || "");
        setCgst(itemToEdit.cgst || "");
        setSgst(itemToEdit.sgst || "");
        setCfQty(itemToEdit.cfQty || "");
        setCfUnit(itemToEdit.cfUnit || "");
        setStockAlertQty(itemToEdit.stockAlertQty || "");
        setPurchaseRate(itemToEdit.purchaseRate || "");
        setPurchaseUnit(itemToEdit.purchaseUnit || "");
        setSaleRateStrip(itemToEdit.saleRateStrip || "");
        setSaleUnit(itemToEdit.saleUnit || "");
        setPurchaseMrpStrip(itemToEdit.purchaseMrpStrip || "");
        setExpiryCheck(itemToEdit.expiryCheck || "");
        setOnlineItem(itemToEdit.onlineItem || false);
        setPopularItem(itemToEdit.popularItem || false);
        setReturnable(itemToEdit.returnable || false);
        setStatus(itemToEdit.status || "ACTIVE");
        setItemCode(itemToEdit.itemCode || "");

        // 5. CRITICAL FIX: Use state setter to add the category from the item to the list
        if (
          itemToEdit.productCategory &&
          !currentProductCategories.includes(itemToEdit.productCategory)
        ) {
          setCurrentProductCategories(prev => [...prev, itemToEdit.productCategory]);
        }
      } else {
        alert("Item/Medicine not found for editing.");
        navigate("/items");
      }
    } else if (!isEditing) {
      resetForm();
    }
    // Added currentProductCategories to dependency array for correct category check
  }, [itemId, items, isEditing, navigate, resetForm, currentProductCategories]); 
  
  //Template Download (XL)
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        ITEM_NAME: "",
        GENERIC_NAME: "",
        MANUFACTURER: "",
        PRODUCT_CATEGORY: "",
        QTY: "",
        EXPIRY_DATE: "",
        PURCHASE_RATE: "",
        MRP: "",
        STOCK_ALERT: "",
        TRADE_NAME: "",
        FORMULATION: "",
        PACKAGING: "",
        DRUG_SCHEDULE: "",
        STRENGTH: "",
        SUB_CATAGORY: "", // Included as it was used in bulk upload
        SUB_SUB_CATAGORY: "", // Included as it was used in bulk upload
        HSN_CODE: "",
        GST_IGST: "",
        CGST: "",
        SGST: "",
        CF_UNIT: "",
        PURCHSE_UNIT: "",
        SALE_RATE_STRIP: "",
        SALE_UNIT: "",
        EXP: "",
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Item Master Template");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "item-master-template.xlsx");
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !productType ||
      !brandName ||
      !tradeName ||
      !manufacturerMake ||
      !hsnCode ||
      !gstIgst ||
      !cfUnit ||
      !purchaseUnit ||
      !saleUnit
    ) {
      alert("Please fill in all required fields (marked with *).");
      return;
    }

    // 6. CRITICAL FIX: Use state setter to add the category if it's new
    if (
      productCategory &&
      !currentProductCategories.includes(productCategory)
    ) {
      setCurrentProductCategories(prev => [...prev, productCategory]);
    }

    const itemData = {
      id: isEditing ? itemId : generateUUID(),
      productType,
      productCategory,
      subCategory,
      subSubCategory,
      nameOfGeneric,
      formulation,
      strength,
      drugSchedule,
      brandName,
      packaging,
      tradeName,
      manufacturerMake,
      hsnCode,
      gstIgst,
      cgst,
      sgst,
      cfQty,
      cfUnit,
      stockAlertQty,
      purchaseRate,
      purchaseUnit,
      saleRateStrip,
      saleUnit,
      purchaseMrpStrip,
      expiryCheck,
      onlineItem,
      popularItem,
      returnable,
      status,
      itemCode,
    };

    if (isEditing) {
      updateItem(itemData);
      alert("Item/Medicine updated successfully!");
    } else {
      addItem(itemData);
      alert("Item/Medicine added successfully!");
      resetForm();
    }

    navigate("/additems-list");
  };

  const handleGoToList = () => {
    navigate("/additems-list");
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500";
  const selectClass =
    "w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-teal-500 focus:border-teal-500";
  const checkboxClass =
    "h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded";
  const requiredSpan = <span className="text-red-500">*</span>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 border-b pb-2 gap-4">
        <h2 className="text-2xl font-bold text-teal-800">
          ADD/MODIFY ITEMS / MEDICINES
        </h2>

        <div className="flex gap-2 items-center">
          {/* Hidden file input */}
          <input
            type="file"
            accept=".xlsx, .xls"
            id="bulk-upload"
            onChange={handleBulkUpload}
            className="hidden"
          />

          {/* BULK ENTRY button that triggers file input */}
          <label
            htmlFor="bulk-upload"
            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm flex items-center"
          >
            BULK ENTRY
          </label>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📄 Download Excel Format
          </button>
          {/* ITEM LIST button */}
          <button
            onClick={handleGoToList}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
          >
            ITEM LIST
          </button>
        </div>
      </div>
      <div className="mb-4 p-3 bg-blue-100 rounded-md text-blue-800 font-medium text-center">
        Total Saved Items: {items.length} {/* Displaying the count of items */}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-6">
          {/* Product Type */}
          <div>
            <label htmlFor="productType" className={labelClass}>
              Product Type {requiredSpan}
            </label>
            <select
              id="productType"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className={selectClass}
              required
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {/* 7. CRITICAL FIX: Product Category - Changed to input/datalist */}
          <div>
            <label htmlFor="productCategory" className={labelClass}>
              Product Category
            </label>
            <input
              list="productCategoriesDatalist"
              type="text"
              id="productCategory"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className={inputClass}
              placeholder="Select or enter new category"
              required // Added 'required' based on original select structure
            />
            <datalist id="productCategoriesDatalist">
              {/* Uses the state array */}
              {currentProductCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Sub Category */}
          <div>
            <label htmlFor="subCategory" className={labelClass}>
              Sub Category
            </label>
            <input
              type="text"
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* Sub Sub Category */}
          <div>
            <label htmlFor="subSubCategory" className={labelClass}>
              Sub Sub Category
            </label>
            <input
              type="text"
              id="subSubCategory"
              value={subSubCategory}
              onChange={(e) => setSubSubCategory(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Name of Generic - With Add button */}
          <div className="col-span-1">
            <label htmlFor="nameOfGeneric" className={labelClass}>
              Name of Generic
            </label>
            <div className="flex items-center">
              <select
                id="nameOfGeneric"
                value={nameOfGeneric}
                onChange={(e) => setNameOfGeneric(e.target.value)}
                className={`${selectClass} flex-grow`}
              >
                <option value="">Select Generic</option>
                {/* 8. Defensive Check for Generics */}
                {generics.map((generic) => (
                  <option key={generic.id} value={generic.id}>
                    {generic.generic1}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ml-2 p-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                onClick={() => navigate("/generic")}
              >
                +
              </button>
            </div>
          </div>
          {/* Formulation */}
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
          {/* Strength */}
          <div>
            <label htmlFor="strength" className={labelClass}>
              Strength
            </label>
            <select
              id="strength"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className={selectClass}
            >
              {strengths.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {/* Drug Schedule */}
          <div>
            <label htmlFor="drugSchedule" className={labelClass}>
              Drug Schedule
            </label>
            <select
              id="drugSchedule"
              value={drugSchedule}
              onChange={(e) => setDrugSchedule(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Schedule</option>
              {drugSchedules.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Name */}
          <div className="col-span-2">
            <label htmlFor="brandName" className={labelClass}>
              Brand Name {requiredSpan}
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {/* Packaging */}
          <div className="col-span-2">
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

          {/* Trade Name */}
          <div className="col-span-2">
            <label htmlFor="tradeName" className={labelClass}>
              Trade Name {requiredSpan}
            </label>
            <input
              type="text"
              id="tradeName"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {/* Manufacturer/Make - With Add button */}
          <div className="col-span-2">
            <label htmlFor="manufacturerMake" className={labelClass}>
              Manufacturer/Make {requiredSpan}
            </label>
            <div className="flex items-center">
              <select
                id="manufacturerMake"
                value={manufacturerMake}
                onChange={(e) => setManufacturerMake(e.target.value)}
                className={`${selectClass} flex-grow`}
                required
              >
                <option value="">Select Manufacturer</option>
                {/* 9. Defensive Check for Manufacturers */}
                {manufacturers.map((mfg) => (
                  <option key={mfg.id} value={mfg.id}>
                    {mfg.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ml-2 p-2 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
                onClick={() => navigate("/manufacturer")}
              >
                +
              </button>
            </div>
          </div>

          {/* HSN Code */}
          <div>
            <label htmlFor="hsnCode" className={labelClass}>
              HSN Code {requiredSpan}
            </label>
            <input
              type="text"
              id="hsnCode"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {/* GST / IGST (%) */}
          <div>
            <label htmlFor="gstIgst" className={labelClass}>
              GST / IGST (%) {requiredSpan}
            </label>
            <input
              type="number"
              id="gstIgst"
              value={gstIgst}
              onChange={(e) => setGstIgst(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {/* CGST (%) */}
          <div>
            <label htmlFor="cgst" className={labelClass}>
              CGST (%)
            </label>
            <input
              type="number"
              id="cgst"
              value={cgst}
              onChange={(e) => setCgst(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* SGST (%) */}
          <div>
            <label htmlFor="sgst" className={labelClass}>
              SGST (%)
            </label>
            <input
              type="number"
              id="sgst"
              value={sgst}
              onChange={(e) => setSgst(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* C.F. Qty. */}
          <div>
            <label htmlFor="cfQty" className={labelClass}>
              C.F. Qty.
            </label>
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
            <label htmlFor="cfUnit" className={labelClass}>
              C.F. Unit {requiredSpan}
            </label>
            <select
              id="cfUnit"
              value={cfUnit}
              onChange={(e) => setCfUnit(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select Unit</option>
              {cfUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Alert Qty. */}
          <div>
            <label htmlFor="stockAlertQty" className={labelClass}>
              Stock Alert Qty.
            </label>
            <input
              type="number"
              id="stockAlertQty"
              value={stockAlertQty}
              onChange={(e) => setStockAlertQty(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* Purchase Rate/Strip */}
          <div>
            <label htmlFor="purchaseRateStrip" className={labelClass}>
              Purchase Rate/Strip
            </label>
            <input
              type="number"
              id="purchaseRateStrip"
              value={purchaseRate}
              onChange={(e) => setPurchaseRate(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* Purchase Unit */}
          <div>
            <label htmlFor="purchaseUnit" className={labelClass}>
              Purchase Unit {requiredSpan}
            </label>
            <select
              id="purchaseUnit"
              value={purchaseUnit}
              onChange={(e) => setPurchaseUnit(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select Unit</option>
              {purchaseUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          {/* Sale Rate/Strip */}
          <div>
            <label htmlFor="saleRateStrip" className={labelClass}>
              Sale Rate/Strip
            </label>
            <input
              type="number"
              id="saleRateStrip"
              value={saleRateStrip}
              onChange={(e) => setSaleRateStrip(e.target.value)}
              className={inputClass}
            />
          </div>
          {/* Sale Unit */}
          <div>
            <label htmlFor="saleUnit" className={labelClass}>
              Sale Unit {requiredSpan}
            </label>
            <select
              id="saleUnit"
              value={saleUnit}
              onChange={(e) => setSaleUnit(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select Unit</option>
              {saleUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          {/* Purchase MRP/Strip */}
          <div>
            <label htmlFor="purchaseMrpStrip" className={labelClass}>
              Purchase MRP/Strip
            </label>
            <input
              type="number"
              id="purchaseMrpStrip"
              value={purchaseMrpStrip}
              onChange={(e) => setPurchaseMrpStrip(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Expiry Check, Status, Item Code - All in one line, spanning full width */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end mt-4 pt-4 border-t border-gray-200">
            {/* Expiry Check (Input with selectable format hint) */}
            <div>
              <label htmlFor="expiryCheck" className={labelClass}>
                Expiry Check
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="expiryCheck"
                  value={expiryCheck}
                  onChange={(e) => setExpiryCheck(e.target.value)}
                  className={`${inputClass} flex-grow`}
                  placeholder={
                    expiryCheckFormat === "MONTH"
                      ? "MM/YYYY"
                      : expiryCheckFormat === "YEAR"
                      ? "YYYY"
                      : "DD/MM/YYYY"
                  }
                />
                <select
                  value={expiryCheckFormat}
                  onChange={(e) => setExpiryCheckFormat(e.target.value)}
                  className="ml-2 p-2 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="MONTH">MONTH</option>
                  <option value="YEAR">YEAR</option>
                  <option value="DATE">DATE</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClass}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {/* Item Code */}
            <div>
              <label htmlFor="itemCode" className={labelClass}>
                Item Code
              </label>
              <input
                type="text"
                id="itemCode"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className={inputClass}
                readOnly
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="onlineItem"
                checked={onlineItem}
                onChange={(e) => setOnlineItem(e.target.checked)}
                className={checkboxClass}
              />
              <label
                htmlFor="onlineItem"
                className="ml-2 text-sm text-gray-700"
              >
                Online Item
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="popularItem"
                checked={popularItem}
                onChange={(e) => setPopularItem(e.target.checked)}
                className={checkboxClass}
              />
              <label
                htmlFor="popularItem"
                className="ml-2 text-sm text-gray-700"
              >
                Popular Item
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="returnable"
                checked={returnable}
                onChange={(e) => setReturnable(e.target.checked)}
                className={checkboxClass}
              />
              <label
                htmlFor="returnable"
                className="ml-2 text-sm text-gray-700"
              >
                Returnable
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 shadow-lg font-semibold"
          >
            {isEditing ? "UPDATE ITEM" : "SAVE ITEM"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditItemMedicine;