// src/store/itemStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Dummy Data for items associated with different vendors ---
// IMPORTANT: All fields that you intend to display MUST be present and populated here.
const initialDummyItems = [
  {
    id: 101, // Unique ID for the master item
    itemCode: "MED001",
    tradeName: "Paracetamol 500mg Tab", // Primary Item Name
    nameOfGeneric: "PARACETAMOL", // Generic Name
    existingName: "Apollo Pharma", // Vendor Name
    manufacturer: "PharmaCorp",
    productType: "MEDICINE",
    productCategory: "Tablet",
    subCategory: "Pain Killer",
    subSubCategory: "", // Keep empty if not applicable
    hsnCode: "3004.90.11",
    gstIgst: 12.0,
    gstCgst: 6,
    gstSgst: 6,
    formulation: "TABLET",
    strength: "500 MG",
    drugSchedule: "H",
    brandName: "Paracip",
    packaging: "10 Strips",
    currentStock: 500, // Stock Quantity
    purchaseRateStrip: 15.50, // Actual Rate source
    saleRateStrip: 20.00,
    purchaseMrpStrip: 22.00, // MRP source
    cfQty: 10,
    cfUnit: "BOX",
    stockAlertQty: 50,
    expiryCheckMonth: "2026-12",
    onlineItem: true,
    popularItem: false,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 102,
    itemCode: "MED002",
    tradeName: "Amoxicillin 250mg Cap",
    nameOfGeneric: "AMOXICILLIN",
    existingName: "MediEquip Supplies",
    manufacturer: "Global Drugs",
    productType: "MEDICINE",
    productCategory: "Capsule",
    subCategory: "Antibiotic",
    subSubCategory: "",
    hsnCode: "3004.20.01",
    gstIgst: 5.0,
    gstCgst: 2.5,
    gstSgst: 2.5,
    formulation: "CAPSULE",
    strength: "250 MG",
    drugSchedule: "H1",
    brandName: "Amoxil",
    packaging: "100 Capsules",
    currentStock: 300,
    purchaseRateStrip: 8.25,
    saleRateStrip: 11.50,
    purchaseMrpStrip: 13.00,
    cfQty: 1, // CF Quantity is per pack/strip typically
    cfUnit: "PACK",
    stockAlertQty: 30,
    expiryCheckMonth: "2027-06",
    onlineItem: false,
    popularItem: true,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 103,
    itemCode: "MED003",
    tradeName: "Omez 20mg Capsule",
    nameOfGeneric: "OMEPRAZOLE",
    existingName: "Apollo Pharma",
    manufacturer: "MediLabs",
    productType: "MEDICINE",
    productCategory: "Capsule",
    subCategory: "Antacid",
    subSubCategory: "",
    hsnCode: "3004.90.99",
    gstIgst: 18.0,
    gstCgst: 9,
    gstSgst: 9,
    formulation: "CAPSULE",
    strength: "20 MG",
    drugSchedule: "G",
    brandName: "Omez",
    packaging: "10 Capsules",
    currentStock: 120,
    purchaseRateStrip: 45.00,
    saleRateStrip: 60.00,
    purchaseMrpStrip: 65.00,
    cfQty: 1,
    cfUnit: "STRIP",
    stockAlertQty: 20,
    expiryCheckMonth: "2026-09",
    onlineItem: true,
    popularItem: true,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 104,
    itemCode: "MED004",
    tradeName: "Cough Syrup 100ml",
    nameOfGeneric: "DEXTROMETHORPHAN",
    existingName: "Apollo Pharma",
    manufacturer: "HealthCare Inc.",
    productType: "MEDICINE",
    productCategory: "Syrup",
    subCategory: "Cough & Cold",
    subSubCategory: "",
    hsnCode: "3004.90.99",
    gstIgst: 12.0,
    gstCgst: 6,
    gstSgst: 6,
    formulation: "SYRUP",
    strength: "100 ML",
    drugSchedule: "N/A",
    brandName: "Cofnil",
    packaging: "1 Bottle",
    currentStock: 80,
    purchaseRateStrip: 70.00,
    saleRateStrip: 95.00,
    purchaseMrpStrip: 105.00,
    cfQty: 1,
    cfUnit: "BOTTLE",
    stockAlertQty: 10,
    expiryCheckMonth: "2025-11",
    onlineItem: false,
    popularItem: false,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 201,
    itemCode: "HOS001",
    tradeName: "Disposable Gloves (Box of 100)",
    nameOfGeneric: "N/A - Gloves", // Generic name might be "N/A" for non-medicines
    existingName: "MediEquip Supplies",
    manufacturer: "SafetyGear",
    productType: "EQUIPMENT",
    productCategory: "Protective Gear",
    subCategory: "Gloves",
    subSubCategory: "",
    hsnCode: "3926.20.10",
    gstIgst: 18.0,
    gstCgst: 9,
    gstSgst: 9,
    formulation: "N/A",
    strength: "N/A",
    drugSchedule: "N/A",
    brandName: "Safeguard",
    packaging: "100 Pcs/Box",
    currentStock: 50,
    purchaseRateStrip: 120.00,
    saleRateStrip: 180.00,
    purchaseMrpStrip: 200.00,
    cfQty: 10,
    cfUnit: "CARTON",
    stockAlertQty: 5,
    expiryCheckMonth: "", // No expiry for some items
    onlineItem: true,
    popularItem: false,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 202,
    itemCode: "HOS002",
    tradeName: "Surgical Mask (Pack of 50)",
    nameOfGeneric: "N/A - Mask",
    existingName: "MediEquip Supplies",
    manufacturer: "CleanMed",
    productType: "EQUIPMENT",
    productCategory: "Protective Gear",
    subCategory: "Masks",
    subSubCategory: "",
    hsnCode: "6307.90.00",
    gstIgst: 5.0,
    gstCgst: 2.5,
    gstSgst: 2.5,
    formulation: "N/A",
    strength: "N/A",
    drugSchedule: "N/A",
    brandName: "PureMask",
    packaging: "50 Pcs/Pack",
    currentStock: 150,
    purchaseRateStrip: 60.00,
    saleRateStrip: 90.00,
    purchaseMrpStrip: 100.00,
    cfQty: 20,
    cfUnit: "CASE",
    stockAlertQty: 15,
    expiryCheckMonth: "",
    onlineItem: true,
    popularItem: true,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 203,
    itemCode: "HOS003",
    tradeName: "Syringe 5ml (Pack of 10)",
    nameOfGeneric: "N/A - Syringe",
    existingName: "Global Healthcare",
    manufacturer: "Precision Medical",
    productType: "SUPPLY",
    productCategory: "Medical Tools",
    subCategory: "Syringes",
    subSubCategory: "",
    hsnCode: "9018.31.00",
    gstIgst: 12.0,
    gstCgst: 6,
    gstSgst: 6,
    formulation: "N/A",
    strength: "N/A",
    drugSchedule: "N/A",
    brandName: "InjectEase",
    packaging: "10 Pcs/Pack",
    currentStock: 90,
    purchaseRateStrip: 40.00,
    saleRateStrip: 60.00,
    purchaseMrpStrip: 65.00,
    cfQty: 50,
    cfUnit: "BOX",
    stockAlertQty: 10,
    expiryCheckMonth: "",
    onlineItem: false,
    popularItem: false,
    returnable: true,
    status: "ACTIVE"
  },
  {
    id: 204,
    itemCode: "HOS004",
    tradeName: "Cotton Swabs (200 Pcs)",
    nameOfGeneric: "N/A - Cotton",
    existingName: "Apollo Pharma",
    manufacturer: "SoftCare",
    productType: "SUPPLY",
    productCategory: "Consumables",
    subCategory: "Cotton",
    subSubCategory: "",
    hsnCode: "3005.90.10",
    gstIgst: 5.0,
    gstCgst: 2.5,
    gstSgst: 2.5,
    formulation: "N/A",
    strength: "N/A",
    drugSchedule: "N/A",
    brandName: "SoftTouch",
    packaging: "200 Pcs/Pack",
    currentStock: 70,
    purchaseRateStrip: 25.00,
    saleRateStrip: 35.00,
    purchaseMrpStrip: 40.00,
    cfQty: 10,
    cfUnit: "CASE",
    stockAlertQty: 8,
    expiryCheckMonth: "",
    onlineItem: true,
    popularItem: false,
    returnable: true,
    status: "ACTIVE"
  },
];


const useItemStore = create(
  persist(
    (set) => ({
      allItems: initialDummyItems,
      itemData: null, // Used for displaying a single item's details (e.g., in ReturnItemDetailPage)

      // Current session return items (items added to the form before saving the document)
      currentSessionReturnItems: [],
      addReturnItem: (item) => set((state) => ({
        currentSessionReturnItems: [...state.currentSessionReturnItems, item]
      })),
      // Update/Delete a specific item in the current session list
      updateCurrentSessionReturnItem: (id, updatedFields) => set((state) => ({
        currentSessionReturnItems: state.currentSessionReturnItems.map(item =>
          item.id === id ? { ...item, ...updatedFields } : item
        )
      })),
      deleteCurrentSessionReturnItem: (id) => set((state) => ({
        currentSessionReturnItems: state.currentSessionReturnItems.filter(item => item.id !== id)
      })),
      clearCurrentSessionReturnItems: () => set({ currentSessionReturnItems: [] }),


      // Saved/Finalized Return Documents (complete return transactions)
      savedReturnDocuments: [],
      addReturnDocument: (document) => set((state) => ({
        savedReturnDocuments: [...state.savedReturnDocuments, document]
      })),
      clearAllSavedReturnDocuments: () => set({ savedReturnDocuments: [] }), // For development/testing


      // General item management actions (for allItems data)
      setItemData: (data) => set({ itemData: data }), // Used to pre-populate form for editing or view details
      clearItemData: () => set({ itemData: null }),

      addItem: (item) => set((state) => ({
        allItems: [...state.allItems, { ...item, id: Date.now() }]
      })),

      updateItem: (id, updatedItem) =>
        set((state) => ({
          allItems: state.allItems.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
          itemData: state.itemData && state.itemData.id === id ? { ...state.itemData, ...updatedItem } : state.itemData,
        })),

      deleteItem: (id) =>
        set((state) => ({
          allItems: state.allItems.filter((item) => item.id !== id),
          itemData: state.itemData && state.itemData.id === id ? null : state.itemData,
        })),

      clearAllItems: () => set({ allItems: [], itemData: null }),
    }),
    {
      name: 'item-storage', // unique name for local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useItemStore;