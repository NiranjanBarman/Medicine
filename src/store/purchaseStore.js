// // src/store/purchaseStore.js
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';

// const usePurchaseStore = create(
//   persist(
//     (set) => ({
//       // Existing state for all historical purchases (with dummy data for testing)
//       allPurchases: [
//           {
//               id: 1,
//               nameOfVendor: 'Pharma Dist. A',
//               billNo: 'B001',
//               billDate: '2025-06-15',
//               receivedItems: [
//                   {
//                       id: 'item1-pur1', // Unique ID for this specific received item
//                       itemCode: 'MED001',
//                       nameOfGeneric: 'Generic A',
//                       tradeName: 'Brand X',
//                       manufacturer: 'Manufac ABC',
//                       productType: 'Tablet',
//                       batchNo: 'BAT123',
//                       expDate: '2026-12',
//                       purchaseRateStrip: 10.50,
//                       saleRateStrip: 12.00,
//                       purchaseMrpStrip: 15.00,
//                       schDisc: 5,
//                       disc: 2,
//                       cfQty: 10,
//                       cfUnit: 'Strip',
//                       receiveQty: 100, // Quantity received in this purchase
//                       saleUnit: 'Pcs',
//                       productCategory: 'Rx',
//                       subCategory: 'Painkiller',
//                       hsnCode: '3004',
//                       gstIgst: 12,
//                       gstCgst: 6,
//                       gstSgst: 6, // Ensure this is a number or string as expected
//                       formulation: 'Tablet',
//                       strength: '500mg',
//                       drugSchedule: 'H',
//                       brandName: 'BrandX',
//                       packaging: '10s',
//                       stockAlertQty: 50,
//                       expiryCheckMonth: 6,
//                       onlineItem: true,
//                       popularItem: true,
//                       returnable: true,
//                       status: 'Active'
//                   },
//                   {
//                       id: 'item2-pur1',
//                       itemCode: 'MED002',
//                       nameOfGeneric: 'Generic B',
//                       tradeName: 'Brand Y',
//                       manufacturer: 'Manufac DEF',
//                       productType: 'Syrup',
//                       batchNo: 'SYR456',
//                       expDate: '2027-01',
//                       purchaseRateStrip: 50.00,
//                       saleRateStrip: 60.00,
//                       purchaseMrpStrip: 75.00,
//                       schDisc: 0,
//                       disc: 5,
//                       cfQty: 1,
//                       cfUnit: 'Bottle',
//                       receiveQty: 50,
//                       saleUnit: 'Bottle',
//                       productCategory: 'OTC',
//                       subCategory: 'Cough',
//                       hsnCode: '3004',
//                       gstIgst: 18,
//                       gstCgst: 9,
//                       gstSgst: 9, // Ensure this is a number or string as expected
//                       formulation: 'Syrup',
//                       strength: '100ml',
//                       drugSchedule: 'N/A',
//                       brandName: 'BrandY',
//                       packaging: '100ml',
//                       stockAlertQty: 20,
//                       expiryCheckMonth: 3,
//                       onlineItem: false,
//                       popularItem: true,
//                       returnable: true,
//                       status: 'Active'
//                   },
//               ],
//           },
//           {
//               id: 2,
//               nameOfVendor: 'Medi Supplies Co.',
//               billNo: 'MS005',
//               billDate: '2025-07-01',
//               receivedItems: [
//                   {
//                       id: 'item3-pur2',
//                       itemCode: 'MED003',
//                       nameOfGeneric: 'Generic C',
//                       tradeName: 'Brand Z',
//                       manufacturer: 'Manufac GHI',
//                       productType: 'Injection',
//                       batchNo: 'INJ789',
//                       expDate: '2026-09',
//                       purchaseRateStrip: 120.00,
//                       saleRateStrip: 150.00,
//                       purchaseMrpStrip: 180.00,
//                       schDisc: 10,
//                       disc: 0,
//                       cfQty: 5,
//                       cfUnit: 'Amp',
//                       receiveQty: 20,
//                       saleUnit: 'Amp',
//                       productCategory: 'Rx',
//                       subCategory: 'Antibiotic',
//                       hsnCode: '3004',
//                       gstIgst: 5,
//                       gstCgst: 2.5,
//                       gstSgst: 2.5, // Ensure this is a number or string as expected
//                       formulation: 'Injection',
//                       strength: '10mg',
//                       drugSchedule: 'H1',
//                       brandName: 'BrandZ',
//                       packaging: '1s',
//                       stockAlertQty: 10,
//                       expiryCheckMonth: 12,
//                       onlineItem: true,
//                       popularItem: false,
//                       returnable: true,
//                       status: 'Active'
//                   },
//               ],
//           },
//       ],

//       // State for items currently being prepared for return (active session)
//       currentSessionReturnItems: [],
//       // State to hold the single item data for the detail page view
//       itemData: null,
//       // State to hold all saved return documents
//       allReturnDocuments: [],

//       // State for Advance Receipts
//       allAdvanceReceipts: [],

//       // State for all bills (dummy data for now, ideally fetched from purchase data)
//       allBills: [
//         {
//             id: 'bill-B001-PharmaDistA',
//             vendorName: 'Pharma Dist. A',
//             billNo: 'B001',
//             billDate: '2025-06-15',
//             totalAmount: 100 * 10.50 * (1 - 0.05) * (1 - 0.02) + 50 * 50.00 * (1 - 0.05), // Example calculation
//             amountPaid: 0,
//             dueDate: '2025-07-15',
//             status: 'Due', // 'Due', 'Partially Paid', 'Paid'
//             items: [ // Simplified item details for reference
//                 { itemCode: 'MED001', nameOfGeneric: 'Generic A', quantity: 100, rate: 10.50 },
//                 { itemCode: 'MED002', nameOfGeneric: 'Generic B', quantity: 50, rate: 50.00 },
//             ]
//         },
//         {
//             id: 'bill-MS005-MediSuppliesCo',
//             vendorName: 'Medi Supplies Co.',
//             billNo: 'MS005',
//             billDate: '2025-07-01',
//             totalAmount: 20 * 120.00 * (1 - 0.10),
//             amountPaid: 0,
//             dueDate: '2025-08-01',
//             status: 'Due',
//             items: [
//                 { itemCode: 'MED003', nameOfGeneric: 'Generic C', quantity: 20, rate: 120.00 },
//             ]
//         },
//       ],

//       // State to store all bulk payments made
//       allBulkPayments: [],

//       // New: State for GRC Invoices (dummy data)
//       allGRCInvoices: [
//         {
//           id: 'GRC000000031_24-25',
//           vendorName: 'LAKSHMI ENTERPRISE',
//           invoiceNo: 'GRC000000031_24-25 (05-FEB-2025)',
//           invoiceDate: '2025-02-05',
//           netAmount: 2595.00,
//           previouslyPaidAdjusted: 0,
//           dueAmount: 2595.00,
//           returnAdjustment: 0,
//           status: 'Due', // 'Due', 'Partially Paid', 'Paid'
//         },
//         {
//           id: 'GRC000000032_24-25',
//           vendorName: 'LAKSHMI ENTERPRISE',
//           invoiceNo: 'GRC000000032_24-25 (10-MAR-2025)',
//           invoiceDate: '2025-03-10',
//           netAmount: 1500.00,
//           previouslyPaidAdjusted: 0,
//           dueAmount: 1500.00,
//           returnAdjustment: 0,
//           status: 'Due',
//         },
//         {
//           id: 'GRC000000033_24-25',
//           vendorName: 'Pharma Dist. A',
//           invoiceNo: 'GRC000000033_24-25 (20-APR-2025)',
//           invoiceDate: '2025-04-20',
//           netAmount: 500.00,
//           previouslyPaidAdjusted: 0,
//           dueAmount: 500.00,
//           returnAdjustment: 0,
//           status: 'Due',
//         },
//       ],
//             indoorSales: [
//         {
//           id: 'indoor-sale-dummy-1',
//           saleDate: '2025-07-10',
//           patientName: 'Dummy Patient One',
//           patientId: 'IPD001',
//           category: 'General',
//           mobileNo: '9876543210',
//           sex: 'Male',
//           age: 45,
//           address: '123 Hospital Road, Indore',
//           state: 'Madhya Pradesh',
//           doctorName: 'Dr. Sharma',
//           consultantRegNo: 'CRN123',
//           bedDetails: 'Ward A, Bed 101',
//           items: [
//             { tradeName: 'Paracetamol 500mg', totalSoldQty: 20, netValue: 100.00 },
//             { tradeName: 'Amoxicillin 250mg', totalSoldQty: 10, netValue: 150.00 },
//           ],
//           totalQty: 30,
//           netAmount: 250.00,
//           savedAt: '2025-07-10T10:00:00.000Z',
//         },
//         {
//           id: 'indoor-sale-dummy-2',
//           saleDate: '2025-07-11',
//           patientName: 'Dummy Patient Two',
//           patientId: 'IPD002',
//           category: 'Private',
//           mobileNo: '9988776655',
//           sex: 'Female',
//           age: 30,
//           address: '456 Clinic Lane, Indore',
//           state: 'Madhya Pradesh',
//           doctorName: 'Dr. Gupta',
//           consultantRegNo: 'CRN456',
//           bedDetails: 'Private Room 5',
//           items: [
//             { tradeName: 'Cough Syrup', totalSoldQty: 1, netValue: 80.00 },
//             { tradeName: 'Bandage Roll', totalSoldQty: 5, netValue: 25.00 },
//           ],
//           totalQty: 6,
//           netAmount: 105.00,
//           savedAt: '2025-07-11T14:30:00.000Z',
//         },
//       ],
//       indoorSalesCount: 2,
//                   outdoorSales: [
//                 {
//                     id: 'outdoor-sale-dummy-1',
//                     saleDate: '2025-07-09',
//                     patientName: 'Outdoor Customer One',
//                     mobileNo: '7778889990',
//                     sex: 'Female',
//                     age: 28,
//                     address: '789 Market Street, Indore',
//                     state: 'Madhya Pradesh',
//                     items: [ // This is the crucial 'items' array for filtering
//                         {
//                             itemId: 'OUT_ITEM_001', genericName: 'Antacid', tradeName: 'Gelusil', batchNo: 'OUTB001', expDate: '2025-12',
//                             saleQty: 2, saleRate: 30.00, mrp: 35.00, discPercent: 0, overallDiscPercent: 0, unit: 'Strips',
//                         },
//                         {
//                             itemId: 'OUT_ITEM_002', genericName: 'Pain Relief Spray', tradeName: 'Volini', batchNo: 'OUTB002', expDate: '2026-05',
//                             saleQty: 1, saleRate: 120.00, mrp: 130.00, discPercent: 10, overallDiscPercent: 0, unit: 'Bottle',
//                         },
//                     ],
//                     totalQty: 3,
//                     netAmount: 180.00,
//                     savedAt: '2025-07-09T11:00:00.000Z',
//                 },
//                 {
//                     id: 'outdoor-sale-dummy-2',
//                     saleDate: '2025-07-12',
//                     patientName: 'Outdoor Customer Two',
//                     mobileNo: '6665554443',
//                     sex: 'Male',
//                     age: 55,
//                     address: '101 Park Avenue, Indore',
//                     state: 'Madhya Pradesh',
//                     items: [
//                         {
//                             itemId: 'OUT_ITEM_003', genericName: 'Multivitamin', tradeName: 'Becosules', batchNo: 'OUTB003', expDate: '2027-02',
//                             saleQty: 1, saleRate: 150.00, mrp: 160.00, discPercent: 0, overallDiscPercent: 5, unit: 'Bottle',
//                         },
//                     ],
//                     totalQty: 1,
//                     netAmount: 150.00,
//                     savedAt: '2025-07-12T09:15:00.000Z',
//                 },
//             ],
//             outdoorSalesCount: 2,
      
//       // New: State to store all GRC Wise Payments
//       allGRCPayments: [],


//       // Actions to manage currentSessionReturnItems
//       addReturnItem: (item) => set((state) => ({
//           currentSessionReturnItems: [...state.currentSessionReturnItems, { ...item, id: Date.now() }]
//       })),
//       deleteCurrentSessionReturnItem: (itemId) => set((state) => ({
//           currentSessionReturnItems: state.currentSessionReturnItems.filter((item) => item.id !== itemId)
//       })),
//       clearCurrentSessionReturnItems: () => set({ currentSessionReturnItems: [] }),

//       // Action to set item data for detail page view
//       setItemData: (item) => set({ itemData: item }),

//       // Action to add a complete return document
//       addReturnDocument: (document) => set((state) => ({
//           allReturnDocuments: [...state.allReturnDocuments, document]
//       })),

//       // Action to add a new purchase to allPurchases
//       addPurchase: (newPurchase) => {
//         set((state) => ({
//           allPurchases: [...state.allPurchases, newPurchase],
//         }));
//       },

//       // Action to add an Advance Receipt
//       addAdvanceReceipt: (receipt) => set((state) => ({
//         allAdvanceReceipts: [...state.allAdvanceReceipts, { ...receipt, id: Date.now() }]
//       })),

//       // Action to add a bulk payment
//       addBulkPayment: (payment) => set((state) => ({
//         allBulkPayments: [...state.allBulkPayments, { ...payment, id: Date.now() }]
//       })),

      

//       addIndoorSale: (indoorSaleData) =>
//         set((state) => {
//           const newIndoorSale = { ...indoorSaleData, id: `indoor-sale-${Date.now()}` }; // Unique ID for indoor sale
//           return {
//             indoorSales: [...state.indoorSales, newIndoorSale],
//             indoorSalesCount: state.indoorSalesCount + 1,
//           };
//         }),

//       // Action to update bill status (e.g., after payment)
//       updateBillStatus: (billId, newStatus, paidAmount) => set((state) => ({
//         allBills: state.allBills.map(bill =>
//           bill.id === billId
//             ? {
//                 ...bill,
//                 status: newStatus,
//                 amountPaid: (bill.amountPaid || 0) + paidAmount
//               }
//             : bill
//         )
//       })),

//       // New: Action to add a GRC Wise Payment
//       addGRCPayment: (payment) => set((state) => ({
//         allGRCPayments: [...state.allGRCPayments, { ...payment, id: Date.now() }]
//       })),

//       // New: Action to update GRC Invoice status
//       updateGRCInvoiceStatus: (grcId, newStatus, paidAmount) => set((state) => ({
//         allGRCInvoices: state.allGRCInvoices.map(grc =>
//           grc.id === grcId
//             ? {
//                 ...grc,
//                 status: newStatus,
//                 previouslyPaidAdjusted: (grc.previouslyPaidAdjusted || 0) + paidAmount,
//                 dueAmount: grc.netAmount - ((grc.previouslyPaidAdjusted || 0) + paidAmount)
//               }
//             : grc
//         )
//       })),
//     }),

//     {
//       name: 'purchase-store', // Unique name for local storage
//       storage: createJSONStorage(() => localStorage), // Use localStorage
//     }
//   )
// );

// export default usePurchaseStore;


import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const usePurchaseStore = create(
  persist(
    (set, get) => ({ // Added 'get' to access current state within actions
      // Existing state for all historical purchases (with dummy data for testing)
      allPurchases: [
        {
          id: 1,
          nameOfVendor: 'Pharma Dist. A',
          billNo: 'B001',
          billDate: '2025-06-15',
          receivedItems: [
            {
              id: 'item1-pur1', // Unique ID for this specific received item
              itemCode: 'MED001',
              nameOfGeneric: 'Generic A',
              tradeName: 'Brand X',
              manufacturer: 'Manufac ABC',
              productType: 'Tablet',
              batchNo: 'BAT123',
              expDate: '2026-12',
              purchaseRateStrip: 10.50,
              saleRateStrip: 12.00,
              purchaseMrpStrip: 15.00,
              schDisc: 5,
              disc: 2,
              cfQty: 10, // Conversion Factor: 1 Strip = 10 Pcs
              cfUnit: 'Pcs', // Unit for individual loose sale
              receiveQty: 100, // Quantity received in strips
              saleUnit: 'Pcs', // Unit for individual loose sale
              stripUnit: 'Strip', // Unit for strip sale
              productCategory: 'Rx',
              subCategory: 'Painkiller',
              hsnCode: '3004',
              gstIgst: 12,
              gstCgst: 6,
              gstSgst: 6,
              formulation: 'Tablet',
              strength: '500mg',
              drugSchedule: 'H',
              brandName: 'BrandX',
              packaging: '10s',
              stockAlertQty: 50,
              expiryCheckMonth: 6,
              onlineItem: true,
              popularItem: true,
              returnable: true,
              status: 'Active',
              // Add currentStock here, which will be updated by actions
              currentStock: 100 * 10, // Initial stock in loose units (100 strips * 10 pcs/strip)
              looseRate: 1.20, // Example loose rate (saleRateStrip / cfQty)
            },
            {
              id: 'item2-pur1',
              itemCode: 'MED002',
              nameOfGeneric: 'Generic B',
              tradeName: 'Brand Y',
              manufacturer: 'Manufac DEF',
              productType: 'Syrup',
              batchNo: 'SYR456',
              expDate: '2027-01',
              purchaseRateStrip: 50.00,
              saleRateStrip: 60.00,
              purchaseMrpStrip: 75.00,
              schDisc: 0,
              disc: 5,
              cfQty: 1, // Conversion Factor: 1 Bottle = 1 unit
              cfUnit: 'Bottle',
              receiveQty: 50, // Quantity received in bottles
              saleUnit: 'Bottle',
              stripUnit: 'Bottle',
              productCategory: 'OTC',
              subCategory: 'Cough',
              hsnCode: '3004',
              gstIgst: 18,
              gstCgst: 9,
              gstSgst: 9,
              formulation: 'Syrup',
              strength: '100ml',
              drugSchedule: 'N/A',
              brandName: 'BrandY',
              packaging: '100ml',
              stockAlertQty: 20,
              expiryCheckMonth: 3,
              onlineItem: false,
              popularItem: true,
              returnable: true,
              status: 'Active',
              currentStock: 50 * 1, // Initial stock in bottles
              looseRate: 60.00, // Same as strip rate if cfQty is 1
            },
          ],
        },
        {
          id: 2,
          nameOfVendor: 'Medi Supplies Co.',
          billNo: 'MS005',
          billDate: '2025-07-01',
          receivedItems: [
            {
              id: 'item3-pur2',
              itemCode: 'MED003',
              nameOfGeneric: 'Generic C',
              tradeName: 'Brand Z',
              manufacturer: 'Manufac GHI',
              productType: 'Injection',
              batchNo: 'INJ789',
              expDate: '2026-09',
              purchaseRateStrip: 120.00,
              saleRateStrip: 150.00,
              purchaseMrpStrip: 180.00,
              schDisc: 10,
              disc: 0,
              cfQty: 5, // Conversion Factor: 1 Amp = 5 units (e.g., 5ml if unit is ml)
              cfUnit: 'ml',
              receiveQty: 20, // Quantity received in Amps
              saleUnit: 'ml',
              stripUnit: 'Amp',
              productCategory: 'Rx',
              subCategory: 'Antibiotic',
              hsnCode: '3004',
              gstIgst: 5,
              gstCgst: 2.5,
              gstSgst: 2.5,
              formulation: 'Injection',
              strength: '10mg',
              drugSchedule: 'H1',
              brandName: 'BrandZ',
              packaging: '1s',
              stockAlertQty: 10,
              expiryCheckMonth: 12,
              onlineItem: true,
              popularItem: false,
              returnable: true,
              status: 'Active',
              currentStock: 20 * 5, // Initial stock in ml
              looseRate: 30.00, // Example loose rate (saleRateStrip / cfQty)
            },
          ],
        },
      ],

      // State for items currently being prepared for return (active session)
      currentSessionReturnItems: [],
      // State to hold the single item data for the detail page view
      itemData: null,
      // State to hold all saved return documents (Purchase Returns)
      allReturnDocuments: [],
      // State to hold all saved Sale Return documents
      allSaleReturns: [
        // Dummy data for testing the list page
        {
          id: 'SR001-20250714',
          returnDate: '2025-07-14',
          type: 'Indoor',
          patientName: 'Dummy Patient One',
          originalSaleInvoiceId: 'indoor-sale-dummy-1',
          returnItems: [
            {
              itemId: 'IN_ITEM_001',
              genericName: 'Paracetamol',
              tradeName: 'Calpol',
              batchNo: 'INB001',
              expDate: '2026-01',
              originalSaleQty: 20,
              originalSaleRate: 5.00,
              returnQty: 2,
              returnAmount: 10.00,
            },
          ],
          totalReturnAmount: 10.00,
          returnedBy: 'User A', // Example field
          savedAt: '2025-07-14T10:00:00.000Z',
        },
        {
            id: 'SR002-20250713',
            returnDate: '2025-07-13',
            type: 'Counter', // Renamed from 'Outdoor'
            patientName: 'Counter Customer One', // Updated name
            originalSaleInvoiceId: 'counter-sale-dummy-1', // Updated ID
            returnItems: [
              {
                itemId: 'OUT_ITEM_001',
                genericName: 'Antacid',
                tradeName: 'Gelusil',
                batchNo: 'OUTB001',
                expDate: '2025-12',
                originalSaleQty: 2,
                originalSaleRate: 30.00,
                returnQty: 1,
                returnAmount: 30.00,
              },
            ],
            totalReturnAmount: 30.00,
            returnedBy: 'User B', // Example field
            savedAt: '2025-07-13T15:30:00.000Z',
          },
      ],

      // State for Advance Receipts
      allAdvanceReceipts: [],

      // State for all bills (dummy data for now, ideally fetched from purchase data)
      allBills: [
        {
          id: 'bill-B001-PharmaDistA',
          vendorName: 'Pharma Dist. A',
          billNo: 'B001',
          billDate: '2025-06-15',
          totalAmount: 100 * 10.50 * (1 - 0.05) * (1 - 0.02) + 50 * 50.00 * (1 - 0.05), // Example calculation
          amountPaid: 0,
          dueDate: '2025-07-15',
          status: 'Due', // 'Due', 'Partially Paid', 'Paid'
          items: [ // Simplified item details for reference
            { itemCode: 'MED001', nameOfGeneric: 'Generic A', quantity: 100, rate: 10.50 },
            { itemCode: 'MED002', nameOfGeneric: 'Generic B', quantity: 50, rate: 50.00 },
          ]
        },
        {
          id: 'bill-MS005-MediSuppliesCo',
          vendorName: 'Medi Supplies Co.',
          billNo: 'MS005',
          billDate: '2025-07-01',
          totalAmount: 20 * 120.00 * (1 - 0.10),
          amountPaid: 0,
          dueDate: '2025-08-01',
          status: 'Due',
          items: [
            { itemCode: 'MED003', nameOfGeneric: 'Generic C', quantity: 20, rate: 120.00 },
          ]
        },
      ],

      // State to store all bulk payments made
      allBulkPayments: [],

      // New: State for GRC Invoices (dummy data)
      allGRCInvoices: [
        {
          id: 'GRC000000031_24-25',
          vendorName: 'LAKSHMI ENTERPRISE',
          invoiceNo: 'GRC000000031_24-25 (05-FEB-2025)',
          invoiceDate: '2025-02-05',
          netAmount: 2595.00,
          previouslyPaidAdjusted: 0,
          dueAmount: 2595.00,
          returnAdjustment: 0,
          status: 'Due', // 'Due', 'Partially Paid', 'Paid'
        },
        {
          id: 'GRC000000032_24-25',
          vendorName: 'LAKSHMI ENTERPRISE',
          invoiceNo: 'GRC000000032_24-25 (10-MAR-2025)',
          invoiceDate: '2025-03-10',
          netAmount: 1500.00,
          previouslyPaidAdjusted: 0,
          dueAmount: 1500.00,
          returnAdjustment: 0,
          status: 'Due',
        },
        {
          id: 'GRC000000033_24-25',
          vendorName: 'Pharma Dist. A',
          invoiceNo: 'GRC000000033_24-25 (20-APR-2025)',
          invoiceDate: '2025-04-20',
          netAmount: 500.00,
          previouslyPaidAdjusted: 0,
          dueAmount: 500.00,
          returnAdjustment: 0,
          status: 'Due',
        },
      ],

      // State for Indoor Sales - CORRECTED DUMMY DATA STRUCTURE
      indoorSales: [
        {
          id: 'indoor-sale-dummy-1',
          saleDate: '2025-07-10',
          patientName: 'Dummy Patient One',
          patientId: 'IPD001',
          category: 'General',
          mobileNo: '9876543210',
          sex: 'Male',
          age: 45,
          address: '123 Hospital Road, Indore',
          state: 'Madhya Pradesh',
          doctorName: 'Dr. Sharma',
          consultantRegNo: 'CRN123',
          bedDetails: 'Ward A, Bed 101',
          items: [ // This is the crucial 'items' array for filtering
            {
              itemId: 'IN_ITEM_001', genericName: 'Paracetamol', tradeName: 'Calpol', batchNo: 'INB001', expDate: '2026-01',
              saleQty: 20, saleRate: 5.00, mrp: 6.00, discPercent: 0, overallDiscPercent: 0, unit: 'Pcs',
            },
            {
              itemId: 'IN_ITEM_002', genericName: 'Amoxicillin', tradeName: 'Moxclav', batchNo: 'INB002', expDate: '2026-03',
              saleQty: 10, saleRate: 15.00, mrp: 18.00, discPercent: 5, overallDiscPercent: 0, unit: 'Strips',
            },
          ],
          totalQty: 30,
          netAmount: 250.00,
          savedAt: '2025-07-10T10:00:00.000Z',
        },
        {
          id: 'indoor-sale-dummy-2',
          saleDate: '2025-07-11',
          patientName: 'Dummy Patient Two',
          patientId: 'IPD002',
          category: 'Private',
          mobileNo: '9988776655',
          sex: 'Female',
          age: 30,
          address: '456 Clinic Lane, Indore',
          state: 'Madhya Pradesh',
          doctorName: 'Dr. Gupta',
          consultantRegNo: 'CRN456',
          bedDetails: 'Private Room 5',
          items: [
            {
              itemId: 'IN_ITEM_003', genericName: 'Cough Syrup', tradeName: 'Cofid', batchNo: 'INB003', expDate: '2027-06',
              saleQty: 1, saleRate: 80.00, mrp: 90.00, discPercent: 0, overallDiscPercent: 0, unit: 'Bottle',
            },
            {
              itemId: 'IN_ITEM_004', genericName: 'Bandage Roll', tradeName: 'First Aid Band', batchNo: 'INB004', expDate: '2028-01',
              saleQty: 5, saleRate: 5.00, mrp: 6.00, discPercent: 0, overallDiscPercent: 0, unit: 'Roll',
            },
          ],
          totalQty: 6,
          netAmount: 105.00,
          savedAt: '2025-07-11T14:30:00.000Z',
        },
      ],
      indoorSalesCount: 2,

      // State for Counter Sales (previously Outdoor Sales)
      counterSales: [ // Renamed from outdoorSales
        {
          id: 'counter-sale-dummy-1', // Updated ID
          saleDate: '2025-07-09',
          patientName: 'Counter Customer One', // Updated name
          mobileNo: '7778889990',
          sex: 'Female',
          age: 28,
          address: '789 Market Street, Indore',
          state: 'Madhya Pradesh',
          items: [ // This is the crucial 'items' array for filtering
            {
              itemId: 'OUT_ITEM_001', genericName: 'Antacid', tradeName: 'Gelusil', batchNo: 'OUTB001', expDate: '2025-12',
              saleQty: 2, saleRate: 30.00, mrp: 35.00, discPercent: 0, overallDiscPercent: 0, unit: 'Strips',
            },
            {
              itemId: 'OUT_ITEM_002', genericName: 'Pain Relief Spray', tradeName: 'Volini', batchNo: 'OUTB002', expDate: '2026-05',
              saleQty: 1, saleRate: 120.00, mrp: 130.00, discPercent: 10, overallDiscPercent: 0, unit: 'Bottle',
            },
          ],
          totalQty: 3,
          netAmount: 180.00,
          savedAt: '2025-07-09T11:00:00.000Z',
        },
        {
          id: 'counter-sale-dummy-2', // Updated ID
          saleDate: '2025-07-12',
          patientName: 'Counter Customer Two', // Updated name
          mobileNo: '6665554443',
          sex: 'Male',
          age: 55,
          address: '101 Park Avenue, Indore',
          state: 'Madhya Pradesh',
          items: [
            {
              itemId: 'OUT_ITEM_003', genericName: 'Multivitamin', tradeName: 'Becosules', batchNo: 'OUTB003', expDate: '2027-02',
              saleQty: 1, saleRate: 150.00, mrp: 160.00, discPercent: 0, overallDiscPercent: 5, unit: 'Bottle',
            },
          ],
          totalQty: 1,
          netAmount: 150.00,
          savedAt: '2025-07-12T09:15:00.000Z',
        },
      ],
      counterSalesCount: 2, // Renamed from outdoorSalesCount

      // New: State to store all GRC Wise Payments
      allGRCPayments: [],

      // Actions to manage currentSessionReturnItems (Purchase Returns)
      addReturnItem: (item) => set((state) => ({
        currentSessionReturnItems: [...state.currentSessionReturnItems, { ...item, id: Date.now() }]
      })),
      deleteCurrentSessionReturnItem: (itemId) => set((state) => ({
        currentSessionReturnItems: state.currentSessionReturnItems.filter((item) => item.id !== itemId)
      })),
      clearCurrentSessionReturnItems: () => set({ currentSessionReturnItems: [] }),

      // Action to set item data for detail page view
      setItemData: (item) => set({ itemData: item }),

      // Action to add a complete return document (Purchase Return)
      addReturnDocument: (document) => set((state) => ({
        allReturnDocuments: [...state.allReturnDocuments, document]
      })),

      // Action to add a new purchase to allPurchases
      addPurchase: (newPurchase) => {
        set((state) => ({
          allPurchases: [...state.allPurchases, newPurchase],
        }));
      },

      // Action to add an Advance Receipt
      addAdvanceReceipt: (receipt) => set((state) => ({
        allAdvanceReceipts: [...state.allAdvanceReceipts, { ...receipt, id: Date.now() }]
      })),

      // Action to add a bulk payment
      addBulkPayment: (payment) => set((state) => ({
        allBulkPayments: [...state.allBulkPayments, { ...payment, id: Date.now() }]
      })),

      // Action to add an Indoor Sale
      addIndoorSale: (indoorSaleData) =>
        set((state) => {
          const newIndoorSale = { ...indoorSaleData, id: `indoor-sale-${Date.now()}` }; // Unique ID for indoor sale
          return {
            indoorSales: [...state.indoorSales, newIndoorSale],
            indoorSalesCount: state.indoorSalesCount + 1,
          };
        }),

      // Action to add a Counter Sale (previously addOutdoorSale)
      addCounterSale: (counterSaleData) => // Renamed from addOutdoorSale
        set((state) => {
          const newCounterSale = { ...counterSaleData, id: `counter-sale-${Date.now()}` }; // Updated ID prefix
          return {
            counterSales: [...state.counterSales, newCounterSale], // Updated state name
            counterSalesCount: state.counterSalesCount + 1, // Updated counter name
          };
        }),

      // Action to update bill status (e.g., after payment)
      updateBillStatus: (billId, newStatus, paidAmount) => set((state) => ({
        allBills: state.allBills.map(bill =>
          bill.id === billId
            ? {
              ...bill,
              status: newStatus,
              amountPaid: (bill.amountPaid || 0) + paidAmount
            }
            : bill
        )
      })),

      // New: Action to add a GRC Wise Payment
      addGRCPayment: (payment) => set((state) => ({
        allGRCPayments: [...state.allGRCPayments, { ...payment, id: Date.now() }]
      })),

      // New: Action to update GRC Invoice status
      updateGRCInvoiceStatus: (grcId, newStatus, paidAmount) => set((state) => ({
        allGRCInvoices: state.allGRCInvoices.map(grc =>
          grc.id === grcId
            ? {
              ...grc,
              status: newStatus,
              previouslyPaidAdjusted: (grc.previouslyPaidAdjusted || 0) + paidAmount,
              dueAmount: grc.netAmount - ((grc.previouslyPaidAdjusted || 0) + paidAmount)
            }
            : grc
        )
      })),

      // ====================================================================
      // SALE RETURN LOGIC (Already added and kept)
      // ====================================================================

      /**
       * Action to process a sale return and update inventory.
       * @param {Object} returnData - Details of the sale return.
       * @param {string} returnData.saleId - The ID of the original sale (Indoor or Counter).
       * @param {Object[]} returnData.returnedItems - Array of items being returned.
       * @param {string} returnData.returnedItems[].itemCode - Item code of the returned product.
       * @param {string} returnData.returnedItems[].batchNo - Batch number of the returned product.
       * @param {number} returnData.returnedItems[].returnQty - Quantity returned.
       * @param {string} returnData.returnedItems[].unit - Unit of the returned quantity (e.g., 'Pcs', 'Strips', 'Bottle').
       * @param {string} returnData.returnReason - Reason for the return.
       * @param {number} returnData.refundAmount - Amount refunded to the customer.
       * @param {string} [returnData.returnDate] - Date of return (defaults to current date).
       * @param {string} [returnData.customerName] - Name of the customer returning the item.
       * @param {string} [returnData.mobileNo] - Customer's mobile number.
       */
      processSaleReturn: (returnData) => {
        set((state) => {
          const { saleId, returnedItems, returnReason, refundAmount, customerName, mobileNo } = returnData;
          const returnDate = returnData.returnDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          // 1. Update allPurchases (restock items)
          const updatedAllPurchases = state.allPurchases.map(purchase => {
            return {
              ...purchase,
              receivedItems: purchase.receivedItems.map(item => {
                const returnedItemMatch = returnedItems.find(
                  rItem => rItem.itemCode === item.itemCode && rItem.batchNo === item.batchNo
                );

                if (returnedItemMatch) {
                  const currentReceivedQty = item.receiveQty || 0;
                  const quantityToAdd = returnedItemMatch.returnQty;

                  console.log(`Restocking ${quantityToAdd} of ${item.itemCode} (Batch: ${item.batchNo}). Old Qty: ${currentReceivedQty}`);
                  return {
                    ...item,
                    receiveQty: currentReceivedQty + quantityToAdd,
                    currentStock: (item.currentStock || 0) + (quantityToAdd * (item.cfQty || 1)), // Update currentStock in loose units
                  };
                }
                return item;
              }),
            };
          });

          // 2. Record the sale return document
          const newSaleReturnDocument = {
            id: crypto.randomUUID(),
            saleId: saleId,
            returnDate: returnDate,
            customerName: customerName,
            mobileNo: mobileNo,
            returnedItems: returnedItems, // Store the specific items returned
            returnReason: returnReason,
            refundAmount: refundAmount,
            processedAt: new Date().toISOString(),
          };

          return {
            allPurchases: updatedAllPurchases,
            allSaleReturns: [...state.allSaleReturns, newSaleReturnDocument],
          };
        });
      },

      // ====================================================================
      // NEW: allItems Getter (Flattens all received items for easy access)
      // ====================================================================
      get allItems() {
        const state = get(); // Get current state
        let flattenedItems = [];
        state.allPurchases.forEach(purchase => {
          flattenedItems = [...flattenedItems, ...purchase.receivedItems];
        });
        // You might want to add logic here to ensure uniqueness if items can appear in multiple purchases
        // For now, it just flattens.
        return flattenedItems;
      },

      // ====================================================================
      // NEW: updateItemStock Action (Updates currentStock for a specific item)
      // ====================================================================
      /**
       * Updates the currentStock of a specific item within allPurchases.
       * This action should be called when items are sold or returned.
       * @param {string} itemId - The unique 'id' of the item (e.g., 'item1-pur1').
       * @param {number} quantityChange - The amount to subtract (for sale) or add (for return) from stock.
       * This quantity should be in the 'loose unit' (saleUnit) as currentStock is in loose units.
       */
      updateItemStock: (itemId, quantityChange) => {
        set((state) => {
          const updatedAllPurchases = state.allPurchases.map(purchase => {
            return {
              ...purchase,
              receivedItems: purchase.receivedItems.map(item => {
                if (item.id === itemId) {
                  const newStock = (item.currentStock || 0) - quantityChange;
                  console.log(`Updating stock for ${item.tradeName} (ID: ${itemId}). Old Stock: ${item.currentStock}, Change: ${quantityChange}, New Stock: ${newStock}`);
                  return {
                    ...item,
                    currentStock: newStock,
                  };
                }
                return item;
              }),
            };
          });
          return { allPurchases: updatedAllPurchases };
        });
      },

      // ====================================================================
      // NEW ACTIONS FOR VIEW PURCHASE DETAILS PAGE
      // ====================================================================

      /**
       * Deletes a specific item from a specific purchase record.
       * @param {number|string} purchaseId - The ID of the purchase record.
       * @param {string} itemIdToDelete - The unique ID of the item within that purchase's receivedItems.
       */
      deletePurchaseItem: (purchaseId, itemIdToDelete) => {
        set((state) => ({
          allPurchases: state.allPurchases.map(purchase => {
            if (String(purchase.id) === String(purchaseId)) { // Ensure ID types match for comparison
              const updatedReceivedItems = purchase.receivedItems.filter(
                item => String(item.id) !== String(itemIdToDelete) // Ensure ID types match for comparison
              );
              return { ...purchase, receivedItems: updatedReceivedItems };
            }
            return purchase;
          }).filter(purchase => purchase.receivedItems.length > 0), // Remove purchase if no items left
        }));
      },

      /**
       * Clears all purchase records from the store.
       */
      clearAllPurchases: () => {
        set({ allPurchases: [] });
      },

      // ====================================================================
      // NEW: getCurrentStock Getter (Calculates current stock based on sales/returns)
      // NOTE: This getter is now less critical as `currentStock` is directly updated.
      // It can be used for verification or if a more complex real-time calculation is needed.
      // ====================================================================
      getCurrentStock: (itemCode, batchNo = null) => {
        const state = get();
        let totalStock = 0;

        // Sum up currentStock from allPurchases (which is now updated by updateItemStock)
        state.allPurchases.forEach(purchase => {
          purchase.receivedItems.forEach(item => {
            if (item.itemCode === itemCode) {
              if (batchNo) {
                if (item.batchNo === batchNo) {
                  totalStock += item.currentStock || 0;
                }
              } else {
                // If no batch specified, sum all batches for that itemCode
                totalStock += item.currentStock || 0;
              }
            }
          });
        });
        return totalStock;
      },
      
    }),
    
    {
      name: 'purchase-store', // Unique name for local storage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);

export default usePurchaseStore;
