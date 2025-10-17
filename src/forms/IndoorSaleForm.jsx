import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useIndoorSaleStore from "../store/useIndoorSaleStore";
import PrintIndoorInvoice from "../components/PrintIndoorInvoice";

// Helper function to safely parse float and integer values
const safeParseFloat = (value) => parseFloat(value || 0) || 0;
const safeParseInt = (value) => parseInt(value || 0) || 0;

// --- DUMMY IPD DATA STRUCTURE (for local testing/demonstration) ---
const DUMMY_INDOOR_PATIENTS = [
  {
    "id": 25,
    "admissionId": "ADM0000000025_25-26",
    "bed": {
      "id": 6,
      "name": "106",
      "occupied": true,
      "active": true,
      "amount": 250,
      "wardDTO": {
        "id": 1,
        "name": "Male-General",
        "amount": 5000,
        "floorDTO": {
          "id": 1,
          "name": "1st Floor"
        }
      }
    },
    "associates": {
      "id": 10,
      "name": "IPD",
      "alternativeName": "",
      "mobileNo": "8975758965",
      "emailId": "ipd@hospital.com\t",
      "active": true
    },
    "provider": null,
    "patients": {
      "id": 33,
      "code": null,
      "name": "kunal deb sharma",
      "gender": "MALE",
      "address": "Kolkata,Kolkata",
      "dob": "",
      "phone": "5588669933",
      "email": "kunaldeb@gmail.com",
      "age": 46,
      "month": null,
      "day": null,
      "initial": "Mr.",
      "initialId": 1,
      "regId": "REG0000000033_25-26",
      "mobileBelongsTo": "self",
      "mobileBelongsToName": null
    },
    "doctorInChargeFirst": {
      "id": 5,
      "name": "komal dey",
      "email": null,
      "username": "6899999999",
      "altName": null,
      "altName2": null,
      "regNo": null,
      "religion": null,
      "gender": "female",
      "identifier": null,
      "address": "KOLKATA",
      "pinCode": null,
      "dob": null,
      "appointDate": null,
      "whatsappNo": null,
      "degree": null,
      "married": null,
      "anniversary": null,
      "spouseDoctor": null,
      "spouseName": null,
      "noOfChildren": null,
      "drinks": null,
      "typeOfDrink": null,
      "movies": null,
      "movieLang": null,
      "cricket": null,
      "football": null,
      "music": null,
      "musicLang": null,
      "type": null,
      "phone": "6899999999",
      "position": "Dr.",
      "speciality": null,
      "referral": [],
      "active": true
    },
    "doctorInChargeSecond": null,
    "vip": false,
    "referredFrom": "",
    "inHouseRemarks": "",
    "remarks": "",
    "foodHabits": "",
    "admittedByName": null,
    "admittedByPhone": "",
    "discharged": false,
    "createdAt": "2025-10-04T06:18:12.556+00:00",
    "updatedAt": "2025-10-04T06:18:12.664+00:00"
  },
  {
    "id": 26,
    "admissionId": "ADM0000000026_25-26",
    "bed": {
      "id": 7,
      "name": "201",
      "occupied": true,
      "active": true,
      "amount": 500,
      "wardDTO": {
        "id": 2,
        "name": "Female-Private",
        "amount": 8000,
        "floorDTO": {
          "id": 2,
          "name": "2nd Floor"
        }
      }
    },
    "associates": {
      "id": 10,
      "name": "IPD",
      "alternativeName": "",
      "mobileNo": "8975758965",
      "emailId": "ipd@hospital.com\t",
      "active": true
    },
    "provider": null,
    "patients": {
      "id": 34,
      "code": null,
      "name": "Smita Roy",
      "gender": "FEMALE",
      "address": "Pune,Maharashtra",
      "dob": "",
      "phone": "9090909090",
      "email": "smita.roy@gmail.com",
      "age": 32,
      "month": null,
      "day": null,
      "initial": "Ms.",
      "initialId": 2,
      "regId": "REG0000000034_25-26",
      "mobileBelongsTo": "self",
      "mobileBelongsToName": null
    },
    "doctorInChargeFirst": {
      "id": 6,
      "name": "Dr. Anita Sen",
      "email": null,
      "username": "7777777777",
      "altName": null,
      "altName2": null,
      "regNo": null,
      "religion": null,
      "gender": "female",
      "identifier": null,
      "address": "PUNE",
      "pinCode": null,
      "dob": null,
      "appointDate": null,
      "whatsappNo": null,
      "degree": null,
      "married": null,
      "anniversary": null,
      "spouseDoctor": null,
      "spouseName": null,
      "noOfChildren": null,
      "drinks": null,
      "typeOfDrink": null,
      "movies": null,
      "movieLang": null,
      "cricket": null,
      "football": null,
      "music": null,
      "musicLang": null,
      "type": null,
      "phone": "7777777777",
      "position": "Dr.",
      "speciality": null,
      "referral": [],
      "active": true
    },
    "doctorInChargeSecond": null,
    "vip": true,
    "referredFrom": "Dr. Sharma Clinic",
    "inHouseRemarks": "Needs quiet room",
    "remarks": "High priority care",
    "foodHabits": "Vegetarian",
    "admittedByName": "Self",
    "admittedByPhone": "9090909090",
    "discharged": false,
    "createdAt": "2025-10-04T08:00:00.000+00:00",
    "updatedAt": "2025-10-04T08:00:00.000+00:00"
  },
  {
    "id": 27,
    "admissionId": "ADM0000000027_25-26",
    "bed": {
      "id": 8,
      "name": "305",
      "occupied": true,
      "active": true,
      "amount": 750,
      "wardDTO": {
        "id": 3,
        "name": "ICU-General",
        "amount": 10000,
        "floorDTO": {
          "id": 3,
          "name": "3rd Floor"
        }
      }
    },
    "associates": {
      "id": 10,
      "name": "IPD",
      "alternativeName": "",
      "mobileNo": "8975758965",
      "emailId": "ipd@hospital.com\t",
      "active": true
    },
    "provider": null,
    "patients": {
      "id": 35,
      "code": null,
      "name": "Ritesh Khanna",
      "gender": "MALE",
      "address": "Delhi,New Delhi",
      "dob": "",
      "phone": "8888888888",
      "email": "ritesh.k@gmail.com",
      "age": 65,
      "month": null,
      "day": null,
      "initial": "Mr.",
      "initialId": 1,
      "regId": "REG0000000035_25-26",
      "mobileBelongsTo": "Relative",
      "mobileBelongsToName": "Son"
    },
    "doctorInChargeFirst": {
      "id": 7,
      "name": "Dr. Vivek Prasad",
      "email": null,
      "username": "9999999999",
      "altName": null,
      "altName2": null,
      "regNo": null,
      "religion": null,
      "gender": "male",
      "identifier": null,
      "address": "DELHI",
      "pinCode": null,
      "dob": null,
      "appointDate": null,
      "whatsappNo": null,
      "degree": null,
      "married": null,
      "anniversary": null,
      "spouseDoctor": null,
      "spouseName": null,
      "noOfChildren": null,
      "drinks": null,
      "typeOfDrink": null,
      "movies": null,
      "movieLang": null,
      "cricket": null,
      "football": null,
      "music": null,
      "musicLang": null,
      "type": null,
      "phone": "9999999999",
      "position": "Dr.",
      "speciality": null,
      "referral": [],
      "active": true
    },
    "doctorInChargeSecond": null,
    "vip": false,
    "referredFrom": "Self-admitted",
    "inHouseRemarks": "ICU monitoring required",
    "remarks": "Emergency admission",
    "foodHabits": "Non-Vegetarian",
    "admittedByName": "Wife",
    "admittedByPhone": "1234567890",
    "discharged": false,
    "createdAt": "2025-10-05T01:00:00.000+00:00",
    "updatedAt": "2025-10-05T01:00:00.000+00:00"
  }
];
// --- End Dummy IPD Data Structure ---

// Helper function to generate Bill No: BLXXXX + Today's Date (DDMMYYYY)
const generateBillNo = () => {
  // Generate a random 4-digit number (1000 to 9999) for the unique prefix
  // This ensures the first 4 digits (XXXX) are different almost every time.
  const uniqueId = Math.floor(Math.random() * 9000) + 1000;
  
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = today.getFullYear();
  
  const billPrefix = `BL${uniqueId}`;
  
  // The Bill No will be in the format: BLXXXXDDMMYYYY (e.g., BL123417102025)
  return `${billPrefix}${day}${month}${year}`;
};

const IndoorSaleForm = () => {
  const navigate = useNavigate();
  const { saleId } = useParams();
  const printComponentRef = useRef();

  const { inventoryItems, updateItemStockInPurchase } =
    usePurchaseTransactionStore();
  const { addIndoorSale, updateIndoorSalePayment, getIndoorSaleById } =
    useIndoorSaleStore();

  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [originalSale, setOriginalSale] = useState(null);
  const [latestSale, setLatestSale] = useState(null);
  
  // New state for patient selection
  // The value will be the *ID* of the admission record (e.g., 25)
  const [selectedPatientAdmissionId, setSelectedPatientAdmissionId] = useState("");

  // --- State Initialization ---
  const [saleDate, setSaleDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState("");
  // Patient ID is now regId
  const [patientId, setPatientId] = useState(""); 
  const [category, setCategory] = useState(""); // This is now manually selected
  const [contactNo, setContactNo] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState(""); // State is part of the address string in the provided JSON, keeping it for now
  const [doctorName, setDoctorName] = useState("");
  // Consultant Reg No is now admissionId
  const [consultantRegNo, setConsultantRegNo] = useState(""); 
  const [bedDetails, setBedDetails] = useState("");
  const [billNo, setBillNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedItemOriginalDetails, setSelectedItemOriginalDetails] =
    useState(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [stripQty, setStripQty] = useState("");
  const [looseQty, setLooseQty] = useState("");
  const [discPercent, setDiscPercent] = useState("");
  const [editableStripRate, setEditableStripRate] = useState("");
  const [editableLooseRate, setEditableLooseRate] = useState("");
  const [editablePureFreeQuantity, setEditablePureFreeQuantity] = useState("");
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
  const [purchaseRate, setPurchaseRate] = useState("");

  // --- State variables for totals ---
  const [totalSaleQty, setTotalSaleQty] = useState(0);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);

  // New Payment State
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState("");
  const paymentModes = ["Cash", "Card", "UPI", "Credit", "Due"];
  const patientCategories = ["General", "Private", "Emergency", "Others"]; // New categories array

  const labelClass = "block text-xs font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full p-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500 focus:border-teal-500";
  const readOnlyInputClass = `${inputClass} bg-gray-100 cursor-not-allowed`;
  const requiredSpan = <span className="text-red-500">*</span>;

  // --- Logic to load existing sale for payment ---
  useEffect(() => {
    if (saleId) {
      setIsUpdatingPayment(true);
      const sale = getIndoorSaleById(saleId);
      if (sale) {
        setOriginalSale(sale);
        setSaleDate(sale.saleDate);
        setCustomerName(sale.customerName);
        setPatientId(sale.patientId);
        setCategory(sale.category);
        setContactNo(sale.contactNo);
        setSex(sale.sex);
        setAge(sale.age);
        setAddress(sale.address);
        setState(sale.state);
        setDoctorName(sale.doctorName);
        setConsultantRegNo(sale.consultantRegNo);
        setBedDetails(sale.bedDetails);
        setBillNo(sale.billNo);
        setRemarks(sale.remarks);
        setSaleItems(sale.items);
        setPaymentMode(sale.paymentMethod || "Cash");
        setAmountPaid(""); // Start with empty amount paid for new payment
        setTotalSaleAmount(sale.netAmount); // Load existing total amount
        setTotalSaleQty(sale.totalSaleQty); // Load existing total quantity
        
        // This won't work perfectly without the actual admission record, 
        // but we keep it for context if the original sale stored an ID that matches one of the DUMMY_INDOOR_PATIENTS.regId
        const patientMatch = DUMMY_INDOOR_PATIENTS.find(p => p.patients.regId === sale.patientId);
        setSelectedPatientAdmissionId(patientMatch ? String(patientMatch.id) : ""); 
        
      } else {
        alert("Sale not found.");
        navigate('/indoor-sales-list');
      }
    } else {
      setIsUpdatingPayment(false);
      // Reset state for new sale
      setSaleDate(new Date().toISOString().split("T")[0]);
      setCustomerName("");
      setPatientId("");
      setBillNo("");
      setSaleItems([]);
      setAmountPaid("");
      setSelectedPatientAdmissionId(""); // Reset selected patient ID
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
      setTotalSaleQty(0);
      setTotalSaleAmount(0);
      setCategory(""); // Ensure category is reset
    }
  }, [saleId, getIndoorSaleById, navigate]);

  // --- Logic to auto-fill patient details and generate Bill No. ---
  useEffect(() => {
    if (!isUpdatingPayment && selectedPatientAdmissionId) {
      // Find the patient by the admission record ID
      const admissionRecord = DUMMY_INDOOR_PATIENTS.find(
        (p) => String(p.id) === String(selectedPatientAdmissionId)
      );

      if (admissionRecord) {
        const patient = admissionRecord.patients;
        const doctor = admissionRecord.doctorInChargeFirst;
        const bedInfo = admissionRecord.bed;
        const wardInfo = bedInfo.wardDTO;
        const floorInfo = wardInfo.floorDTO;

        // Map data from admission record to state variables
        setCustomerName(patient.name);
        setPatientId(patient.regId); // Use regId as Patient ID
        // setCategory(patient.category); // Category is manual
        setContactNo(patient.phone);
        setSex(patient.gender);
        setAge(patient.age);
        // Assuming the address string contains city/state: "Kolkata,Kolkata"
        const addressParts = patient.address.split(',').map(s => s.trim());
        setAddress(addressParts[0] || "");
        setState(addressParts.length > 1 ? addressParts.slice(1).join(', ') : "");
        
        setDoctorName(doctor?.name || "");
        setConsultantRegNo(admissionRecord.admissionId); // Use admissionId as Consultant Reg No.
        
        // Combine Bed Details: "Bed 106, Male-General Ward, 1st Floor"
        const fullBedDetails = `Bed ${bedInfo.name}, ${wardInfo.name} Ward, ${floorInfo.name}`;
        setBedDetails(fullBedDetails);
        
        // Auto-generate Bill No. using the Patient ID (regId)
        // The generateBillNo function now creates a unique prefix (XXXX) every time it is called.
        setBillNo(generateBillNo(patient.regId));
      }
    } else if (!isUpdatingPayment && !selectedPatientAdmissionId) {
      // Clear patient-specific fields when no patient is selected
      setCustomerName("");
      setPatientId("");
      // setCategory(""); // Keep category selection state independent of patient selection
      setContactNo("");
      setSex("");
      setAge("");
      setAddress("");
      setState("");
      setDoctorName("");
      setConsultantRegNo("");
      setBedDetails("");
      setBillNo(""); // Clear Bill No. if it was auto-generated
    }
  }, [selectedPatientAdmissionId, isUpdatingPayment]);


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
      setSaleUnit(item.unit || "Strip");
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

  const {
    totalSoldQtyInStrips,
    subTotal,
    discAmount,
    itemNetValue,
    maxAllowedStripRate,
    maxAllowedLooseRate,
  } = useMemo(() => {
    if (!selectedItemOriginalDetails) {
      return {
        totalSoldQtyInStrips: 0,
        subTotal: 0,
        discAmount: 0,
        itemNetValue: 0,
        maxAllowedStripRate: Infinity,
        maxAllowedLooseRate: Infinity,
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
    const calculatedMaxAllowedStripRate = currentMrp;
    let calculatedMrpPerTablet = 0;
    let calculatedMaxAllowedLooseRate = Infinity;
    if (currentCfQty > 0 && currentMrp > 0) {
      calculatedMrpPerTablet = currentMrp / currentCfQty;
      calculatedMaxAllowedLooseRate = calculatedMrpPerTablet;
    }

    return {
      totalSoldQtyInStrips: calculatedTotalSoldQtyInStrips,
      subTotal: calculatedSubTotal,
      discAmount: calculatedDiscAmount,
      itemNetValue: calculatedItemNetValue,
      maxAllowedStripRate: calculatedMaxAllowedStripRate,
      maxAllowedLooseRate: calculatedMaxAllowedLooseRate,
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

  const netAmount = useMemo(() => originalSale?.netAmount || totalSaleAmount, [originalSale, totalSaleAmount]);
  const currentPaid = useMemo(() => originalSale?.amountPaid || 0, [originalSale]);
  const newBalanceDue = useMemo(
    () => (originalSale?.balanceDue || netAmount) - safeParseFloat(amountPaid),
    [originalSale, netAmount, amountPaid]
  );
  // const totalDiscount = useMemo(() => {
  //   return (originalSale?.items || saleItems).reduce((sum, item) => sum + item.discountAmount, 0);
  // }, [originalSale, saleItems]);
  // const totalGst = useMemo(() => {
  //   return (originalSale?.items || saleItems).reduce(
  //     (sum, item) =>
  //       sum +
  //       (item.itemSubTotal - item.discountAmount) *
  //       (parseFloat(item.gstIgst || 0) / 100),
  //     0
  //   );
  // }, [originalSale, saleItems]);

  // NEW: Memoize the rounded amounts for the final sale
  const { roundedNetAmount, roundOffAmount } = useMemo(() => {
    const net = totalSaleAmount;
    // Math.round() handles the rounding logic you described (>= .50 up, < .50 down)
    const rounded = Math.round(net);
    const roundOff = rounded - net;
    return {
      roundedNetAmount: rounded,
      roundOffAmount: roundOff,
    };
  }, [totalSaleAmount]);

  const handleAddItemToSale = (e) => {
    e.preventDefault();
    if (!selectedItemOriginalDetails) {
      alert("Please select an Item/Medicine.");
      return;
    }
    if (totalSoldQtyInStrips <= 0) {
      alert("Please enter a valid quantity to sell.");
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

    setTotalSaleAmount((prevTotal) => prevTotal + newItem.netAmount);
    setTotalSaleQty((prevQty) => prevQty + newItem.totalSoldQtyInStrips);

    setSelectedItemId("");
  };

  const handleRemoveSaleItem = (saleEntryIdToRemove) => {
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

        setTotalSaleAmount((prevTotal) => prevTotal - removedItem.netAmount);
        setTotalSaleQty((prevQty) => prevQty - removedItem.totalSoldQtyInStrips);
      }
      return prevItems.filter(
        (item) => item.saleEntryId !== saleEntryIdToRemove
      );
    });
  };
  
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
    setBedDetails("");
    setBillNo("");
    setPaymentMode("Cash");
    setRemarks("");
    setAmountPaid("");
    setSaleItems([]);
    setSelectedPatientAdmissionId(""); // Clear selected patient ID
    
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
  }, []);
  
  const handleResetForm = useCallback(() => {
    clearFormFields();
  }, [clearFormFields]);

  const handleSubmitSale = (e) => {
    e.preventDefault();

    if (isUpdatingPayment) {
      const newPaymentInput = safeParseFloat(amountPaid);
      const alreadyPaid = originalSale?.amountPaid || 0;
      const totalSaleAmountAfterPayment = originalSale?.netAmount || 0;

      if (newPaymentInput < 0) {
        alert("Payment amount cannot be negative.");
        return;
      }
      
      const newTotalPaidAmount = alreadyPaid + newPaymentInput;

      if (newTotalPaidAmount > totalSaleAmountAfterPayment + 0.01) {
        alert(`The total paid amount (₹${newTotalPaidAmount.toFixed(2)}) cannot exceed the total sale amount (₹${totalSaleAmountAfterPayment.toFixed(2)}).`);
        return;
      }

      const newBalance = totalSaleAmountAfterPayment - newTotalPaidAmount;

      const updatedSale = {
        ...originalSale,
        amountPaid: newTotalPaidAmount,
        balanceDue: parseFloat(newBalance.toFixed(2)),
        paymentMethod: paymentMode,
        isPaid: newBalance <= 0.01,
      };

      updateIndoorSalePayment(updatedSale);
      alert("Payment successfully recorded!");
      navigate('/indoor-sales-list');

    } else {
      // Logic for new sale
      if (!saleDate || !customerName || !billNo || saleItems.length === 0) {
        alert("Please fill in required sale details (Date, Customer Name, Bill No.) and add at least one item to the sale list.");
        return;
      }
      
      // Final check for auto-filled patient data
      if (!patientId || !selectedPatientAdmissionId) {
         alert("Please select an Indoor Patient to proceed with the sale.");
         return;
      }
      
      if (!category) {
          alert("Please select a Category for the sale.");
          return;
      }

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
        consultantRegNo, // This now holds admissionId
        bedDetails,
        billNo,
        remarks,
        items: saleItems,
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMode,
        amountPaid: safeParseFloat(amountPaid),
        netAmount: roundedNetAmount,
        totalSaleQty: totalSaleQty,
        balanceDue: roundedNetAmount - safeParseFloat(amountPaid),
        isPaid: (roundedNetAmount - safeParseFloat(amountPaid)) <= 0,
      };

      try {
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

        addIndoorSale(saleTransaction);
        setLatestSale(saleTransaction);
        
        alert("Sale completed successfully!");

        navigate(`/print-indoor/${saleTransaction.id}`);
        clearFormFields();
      } catch (error) {
        console.error("Error saving sale:", error);
        alert("There was an error saving the sale. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    navigate('/indoor-sales-list');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mx-auto my-2 border border-gray-200 text-gray-900">
      <div className="flex justify-between items-center mb-2 border-b pb-1">
        <h2 className="text-xl font-bold text-teal-800">
          {isUpdatingPayment ? "UPDATE PAYMENT FOR INDOOR SALE" : "INDOOR SALE"}
        </h2>
        <div>
          <button
            type="button"
            onClick={() => navigate("/indoor-sales-list")}
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
            INDOOR SALES LIST
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitSale} noValidate>
        {/* NEW PATIENT SELECTION FIELDSET */}
        <fieldset className={`border border-gray-300 p-2 rounded-md mb-2 ${isUpdatingPayment ? 'bg-gray-50' : ''}`}>
          <legend className="text-teal-700 text-sm font-bold px-2">
            INDOOR PATIENT SELECTION
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <label htmlFor="selectedPatient" className={labelClass}>
                Select Indoor Patient {requiredSpan}
              </label>
              <select 
                id="selectedPatient" 
                value={selectedPatientAdmissionId} 
                // The Admission ID (p.id) is used as the value to easily look up the full record
                onChange={(e) => setSelectedPatientAdmissionId(e.target.value)} 
                disabled={isUpdatingPayment}
                className={isUpdatingPayment ? readOnlyInputClass : inputClass} 
                required
              >
                <option value="">-- Select Patient --</option>
                {DUMMY_INDOOR_PATIENTS.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.patients.name} ({record.patients.regId}) - Bed: {record.bed.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
               <label htmlFor="currentBillNoDisplay" className={labelClass}>
                Bill No.
              </label>
              <input type="text" id="currentBillNoDisplay" value={billNo || 'Auto-Generate on Patient Select'} className={readOnlyInputClass} readOnly />
            </div>
          </div>
        </fieldset>
        {/* END NEW PATIENT SELECTION FIELDSET */}

        <fieldset className={`border border-gray-300 p-2 rounded-md mb-2 ${isUpdatingPayment ? 'bg-gray-50' : ''}`}>
          <legend className="text-teal-700 text-sm font-bold px-2">
            SALE DETAILS
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
            <div>
              <label htmlFor="saleDate" className={labelClass}>
                Sale Date {requiredSpan}
              </label>
              <input type="date" id="saleDate" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} readOnly={isUpdatingPayment} className={isUpdatingPayment ? readOnlyInputClass : inputClass} required />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="customerName" className={labelClass}>
                Customer Name {requiredSpan}
              </label>
              <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} readOnly={true} className={readOnlyInputClass} required />
            </div>
            <div>
              <label htmlFor="patientId" className={labelClass}>
                Patient ID / Pn No.
              </label>
              <input type="text" id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="ID / Pn No." />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category {requiredSpan}
              </label>
              <select 
                id="category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                disabled={isUpdatingPayment} 
                className={isUpdatingPayment ? readOnlyInputClass : inputClass}
                required
              >
                <option value="">-- Select --</option>
                {patientCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contactNo" className={labelClass}>
                Contact No.
              </label>
              <input type="text" id="contactNo" value={contactNo} onChange={(e) => setContactNo(e.target.value)} readOnly={true} className={readOnlyInputClass} />
            </div>
            <div>
              <label htmlFor="sex" className={labelClass}>
                Sex
              </label>
              <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} disabled={true} className={readOnlyInputClass}>
                <option value="">-- Select --</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className={labelClass}>
                Age
              </label>
              <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Age" />
            </div>
            <div className="md:col-span-3 lg:col-span-1">
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Enter Address" />
            </div>
            <div>
              <label htmlFor="state" className={labelClass}>
                State/City
              </label>
              <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Enter State/City" />
            </div>
            <div>
              <label htmlFor="doctorName" className={labelClass}>
                Doctor's Name
              </label>
              <input type="text" id="doctorName" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Enter Doctor Name" />
            </div>
            <div>
              <label htmlFor="consultantRegNo" className={labelClass}>
                Admission ID (Consultant Reg. No.)
              </label>
              <input type="text" id="consultantRegNo" value={consultantRegNo} onChange={(e) => setConsultantRegNo(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Consultant Reg. No." />
            </div>
            <div>
              <label htmlFor="bedDetails" className={labelClass}>
                Bed Details
              </label>
              <input type="text" id="bedDetails" value={bedDetails} onChange={(e) => setBedDetails(e.target.value)} readOnly={true} className={readOnlyInputClass} placeholder="Bed No., Ward, etc." />
            </div>
            {/* <div>
              <label htmlFor="billNo" className={labelClass}>
                Bill No. {requiredSpan}
              </label>
              <input type="text" id="billNo" value={billNo} onChange={(e) => setBillNo(e.target.value)} readOnly={true} className={readOnlyInputClass} required />
            </div> */}
            <div className="lg:col-span-3">
              <label htmlFor="remarks" className={labelClass}>
                Remarks
              </label>
              <textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} readOnly={isUpdatingPayment} className={`${isUpdatingPayment ? readOnlyInputClass : inputClass} h-16`}></textarea>
            </div>
          </div>
        </fieldset>

        {!isUpdatingPayment && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <fieldset className="border border-gray-300 p-2 rounded-md w-full lg:w-2/3">
                <legend className="text-teal-700 text-sm font-bold px-2">
                  ADD ITEM TO SALE
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5 mt-2">
                  <div className="md:col-span-full">
                    <label
                      htmlFor="selectedItem"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Select Item/Medicine <span className="text-red-500">*</span>
                    </label>

                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const parsedExpiryDate = (expDateStr) => {
                        try {
                          const parts = expDateStr?.split("/");
                          if (parts?.length === 2) {
                            const month = parseInt(parts[0], 10);
                            const year = parseInt(parts[1], 10);
                            return new Date(year, month, 0);
                          }
                          return new Date(expDateStr);
                        } catch {
                          return new Date("2100-01-01");
                        }
                      };

                      const sortedAvailableInventoryItems = [...inventoryItems]
                        .filter((item) => {
                          const stock = parseFloat(item.currentStock || 0);
                          const expiryDate = parsedExpiryDate(item.expDate);
                          return (
                            stock > 0 && !isNaN(expiryDate) && expiryDate >= today
                          );
                        })
                        .sort(
                          (a, b) =>
                            parsedExpiryDate(a.expDate) -
                            parsedExpiryDate(b.expDate)
                        );

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
                                
                                {item.nameOfItemMedicine || "Unnamed Item"} (
                                {item.itemManufacturerMake || "No Manufacturer"})
                                Exp: {item.expDate || "N/A"},{" "}
                                (Batch: {item.batchSrlNo || "N/A"}, Stock:{" "}
                                {item.currentStock || 0} Strip,{" "}
                                {item.saleUnit || "Units"})
                              </option>
                            ))}
                          </select>
                          {sortedAvailableInventoryItems.length === 0 && (
                            <p className="text-red-500 text-xs mt-0.5">
                              No non-expired items with stock available.
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
                          placeholder={`Max allowed: ₹${maxAllowedStripRate.toFixed(
                            3
                          )}`}
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
                          placeholder={`Max allowed: ₹${maxAllowedLooseRate.toFixed(
                            3
                          )}`}
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
                        maxAllowedStripRate + 0.001 &&
                        safeParseFloat(mrp) > 0 && (
                          <p className="text-red-600 text-xs mt-0.5">
                            Warning: Strip rate (₹
                            {safeParseFloat(editableStripRate).toFixed(2)}) must
                            not exceed MRP (₹{mrp.toFixed(2)}).
                          </p>
                        )}
                      {safeParseFloat(editableLooseRate) >
                        maxAllowedLooseRate + 0.001 &&
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

              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                  <legend className="text-teal-700 text-sm font-bold px-2">
                    SUMMARY
                  </legend>
                  <div className="space-y-2 mt-1">
                    <div className="flex justify-between text-base font-medium">
                      <span>Total Qty.:</span>
                      <span>
                        {totalSaleQty.toFixed(2)}{" "}
                        {selectedItemOriginalDetails?.saleUnit || "Strip"}
                      </span>
                    </div>
                    {/* <div className="flex justify-between text-base font-medium">
                      <span>Total Discount:</span>
                      <span>₹{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium">
                      <span>Total GST:</span>
                      <span>₹{totalGst.toFixed(2)}</span>
                    </div> */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Sub-Total:</span>
                        <span>₹{totalSaleAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                       <span>Round Off:</span>
                            <span className={roundOffAmount < 0 ? "text-red-500" : "text-green-500"}>
                                {roundOffAmount < 0 ? "- " : "+ "}₹{Math.abs(roundOffAmount).toFixed(2)}
                            </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-teal-700 border-t pt-2">
                      <span>Net Amount:</span>
                      <span>₹{roundedNetAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </fieldset>
                <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                  <legend className="text-teal-700 text-sm font-bold px-2">
                    PAYMENT
                  </legend>
                  <div className="space-y-2 mt-1">
                    <div>
                      <label htmlFor="paymentMode" className={labelClass}>
                        Payment Method
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
                    {paymentMode !== "Due" && (
                      <div>
                        <label htmlFor="amountPaid" className={labelClass}>
                          Amount Paid
                        </label>
                        <input
                          type="number"
                          id="amountPaid"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className={inputClass}
                          step="0.01"
                        />
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-700 border-t pt-2">
                      <span>Balance Due:</span>
                      <span
                        className={
                          (roundedNetAmount - safeParseFloat(amountPaid)) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        ₹{(roundedNetAmount - safeParseFloat(amountPaid)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

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
                      <tr key={item.saleEntryId} className="hover:bg-gray-50">
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
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveSaleItem(
                                item.saleEntryId
                              )
                            }
                            className="text-red-500 hover:text-red-700"
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
        )}

        {isUpdatingPayment && (
          <div className="flex flex-col lg:flex-row gap-3 mt-4">
            <div className="w-full">
              {saleItems.length > 0 && (
                <div className="overflow-x-auto border border-gray-300 rounded-md">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 px-2 pt-2">
                        Items in this Sale
                    </h3>
                    <table className="min-w-full bg-white text-xs">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-2 py-1.5 border-b">Item Name</th>
                                <th className="px-2 py-1.5 border-b">Batch/Exp</th>
                                <th className="px-2 py-1.5 border-b">Barcode</th>
                                <th className="px-2 py-1.5 border-b">Strip Qty</th>
                                <th className="px-2 py-1.5 border-b">Loose Qty</th>
                                <th className="px-2 py-1.5 border-b">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {saleItems.map((item) => (
                                <tr key={item.saleEntryId} className="hover:bg-gray-50">
                                    <td className="px-2 py-1.5 border-b">
                                        {item.nameOfItemMedicine}
                                    </td>
                                    <td className="px-2 py-1.5 border-b">
                                        {item.batchSrlNo}/{item.expDate}
                                    </td>
                                    <td className="px-2 py-1.5 border-b">
                                        {item.barcode || "N/A"}
                                    </td>
                                    <td className="px-2 py-1.5 border-b">
                                        {item.stripQty}
                                    </td>
                                    <td className="px-2 py-1.5 border-b">
                                        {item.looseQty}
                                    </td>
                                    <td className="px-2 py-1.5 border-b">
                                        ₹{item.netAmount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-3">
              <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                <legend className="text-teal-700 text-sm font-bold px-2">
                    SUMMARY
                </legend>
                <div className="space-y-2 mt-1">
                    <div className="flex justify-between text-lg font-bold text-teal-700 border-t pt-2">
                        <span>Net Amount:</span>
                        <span>₹{netAmount.toFixed(2)}</span>
                    </div>
                </div>
              </fieldset>
              <fieldset className="border border-gray-300 p-2 rounded-md bg-white shadow-sm">
                <legend className="text-teal-700 text-sm font-bold px-2">
                  PAYMENT
                </legend>
                <div className="space-y-2 mt-1">
                  {isUpdatingPayment && (
                    <div className="flex justify-between text-sm font-medium">
                      <span>Amount Previously Paid:</span>
                      <span>₹{currentPaid.toFixed(2)}</span>
                    </div>
                  )}
                  <div>
                    <label htmlFor="paymentMode" className={labelClass}>
                      Payment Method
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
                  {paymentMode !== "Due" && (
                    <div>
                      <label htmlFor="amountPaid" className={labelClass}>
                        Amount Paid
                      </label>
                      <input
                        type="number"
                        id="amountPaid"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className={inputClass}
                        step="0.01"
                        placeholder="Enter new payment amount"
                      />
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-700 border-t pt-2">
                    <span>Balance Due:</span>
                    <span
                      className={
                        newBalanceDue > 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      ₹{newBalanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          {isUpdatingPayment ? (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center text-sm"
            >
              CANCEL
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center text-sm"
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
          )}

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
            {isUpdatingPayment ? "UPDATE PAYMENT" : "COMPLETE SALE"}
          </button>
        </div>
      </form>
      
      <div style={{ display: 'none' }}>
        {latestSale && <PrintIndoorInvoice ref={printComponentRef} invoiceData={latestSale} />}
      </div>
    </div>
  );
};

export default IndoorSaleForm;