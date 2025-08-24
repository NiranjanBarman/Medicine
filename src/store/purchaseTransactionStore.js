// src/store/purchaseTransactionStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to safely parse float values
const safeParseFloat = (value) => parseFloat(value || 0) || 0;

const usePurchaseTransactionStore = create(
  persist(
    (set, get) => ({
      purchaseTransactions: [], // Original state for purchase records, now holds detailed stock
      bulkUploads: [],         // State for bulk uploads
      inventoryItems: [],      // Array of unique items with their current aggregated stock

      // Helper to rebuild inventoryItems from current purchaseTransactions
      rebuildInventoryItems: () => {
        console.log("Rebuilding inventory...");
        const aggregatedInventory = {};

        get().purchaseTransactions.forEach(transaction => {
          if (transaction.items && Array.isArray(transaction.items)) { // Added check
            transaction.items.forEach(item => {
              // Ensure batchSrlNo and expDate are always strings before using toLowerCase or trimming
              const itemBatchSrlNo = String(item.batchSrlNo || '').trim();
              const itemExpDate = String(item.expDate || '').trim();
              const itemNameMedicine = String(item.nameOfItemMedicine || '').trim();

              // Using lowercased and trimmed strings for unique identification
              const uniqueItemId = `${itemNameMedicine.toLowerCase()}-${itemBatchSrlNo.toLowerCase()}-${itemExpDate}`;

              if (!aggregatedInventory[uniqueItemId]) {
                aggregatedInventory[uniqueItemId] = {
                  id: item.id || crypto.randomUUID(), // Use a stable ID if available, or generate
                  nameOfItemMedicine: item.nameOfItemMedicine,
                  itemManufacturerMake: item.itemManufacturerMake,
                  batchSrlNo: itemBatchSrlNo, // Store as string
                  expDate: itemExpDate,     // Store as string
                  saleUnit: item.saleUnit || 'Unit',
                  hsnSac: item.hsnSac || '',
                  cfQty: item.cfQty || 1,
                  cfUnit: item.cfUnit || '',
                  gstIgst: item.gstIgst || (item.gstCgst && item.gstSgst ? item.gstCgst + item.gstSgst : 0),
                  mrp: item.mrp || 0,
                  purchaseRateStrip: item.purchaseRateStrip || 0,
                  purrDisc: item.purrDisc || 0,
                  purrFreeQty: item.purrFreeQty || 0,
                  saleRateStrip: item.saleRateStrip || 0,
                  looseRate: item.looseRate || item.saleRateStrip || 0,
                  packaging: item.packaging || '',
                  barcode: item.barcode || '',
                  formulation: item.formulation || '',
                  drugSchedule: item.drugSchedule || '',
                  purchaseRate: item.purchaseRate || 0,
                  currentStock: 0, // Will be summed up
                  totalFreeQty: 0, // Aggregated free quantity
                };
              }
              // Sum up remaining quantities from various purchase entries for the same item
              const remainingItemQty = safeParseFloat(item.purchaseQuantity || 0) + safeParseFloat(item.freeQty || 0);
              aggregatedInventory[uniqueItemId].currentStock += remainingItemQty;
              aggregatedInventory[uniqueItemId].totalFreeQty += safeParseFloat(item.freeQty || 0);

              // Update other details that might vary but should be consistent
              aggregatedInventory[uniqueItemId].mrp = item.mrp || aggregatedInventory[uniqueItemId].mrp;
              aggregatedInventory[uniqueItemId].saleRateStrip = item.saleRateStrip || aggregatedInventory[uniqueItemId].saleRateStrip;
              aggregatedInventory[uniqueItemId].looseRate = item.looseRate || aggregatedInventory[uniqueItemId].looseRate;
              aggregatedInventory[uniqueItemId].gstIgst = item.gstIgst || aggregatedInventory[uniqueItemId].gstIgst;
              aggregatedInventory[uniqueItemId].hsnSac = item.hsnSac || aggregatedInventory[uniqueItemId].hsnSac;
              aggregatedInventory[uniqueItemId].packaging = item.packaging || aggregatedInventory[uniqueItemId].packaging;
              aggregatedInventory[uniqueItemId].barcode = item.barcode || aggregatedInventory[uniqueItemId].barcode;
              aggregatedInventory[uniqueItemId].formulation = item.formulation || aggregatedInventory[uniqueItemId].formulation;
              aggregatedInventory[uniqueItemId].drugSchedule = item.drugSchedule || aggregatedInventory[uniqueItemId].drugSchedule;
              aggregatedInventory[uniqueItemId].cfQty = item.cfQty || aggregatedInventory[uniqueItemId].cfQty;
              aggregatedInventory[uniqueItemId].cfUnit = item.cfUnit || aggregatedInventory[uniqueItemId].cfUnit;
              aggregatedInventory[uniqueItemId].purchaseRate = item.purchaseRate || aggregatedInventory[uniqueItemId].purchaseRate;
            });
          }
        });
        set({ inventoryItems: Object.values(aggregatedInventory) });
        console.log("Inventory rebuilt successfully. Current Aggregated Stock:", get().inventoryItems);
      },

      // Helper to deduct stock from specific purchase entries (FIFO logic)
      deductStockFromPurchases: (itemToDeduct, qtyToDeduct) => {
        let remainingToDeduct = qtyToDeduct;
        console.log(`DEDUCTION: Attempting to deduct ${qtyToDeduct} of ${itemToDeduct.nameOfItemMedicine} (Batch: ${itemToDeduct.batchSrlNo}, Exp: ${itemToDeduct.expDate})...`);

        const updatedPurchaseTransactions = get().purchaseTransactions.map(transaction => {
          if (transaction.items && Array.isArray(transaction.items)) { // Added check
            const updatedItems = transaction.items.map(item => {
              // Ensure values are strings for consistent comparison
              const currentItemName = String(item.nameOfItemMedicine || '').toLowerCase().trim();
              const currentItemBatch = String(item.batchSrlNo || '').toLowerCase().trim();
              const currentItemExp = String(item.expDate || '').trim();

              const deductItemName = String(itemToDeduct.nameOfItemMedicine || '').toLowerCase().trim();
              const deductItemBatch = String(itemToDeduct.batchSrlNo || '').toLowerCase().trim();
              const deductItemExp = String(itemToDeduct.expDate || '').trim();

              // Match by name, batch, and expiry to find the specific stock to deduct from
              if (
                remainingToDeduct > 0 &&
                currentItemName === deductItemName &&
                currentItemBatch === deductItemBatch &&
                currentItemExp === deductItemExp
              ) {
                const currentPurchaseQty = safeParseFloat(item.purchaseQuantity || 0);
                const currentFreeQty = safeParseFloat(item.freeQty || 0);
                const currentAvailableQty = currentPurchaseQty + currentFreeQty;

                if (currentAvailableQty >= remainingToDeduct) {
                  // Deduct from purchaseQuantity first, then freeQty if needed
                  const deductedFromPurchase = Math.min(currentPurchaseQty, remainingToDeduct);
                  const newPurchaseQty = currentPurchaseQty - deductedFromPurchase;
                  remainingToDeduct -= deductedFromPurchase;

                  let newFreeQty = currentFreeQty;
                  if (remainingToDeduct > 0) {
                    const deductedFromFree = Math.min(currentFreeQty, remainingToDeduct);
                    newFreeQty = currentFreeQty - deductedFromFree;
                    remainingToDeduct -= deductedFromFree;
                  }
                  console.log(`Deducted ${qtyToDeduct - remainingToDeduct} from ${item.nameOfItemMedicine} (Batch: ${item.batchSrlNo}, Exp: ${item.expDate}). New Purchase Qty: ${newPurchaseQty}, New Free Qty: ${newFreeQty}`);

                  // *** CRUCIAL CHANGE: Return a NEW item object ***
                  return {
                    ...item, // Spread existing properties
                    purchaseQuantity: newPurchaseQty,
                    freeQty: newFreeQty,
                  };
                } else {
                  // Deduct all available from this entry and continue to next
                  remainingToDeduct -= currentAvailableQty;
                  console.log(`Deducted all ${currentAvailableQty} from ${item.nameOfItemMedicine} (Batch: ${item.batchSrlNo}, Exp: ${item.expDate}). Remaining to deduct: ${remainingToDeduct}`);
                  // *** CRUCIAL CHANGE: Return a NEW item object with zeroed quantities ***
                  return {
                    ...item, // Spread existing properties
                    purchaseQuantity: 0,
                    freeQty: 0,
                  };
                }
              }
              return item; // Return original item if no deduction needed
            });
            // Filter out items that have no stock left within this transaction before returning the transaction
            const filteredItems = updatedItems.filter(item => (safeParseFloat(item.purchaseQuantity || 0) + safeParseFloat(item.freeQty || 0)) > 0);
            return { ...transaction, items: filteredItems };
          }
          return transaction; // Return original transaction if no items or not an array
        }).filter(transaction => transaction.items && transaction.items.length > 0); // Remove transactions with no items left

        set({ purchaseTransactions: updatedPurchaseTransactions });
        console.log("DEDUCTION COMPLETE. New purchaseTransactions state:", get().purchaseTransactions);

        // --- NEW LOG: Check aggregated quantity for the item after deduction ---
        const updatedInventory = get().inventoryItems; // This will get the *old* inventoryItems before rebuildInventoryItems
        const foundItemInInventory = updatedInventory.find(invItem =>
            String(invItem.nameOfItemMedicine).toLowerCase().trim() === String(itemToDeduct.nameOfItemMedicine || '').toLowerCase().trim() &&
            String(invItem.batchSrlNo || '').toLowerCase().trim() === String(itemToDeduct.batchSrlNo || '').toLowerCase().trim() &&
            String(invItem.expDate || '').trim() === String(itemToDeduct.expDate || '').trim()
        );
        if (foundItemInInventory) {
            console.log(`POST-SALE DEDUCTION CHECK: Remaining aggregated stock for ${foundItemInInventory.nameOfItemMedicine} (Batch: ${foundItemInInventory.batchSrlNo}, Exp: ${foundItemInInventory.expDate}): ${safeParseFloat(foundItemInInventory.currentStock)}`);
        } else {
            console.log(`POST-SALE DEDUCTION CHECK: Item ${itemToDeduct.nameOfItemMedicine} not found in inventory after deduction (might be fully sold out).`);
        }
        // --- END NEW LOG ---

        if (remainingToDeduct > 0) {
          console.warn(`DEDUCTION WARNING: Attempted to deduct ${qtyToDeduct} but only ${qtyToDeduct - remainingToDeduct} was available for ${itemToDeduct.nameOfItemMedicine} (Batch: ${itemToDeduct.batchSrlNo}, Exp: ${itemToDeduct.expDate}). ${remainingToDeduct} quantity still needed.`);
        }
      },

      // Helper to add stock back to specific purchase entries (e.g., on sale removal)
      addStockToPurchases: (itemToAdd, qtyToAdd) => {
        let addedToExisting = false;
        console.log(`ADDITION: Attempting to add back ${qtyToAdd} of ${itemToAdd.nameOfItemMedicine} (Batch: ${itemToAdd.batchSrlNo}, Exp: ${itemToAdd.expDate})...`);

        const updatedPurchaseTransactions = get().purchaseTransactions.map(transaction => {
          if (transaction.items && Array.isArray(transaction.items)) { // Added check
            const updatedItems = transaction.items.map(item => {
              // Ensure values are strings for consistent comparison
              const currentItemName = String(item.nameOfItemMedicine || '').toLowerCase().trim();
              const currentItemBatch = String(item.batchSrlNo || '').toLowerCase().trim();
              const currentItemExp = String(item.expDate || '').trim();

              const addItemName = String(itemToAdd.nameOfItemMedicine || '').toLowerCase().trim();
              const addItemBatch = String(itemToAdd.batchSrlNo || '').toLowerCase().trim();
              const addItemExp = String(itemToAdd.expDate || '').trim();

              // Find the exact purchase entry to add stock back to
              if (
                currentItemName === addItemName &&
                currentItemBatch === addItemBatch &&
                currentItemExp === addItemExp
              ) {
                const newPurchaseQuantity = safeParseFloat(item.purchaseQuantity || 0) + qtyToAdd; // Add back to purchase quantity
                console.log(`Added back ${qtyToAdd} to ${item.nameOfItemMedicine} (Batch: ${item.batchSrlNo}, Exp: ${item.expDate}). New stock: ${newPurchaseQuantity}`);
                addedToExisting = true;
                // *** CRUCIAL CHANGE: Return a NEW item object ***
                return {
                  ...item, // Spread existing properties
                  purchaseQuantity: newPurchaseQuantity,
                };
              }
              return item; // Return original item if no addition needed
            });
            return { ...transaction, items: updatedItems };
          }
          return transaction; // Return original transaction if no items or not an array
        });

        // If no existing purchase entry was found for the exact item, create a new "dummy" purchase
        if (!addedToExisting) {
            console.warn(`ADDITION WARNING: Could not find original purchase for ${itemToAdd.nameOfItemMedicine} (Batch: ${itemToAdd.batchSrlNo}, Exp: ${itemToAdd.expDate}). Creating a new temporary purchase entry.`);
            const tempTransactionId = `revert-${Date.now()}`;
            const newItemEntry = {
                id: crypto.randomUUID(), // Use a new ID
                nameOfItemMedicine: itemToAdd.nameOfItemMedicine,
                batchSrlNo: String(itemToAdd.batchSrlNo || '').trim(), // Ensure string
                expDate: String(itemToAdd.expDate || '').trim(),     // Ensure string
                purchaseQuantity: qtyToAdd,
                freeQty: 0, // Assuming reverted stock goes to purchase quantity
                totalPurchaseQty: qtyToAdd,
                ...itemToAdd, // Spread itemToAdd first (its 'id' will be overwritten by the explicit id above)
            };
            set(state => ({
                purchaseTransactions: [...state.purchaseTransactions, {
                    id: tempTransactionId,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    vendorName: 'Reverted Sale',
                    billNo: `REVERT-${tempTransactionId}`,
                    paymentMode: 'N/A',
                    totalAmount: 0,
                    totalQuantity: qtyToAdd,
                    items: [newItemEntry],
                    createdAt: new Date().toISOString(),
                }]
            }));
            console.log("ADDITION COMPLETE. New purchaseTransactions state (with temp entry):", get().purchaseTransactions);
        } else {
            set({ purchaseTransactions: updatedPurchaseTransactions });
            console.log("ADDITION COMPLETE. New purchaseTransactions state:", get().purchaseTransactions);
        }
      },

      // Main function to update stock in purchase records based on type (decrease/add)
      updateItemStockInPurchase: (itemDetails, qtyToChange, type) => {
        console.log(`UPDATE STOCK: Called for ${itemDetails.nameOfItemMedicine}, Qty: ${qtyToChange}, Type: ${type}`);
        if (type === 'decrease') {
            get().deductStockFromPurchases(itemDetails, qtyToChange);
        } else if (type === 'add') {
            get().addStockToPurchases(itemDetails, qtyToChange);
        } else {
            console.warn('updateItemStockInPurchase only supports "decrease" or "add" type for stock changes.');
        }
        // Always rebuild inventoryItems after any stock operation
        get().rebuildInventoryItems();
      },

      addPurchaseTransaction: (transaction) => {
        set((state) => ({
          purchaseTransactions: [...state.purchaseTransactions, transaction],
        }));
        console.log("New purchase transaction added:", transaction);
        get().rebuildInventoryItems(); // Rebuild inventory after adding new purchase
      },

      addBulkPurchaseTransactions: (transactions) => {
        try {
          if (!Array.isArray(transactions)) {
            console.error('Bulk upload requires an array of transactions');
            return { success: false, error: 'Invalid data format' };
          }

          const bulkId = `bulk-${Date.now()}`;
          const timestamp = new Date().toISOString();

          set((state) => {
            const newTransactions = transactions.filter(
              t => !state.purchaseTransactions.some(existing => existing.id === t.id)
            );

            const processedTransactions = newTransactions.map(t => ({
              ...t,
              transactionType: 'bulk',
              bulkUploadId: bulkId,
              createdAt: timestamp,
              updatedAt: timestamp
            }));

            return {
              purchaseTransactions: [...state.purchaseTransactions, ...processedTransactions],
              bulkUploads: [
                ...state.bulkUploads,
                {
                  id: bulkId,
                  timestamp,
                  transactionCount: newTransactions.length,
                  itemCount: newTransactions.reduce((sum, t) => sum + t.items.length, 0)
                }
              ]
            };
          });
          console.log("Bulk purchase transactions added. Rebuilding inventory...");
          get().rebuildInventoryItems(); // Rebuild inventory after bulk purchase
          return { success: true, addedCount: transactions.length, bulkId };
        } catch (error) {
          console.error('Bulk upload error:', error); // Log the actual error
          return { success: false, error: error.message };
        }
      },

      updatePurchaseTransaction: (updatedTransaction) => {
        set((state) => ({
          purchaseTransactions: state.purchaseTransactions.map((t) =>
            t.id === updatedTransaction.id ? updatedTransaction : t
          ),
        }));
        console.log("Purchase transaction updated:", updatedTransaction);
        get().rebuildInventoryItems(); // Rebuild inventory after update
      },

      deletePurchaseTransaction: (id) => {
        set((state) => {
          const transactionToDelete = state.purchaseTransactions.find(t => t.id === id);
          if (transactionToDelete) {
            console.log("Deleting purchase transaction. Reverting stock...");
          }
          return {
            purchaseTransactions: state.purchaseTransactions.filter((t) => t.id !== id),
          };
        });
        get().rebuildInventoryItems(); // Rebuild inventory after deletion
      },

      getBulkUploads: () => {
        return get().bulkUploads.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
      },

      deleteBulkUpload: (bulkId) => {
        set((state) => {
          const transactionsToDelete = state.purchaseTransactions.filter(t => t.bulkUploadId === bulkId);
          if (transactionsToDelete.length > 0) {
              console.log("Deleting bulk upload. Reverting associated stock...");
              transactionsToDelete.forEach(transaction => {
                  transaction.items.forEach(item => {
                      get().addStockToPurchases({
                          nameOfItemMedicine: item.nameOfItemMedicine,
                          batchSrlNo: item.batchSrlNo,
                          expDate: item.expDate,
                      }, safeParseFloat(item.purchaseQuantity || 0) + safeParseFloat(item.freeQty || 0));
                  });
              });
          }
          return {
            purchaseTransactions: state.purchaseTransactions.filter(
              t => t.bulkUploadId !== bulkId
            ),
            bulkUploads: state.bulkUploads.filter(
              b => b.id !== bulkId
            )
          };
        });
        get().rebuildInventoryItems(); // Rebuild inventory after bulk deletion
      },

      // Clear all state, including inventoryItems
      clearAllPurchaseTransactions: () => set({ purchaseTransactions: [], bulkUploads: [], inventoryItems: [] }, true),
    }),
    {
      name: 'purchase-transactions-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => {
        console.log('Zustand Persist: Hydration starts');
        return (state, error) => {
          if (error) {
            console.error('Zustand Persist: An error happened during hydration:', error);
          } else {
            console.log('Zustand Persist: Hydration finished. Attempting to rebuild inventory...');
            if (state) {
                state.rebuildInventoryItems();
            }
          }
        };
      },
    }
  )
);

export default usePurchaseTransactionStore;

