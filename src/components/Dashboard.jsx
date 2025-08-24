// src/components/Dashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import useCounterSaleStore from "../store/useCounterSaleStore";
import useIndoorSaleStore from "../store/useIndoorSaleStore";
import usePurchaseTransactionStore from "../store/purchaseTransactionStore";
import useItemMedicineStore from "../store/itemMedicineStore";
import useVendorStore from "../store/vendorStore";
// import useManufacturerStore from "../store/manufacturerStore";
// import useGenericStore from "../store/genericStore";
import useSaleReturnStore from "../store/saleReturnStore";
import useCountAnimation from "../hooks/useCountAnimation"; // Adjust path if needed
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";

const parseExpDate = (rawDate) => {
  if (!rawDate) return null;

  const parsed = new Date(rawDate);
  if (!isNaN(parsed)) return parsed;

  // Handle MM/YYYY or M/YYYY format
  const parts = rawDate.split("/");
  if (parts.length === 2) {
    const [mm, yyyy] = parts;
    const month = parseInt(mm) - 1;
    const year = parseInt(yyyy);
    if (!isNaN(month) && !isNaN(year)) {
      return new Date(year, month + 1, 0); // Last day of the month
    }
  }

  return null;
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getDateString = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  // Use local date instead of ISO (which is in UTC)
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Ensure start of day
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Ensure end of day

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
};

// --- Dashboard Component ---
function Dashboard() {
  const purchaseTransactions = usePurchaseTransactionStore(
    (state) => state.purchaseTransactions
  );
  const allInventoryItems = usePurchaseTransactionStore(
    (state) => state.inventoryItems
  );

  // --- State for Filters ---
  const [dateRange, setDateRange] = useState("last7"); // Default to last 7 days
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showLowStockItems, setShowLowStockItems] = useState(false);
  const [showExpiredAndExpiringItems, setShowExpiredAndExpiringItems] =
    useState(false); // Combined toggle
  //    const [selectedManufacturerId, setSelectedManufacturerId] = useState(''); // For Manufacturer-wise Sales
  const inventoryItems = usePurchaseTransactionStore(
    (state) => state.inventoryItems
  );
  // --- Fetch data from Zustand Stores ---
  const allCounterSales = useCounterSaleStore((state) => state.counterSales);
  const allIndoorSales = useIndoorSaleStore((state) => state.indoorSales);

  const allPurchaseTransactions = usePurchaseTransactionStore(
    (state) => state.purchaseTransactions
  );
  const allItems = useItemMedicineStore((state) => state.items);
  const allVendors = useVendorStore((state) => state.vendors);
  // const allManufacturers = useManufacturerStore((state) => state.manufacturers);
  // const allGenerics = useGenericStore((state) => state.generics);
  const allSaleReturns = useSaleReturnStore((state) => state.saleReturns);
  const getBulkUploads = usePurchaseTransactionStore(
    (state) => state.getBulkUploads
  );
  // const items = useItemMedicineStore((state) => state.items);
  //sale return
  useEffect(() => {
    allSaleReturns.forEach((item, i) => {
      console.log(`#${i + 1}:`, {
        returnrate: item.originalSaleRate,
        returnqty: item.originalSaleQty,
      });
    });
  }, [allSaleReturns]);

  // --- Date Range Calculation for filtering data ---
  const { filterStartDate, filterEndDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    if (dateRange === "today") {
      return {
        filterStartDate: today,
        filterEndDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        ),
      };
    } else if (dateRange === "last7") {
      const start = addDays(today, -6);
      return {
        filterStartDate: start,
        filterEndDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        ),
      };
    } else if (dateRange === "last30") {
      const start = addDays(today, -29);
      return {
        filterStartDate: start,
        filterEndDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        ),
      };
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return { filterStartDate: start, filterEndDate: end };
    }
    // Default to last 7 days if no valid range selected or custom dates are invalid
    const defaultStart = addDays(today, -6);
    return {
      filterStartDate: defaultStart,
      filterEndDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      ),
    };
  }, [dateRange, customStartDate, customEndDate]);

  // --- Filtered Transaction Data (for charts and metrics within the selected date range) ---
  const filteredCounterSales = useMemo(
    () =>
      allCounterSales.filter((sale) => {
        const saleDate = getDateString(sale.saleDate); // converts both string & date
        const startDate = getDateString(filterStartDate);
        const endDate = getDateString(filterEndDate);

        return saleDate >= startDate && saleDate <= endDate;
      }),
    [allCounterSales, filterStartDate, filterEndDate]
  );

  const filteredIndoorSales = useMemo(
    () =>
      allIndoorSales.filter((sale) => {
        const saleDate = getDateString(sale.saleDate);
        const startDate = getDateString(filterStartDate);
        const endDate = getDateString(filterEndDate);

        return saleDate >= startDate && saleDate <= endDate;
      }),
    [allIndoorSales, filterStartDate, filterEndDate]
  );

  const filteredPurchaseTransactions = useMemo(() => {
    return allPurchaseTransactions.filter((purchase) => {
      // FIX: Use billDate for filtering purchase transactions, fallback to purchaseDate
      const purchaseDate = new Date(purchase.billDate || purchase.purchaseDate);
      return purchaseDate >= filterStartDate && purchaseDate <= filterEndDate;
    });
  }, [allPurchaseTransactions, filterStartDate, filterEndDate]);

  const filteredSaleReturns = useMemo(() => {
    return allSaleReturns.filter((sReturn) => {
      const returnDate = new Date(sReturn.returnDate);
      return returnDate >= filterStartDate && returnDate <= filterEndDate;
    });
  }, [allSaleReturns, filterStartDate, filterEndDate]);

  // --- BASIC STATISTICS / METRICS ---
  console.log("All Inventory Items:", allItems);

  const totalUniqueMedicines = new Set(
    allInventoryItems
      .map((item) => item.nameOfItemMedicine)
      .filter((name) => name && name.trim() !== "")
      .map((name) => name.trim().toLowerCase())
  ).size;

  const animatedTotalMedicines = useCountAnimation(totalUniqueMedicines);

  const animatedTotalVendors = useCountAnimation(allVendors.length);
  // const animatedTotalGenerics = useCountAnimation(allGenerics.length);

  const totalCounterSalesToday = useMemo(() => {
    const todayStr = getTodayDateString();
    return allCounterSales
      .filter((sale) => getDateString(sale.saleDate) === todayStr)
      .reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
  }, [allCounterSales]);
  const animatedTotalCounterSalesToday = useCountAnimation(
    totalCounterSalesToday
  );

  const totalIndoorSalesToday = useMemo(() => {
    const todayStr = getTodayDateString();
    return allIndoorSales
      .filter((sale) => getDateString(sale.saleDate) === todayStr)
      .reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);
  }, [allIndoorSales]);
  const animatedTotalIndoorSalesToday = useCountAnimation(
    totalIndoorSalesToday
  );

  const totalPurchaseValueToday = useMemo(() => {
    const todayStr = getTodayDateString();

    return purchaseTransactions
      .filter((purchaseBill) => {
        // FIX: Use billDate, with a fallback to purchaseDate, for filtering
        const effectiveDate =
          purchaseBill.billDate || purchaseBill.purchaseDate;
        return getDateString(effectiveDate) === todayStr;
      })
      .reduce((totalBillValue, purchaseBill) => {
        const billItemsTotal = purchaseBill.items.reduce((sumItems, item) => {
          const rate = parseFloat(item.purchaseRate);
          const quantity = parseFloat(item.actualBillableQty);
          // const gstRate = parseFloat(item.gstIgst); // Get the GST rate (e.g., 12, 18, 28)
          // const discountPercent = parseFloat(item.disc); // Get the discount percentage (e.g., 0.87, 4.9)

          let itemCalculatedValue = 0;

          if (!isNaN(rate) && !isNaN(quantity) && quantity > 0) {
            // Ensure rate and quantity are valid and quantity is positive
            let baseValue = rate * quantity;

            // 1. Apply GST
            // if (!isNaN(gstRate)) {
            //    baseValue += (baseValue * gstRate) / 100;
            // }

            // // 2. Apply Discount
            // if (!isNaN(discountPercent)) {
            //    baseValue -= (baseValue * discountPercent) / 100;
            // }
            itemCalculatedValue = baseValue;
          }
          return sumItems + itemCalculatedValue;
        }, 0);
        return totalBillValue + billItemsTotal;
      }, 0);
  }, [purchaseTransactions]);

  const animatedTotalPurchaseValueToday = useCountAnimation(
    totalPurchaseValueToday
  );

  // New KPI: Total Sale Returns Value (Overall)
  const totalSaleReturnsValueOverall = useMemo(() => {
    return allSaleReturns.reduce((sum, sReturn) => {
      return (
        sum +
        (parseFloat(sReturn.totalReturnAmount) || // ✅ yahi change karna tha
          sReturn.returnItems?.reduce(
            (itemSum, item) => itemSum + (parseFloat(item.returnAmount) || 0),
            0
          ) ||
          0)
      );
    }, 0);
  }, [allSaleReturns]);

  const animatedTotalSaleReturnsValueOverall = useCountAnimation(
    totalSaleReturnsValueOverall
  );

  const totalStockItems = useMemo(() => {
    return allInventoryItems.filter(
      (item) => parseFloat(item.currentStock || 0) > 0
    ).length;
  }, [allInventoryItems]);

  const animatedTotalStockItems = useCountAnimation(totalStockItems);

  const expiringSoonItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    return allInventoryItems.filter((item) => {
      const expiryDate = parseExpDate(item.expDate);
      if (!expiryDate) return false;

      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate > today && expiryDate <= sixMonthsFromNow;
    });
  }, [allInventoryItems]);

  const animatedTotalItemsNearExpiry = useCountAnimation(
    expiringSoonItems.length
  );

  const expiredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allInventoryItems.filter((item) => {
      const expiryDate = parseExpDate(item.expDate);
      if (!expiryDate) return false;

      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate <= today;
    });
  }, [allInventoryItems]);

  const animatedTotalExpiredItems = useCountAnimation(expiredItems.length);

  const allBulkUploads = useMemo(() => getBulkUploads(), [getBulkUploads]);
  const animatedNumberOfBulkUploads = useCountAnimation(allBulkUploads.length);

  // Total Value Mrp
  const totalInventoryValueMRP = useMemo(() => {
    let sum = 0;
    allInventoryItems.forEach((item) => {
      const stock = parseFloat(item.currentStock || 0);
      const mrp = parseFloat(item.mrp || 0);
      if (!isNaN(stock) && !isNaN(mrp)) {
        sum += stock * mrp;
      }
    });
    return sum;
  }, [allInventoryItems]);
  const animatedTotalInventoryValueMRP = useCountAnimation(
    totalInventoryValueMRP
  );

  // Total Stock QTY.
  const totalStockQty = useMemo(() => {
    return allInventoryItems.reduce((sum, item) => {
      const stock = parseFloat(item.currentStock || 0);
      return sum + (isNaN(stock) ? 0 : stock);
    }, 0);
  }, [allInventoryItems]);

  const animatedTotalStockQty = useCountAnimation(totalStockQty);

  // --- CHARTS / VISUALIZATIONS Data Preparation ---

  // Sales Trend (Last 7 or 30 days)
  const salesTrendData = useMemo(() => {
    const dateMap = new Map();
    const allDates = getDatesInRange(filterStartDate, filterEndDate);

    allDates.forEach((date) => {
      const dateStr = getDateString(date);
      dateMap.set(dateStr, { date: dateStr, counter: 0, indoor: 0 });
    });

    filteredCounterSales.forEach((sale) => {
      const dateStr = getDateString(sale.saleDate);
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).counter += sale.totalAmount || 0;
      }
    });

    filteredIndoorSales.forEach((sale) => {
      const dateStr = getDateString(sale.saleDate);
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).indoor += sale.totalAmount || 0;
      }
    });

    return Array.from(dateMap.values());
  }, [
    filterStartDate,
    filterEndDate,
    filteredCounterSales,
    filteredIndoorSales,
  ]);

  // Purchase vs Sale (per month)
  const purchaseVsSaleData = useMemo(() => {
    const monthlyDataMap = new Map();

    // Initialize map with months in range
    const currentDate = new Date(filterStartDate);
    currentDate.setDate(1); // Start from the 1st of the month
    while (currentDate <= filterEndDate) {
      const monthKey = `${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }`;
      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, {
          month: monthKey,
          sales: 0,
          purchases: 0,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    filteredCounterSales.forEach((sale) => {
      const monthKey = `${new Date(sale.saleDate).getFullYear()}-${
        new Date(sale.saleDate).getMonth() + 1
      }`;
      const data = monthlyDataMap.get(monthKey) || {
        month: monthKey,
        sales: 0,
        purchases: 0,
      };
      data.sales += parseFloat(sale.totalAmount) || 0;
      monthlyDataMap.set(monthKey, data);
    });

    filteredIndoorSales.forEach((sale) => {
      const monthKey = `${new Date(sale.saleDate).getFullYear()}-${
        new Date(sale.saleDate).getMonth() + 1
      }`;
      const data = monthlyDataMap.get(monthKey) || {
        month: monthKey,
        sales: 0,
        purchases: 0,
      };
      data.sales += parseFloat(sale.totalAmount) || 0;
      monthlyDataMap.set(monthKey, data);
    });

    filteredPurchaseTransactions.forEach((purchase) => {
      const billDateObj = new Date(purchase.billDate || purchase.purchaseDate);
      const monthKey = `${billDateObj.getFullYear()}-${
        billDateObj.getMonth() + 1
      }`;
      const data = monthlyDataMap.get(monthKey) || {
        month: monthKey,
        sales: 0,
        purchases: 0,
      };

      // Compute exact purchase value like "Purchases (Today)"
      const billItemsTotal = Array.isArray(purchase.items)
        ? purchase.items.reduce((sumItems, item) => {
            const rate = parseFloat(item.purchaseRate);
            const quantity = parseFloat(item.actualBillableQty);
            let baseValue = 0;

            if (!isNaN(rate) && !isNaN(quantity) && quantity > 0) {
              baseValue = rate * quantity;
            }

            return sumItems + baseValue;
          }, 0)
        : 0;

      data.purchases += billItemsTotal;
      monthlyDataMap.set(monthKey, data);
    });

    // Sort by month (e.g., "2025-7" comes before "2025-8")
    return Array.from(monthlyDataMap.values()).sort((a, b) => {
      const [yearA, monthA] = a.month.split("-").map(Number);
      const [yearB, monthB] = b.month.split("-").map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
  }, [
    filteredCounterSales,
    filteredIndoorSales,
    filteredPurchaseTransactions,
    filterStartDate,
    filterEndDate,
  ]);

  // Top 5 Selling Items
  const topSellingItemsData = useMemo(() => {
    const itemSalesMap = new Map();
    const allSales = [...filteredCounterSales, ...filteredIndoorSales];

    allSales.forEach((sale, saleIndex) => {
      console.log(`📦 Sale #${saleIndex + 1}:`, sale);

      (sale.items || []).forEach((soldItem, itemIndex) => {
        const itemId = soldItem.id; // ✅ confirmed
        const itemQuantity = parseFloat(
          soldItem.totalQuantity || soldItem.totalSoldQtyInStrips || 0
        ); // ✅ confirmed

        console.log(`🛒 Sold Item #${itemIndex + 1}:`, soldItem);
        console.log("➡️ itemId:", itemId, "| Quantity:", itemQuantity);

        if (!itemId || itemQuantity <= 0) return;

        itemSalesMap.set(
          itemId,
          (itemSalesMap.get(itemId) || 0) + itemQuantity
        );
      });
    });

    const itemsWithSales = Array.from(itemSalesMap.entries())
      .map(([itemId, quantitySold]) => {
        const itemDetail = inventoryItems.find(
          (item) =>
            item.id === itemId ||
            item._id === itemId ||
            item.itemId === itemId ||
            item.medicineId === itemId
        );
        const itemName =
          itemDetail?.nameOfItemMedicine ||
          itemDetail?.name ||
          itemDetail?.medicineName ||
          `Unknown Item (${itemId})`;

        return {
          name: itemName,
          quantity: quantitySold,
        };
      })
      .sort((a, b) => b.quantity - a.quantity);

    return itemsWithSales.slice(0, 20);
  }, [filteredCounterSales, filteredIndoorSales, inventoryItems]);

  // Top 5 Returned Items
  const topReturnedItemsData = useMemo(() => {
    const itemReturnMap = new Map();

    filteredSaleReturns.forEach((sReturn, i) => {
      const returned = sReturn.returnedItem;
      if (!returned) return;

      const itemId = returned.itemId || returned.id || `row-${i}`;
      const itemName = returned.nameOfItemMedicine?.trim();
      const itemQuantity = parseFloat(returned.returnQty || 0);

      console.log(`🔁 Return #${i + 1}:`, returned);
      console.log(
        "➡️ itemId:",
        itemId,
        "| Quantity:",
        itemQuantity,
        "| Name:",
        itemName
      );

      if (!itemId || itemQuantity <= 0) return;

      const key = `${itemId}___${itemName || ""}`; // Simpler than JSON.stringify

      itemReturnMap.set(key, (itemReturnMap.get(key) || 0) + itemQuantity);
    });

    const itemsWithReturns = Array.from(itemReturnMap.entries())
      .map(([key, quantityReturned]) => {
        const [itemId, itemNameRaw] = key.split("___");

        const itemDetail = allItems?.find(
          (item) =>
            item.id === itemId ||
            item._id === itemId ||
            item.itemId === itemId ||
            item.name?.toLowerCase().trim() ===
              itemNameRaw?.toLowerCase().trim()
        );

        const finalName =
          itemDetail?.nameOfItemMedicine ||
          itemDetail?.name ||
          itemDetail?.medicineName ||
          itemNameRaw ||
          `Unknown Item (${itemId})`;

        return {
          name: finalName,
          quantity: quantityReturned,
        };
      })
      .sort((a, b) => b.quantity - a.quantity);

    console.log("📦 Top 5 Returned Items:", itemsWithReturns.slice(0, 5));

    return itemsWithReturns.slice(0, 5);
  }, [filteredSaleReturns, allItems]);

  // Stock Level Distribution
  const stockLevelDistribution = useMemo(() => {
    const categories = {
      "Low Stock": 0,
      "Moderate Stock": 0,
      "High Stock": 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to 00:00

    const parseExpDate = (expDateStr) => {
      if (!expDateStr) return null;
      const [month, year] = expDateStr.split("/").map((v) => parseInt(v, 10));
      if (!month || !year) return null;

      // Last day of the expiry month
      return new Date(year, month, 0);
    };

    const validItems = allInventoryItems.filter((item) => {
      const expDate = parseExpDate(item.expDate);
      const stock = parseFloat(item.currentStock || 0);
      const isExpired = expDate && expDate < today;

      if (isExpired || stock <= 0) {
        console.log(
          `❌ Skipping: ${item.nameOfItemMedicine || item.name} | Exp: ${
            item.expDate
          } | Stock: ${stock}`
        );
        return false;
      }

      console.log(
        `✅ Counting: ${item.nameOfItemMedicine || item.name} | Exp: ${
          item.expDate
        } | Stock: ${stock}`
      );
      return true;
    });

    validItems.forEach((item) => {
      const stock = parseFloat(item.currentStock || 0);

      if (stock < 10) {
        categories["Low Stock"]++;
      } else if (stock < 50) {
        categories["Moderate Stock"]++;
      } else {
        categories["High Stock"]++;
      }
    });

    console.log("📊 Final Stock Level Distribution:", categories);

    return Object.keys(categories).map((key) => ({
      name: key,
      value: categories[key],
    }));
  }, [allInventoryItems]);

  // Manufacturer-wise Sales Distribution
  // const manufacturerSalesData = useMemo(() => {
  //    const manufacturerSalesMap = new Map();
  //    const allFilteredSales = [...filteredCounterSales, ...filteredIndoorSales];

  //    allFilteredSales.forEach((sale) => {
  //      sale.items?.forEach((soldItem) => {
  //        const itemDetail = allItems.find((item) => item.id === soldItem.id);
  //        if (itemDetail && itemDetail.manufacturerId) {
  //          const manufacturer = allManufacturers.find(
  //            (m) => m.id === itemDetail.manufacturerId
  //          );
  //          const manufacturerName = manufacturer
  //            ? manufacturer.name
  //            : "Unknown Manufacturer";
  //          manufacturerSalesMap.set(
  //            manufacturerName,
  //            (manufacturerSalesMap.get(manufacturerName) || 0) +
  //              (soldItem.mrp || 0) * (soldItem.quantity || 0)
  //          ); // Summing by MRP for sales value
  //        }
  //      });
  //    });

  //    return Array.from(manufacturerSalesMap).map(([name, value]) => ({
  //      name,
  //      value,
  //    }));
  // }, [filteredCounterSales, filteredIndoorSales, allItems, allManufacturers]);

  // Counter Sale vs Indoor Sale %
  const counterIndoorSalesData = useMemo(() => {
    const counterSalesTotal = filteredCounterSales.reduce(
      (sum, sale) => sum + (parseFloat(sale.totalAmount) || 0),
      0
    );
    const indoorSalesTotal = filteredIndoorSales.reduce(
      (sum, sale) => sum + (parseFloat(sale.totalAmount) || 0),
      0
    );
    const totalSales = counterSalesTotal + indoorSalesTotal;

    if (totalSales === 0) return [];

    return [
      {
        name: "Counter Sales",
        value: counterSalesTotal,
        percentage: (counterSalesTotal / totalSales) * 100,
      },
      {
        name: "Indoor Sales",
        value: indoorSalesTotal,
        percentage: (indoorSalesTotal / totalSales) * 100,
      },
    ];
  }, [filteredCounterSales, filteredIndoorSales]);

  // Pie chart colors (can be extended)
  const PIE_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6b7280",
    "#9ca3af",
    "#6366f1",
  ]; // Tailwind's blue, emerald, amber, red, gray, indigo

  // --- INVENTORY & STOCK Lists (Based on toggles) ---
  const lowStockItemsList = useMemo(() => {
    if (!showLowStockItems) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allInventoryItems.filter((item) => {
      const currentStock = parseFloat(item.currentStock || 0);
      const expiryDate = parseExpDate(item.expDate);
      const isExpired = expiryDate && expiryDate <= today;

      // Find the corresponding item detail from allItems for stockAlertQty
      const itemDetail = allItems.find(
        (med) =>
          med.id === item.id ||
          med._id === item.id ||
          med.itemId === item.id ||
          med.medicineId === item.id
      );

      // Use itemDetail.stockAlertQty, defaulting to 5 if not available
      const minStockLevel = parseFloat(itemDetail?.stockAlertQty || 5);

      // Only include if stock is low AND not expired
      return currentStock > 0 && currentStock <= minStockLevel && !isExpired;
    });
  }, [allInventoryItems, showLowStockItems, allItems]);

  const overstockItemsList = useMemo(() => {
    const OVERSTOCK_THRESHOLD = 100; // Define your overstock threshold
    return allInventoryItems
      .filter(
        (item) => (parseFloat(item.currentStock) || 0) >= OVERSTOCK_THRESHOLD
      )
      .sort(
        (a, b) =>
          (parseFloat(b.currentStock) || 0) - (parseFloat(a.currentStock) || 0)
      );
  }, [allInventoryItems]);

  // --- Activity Feed ---
  const activityFeed = useMemo(() => {
    const activities = [];
    const recentDateLimit = addDays(new Date(), -7); // Last 7 days for activity feed

    // Counter Sales
    allCounterSales.forEach((sale) => {
      const saleDateTime = new Date(sale.saleDate);
      if (saleDateTime >= recentDateLimit) {
        activities.push({
          timestamp: saleDateTime,
          message: `Sold ${sale.items?.length || 0} item(s) for ₹${(
            parseFloat(sale.totalAmount) || 0
          ).toFixed(2)} in Counter Sale.`,
          type: "sale",
          id: sale.id, // For linking to view details page
        });
      }
    });

    // Indoor Sales
    allIndoorSales.forEach((sale) => {
      const saleDateTime = new Date(sale.saleDate);
      if (saleDateTime >= recentDateLimit) {
        activities.push({
          timestamp: saleDateTime,
          message: `Sold ${sale.items?.length || 0} item(s) for ₹${(
            parseFloat(sale.totalAmount) || 0
          ).toFixed(2)} in Indoor Sale.`,
          type: "sale",
          id: sale.id,
        });
      }
    });

    // Purchase Transactions
    allPurchaseTransactions.forEach((purchase) => {
      const rawDateStr =
        purchase.purchaseDate || purchase.date || purchase.billDate;

      function convertToISO(dateStr) {
        // Handles formats like "31-07-2025" → returns "2025-07-31T00:00:00"
        if (!dateStr || typeof dateStr !== "string") return "";
        const [dd, mm, yyyy] = dateStr.split("-");
        if (!dd || !mm || !yyyy) return "";
        return `${yyyy}-${mm}-${dd}T00:00:00`;
      }

      const purchaseDateTime = rawDateStr
        ? new Date(
            rawDateStr.includes("T") ? rawDateStr : convertToISO(rawDateStr)
          )
        : null;

      if (!purchaseDateTime || purchaseDateTime < recentDateLimit) return;

      if (
        purchase.id?.startsWith("revert-") ||
        purchase.vendorName === "Reverted Sale"
      )
        return;

      const vendor = allVendors.find((v) => v.id === purchase.vendorId);
      const vendorName =
        vendor?.name || purchase.vendorName || "Unknown Vendor";

      let total = parseFloat(purchase.grandTotal);
      if (!total || isNaN(total)) {
        total = Array.isArray(purchase.items)
          ? purchase.items.reduce((sum, item) => {
              const rate = parseFloat(item.purchaseRate) || 0;
              const qty = parseFloat(item.actualBillableQty) || 0;
              return sum + rate * qty;
            }, 0)
          : 0;
      }

      activities.push({
        timestamp: purchaseDateTime,
        message: `Added purchase worth ₹${total.toFixed(
          2
        )} from ${vendorName}.`,
        type: "purchase",
        id: purchase.id,
      });
    });

    // Sale Returns
    allSaleReturns.forEach((sReturn) => {
      const returnDateTime = new Date(sReturn.returnDate);
      if (returnDateTime >= recentDateLimit) {
        let returnedValue = 0;

        if (Array.isArray(sReturn.returnedItems)) {
          // Case: returnedItems is array
          returnedValue = sReturn.returnedItems.reduce(
            (sum, item) =>
              sum +
              (parseFloat(item.mrp) || 0) *
                (parseFloat(item.returnQty || item.quantity) || 0),
            0
          );
        } else if (sReturn.returnedItem) {
          // Case: single returnedItem object
          const item = sReturn.returnedItem;
          returnedValue =
            (parseFloat(item.mrp) || 0) *
            (parseFloat(item.returnQty || item.quantity) || 0);
        }

        activities.push({
          timestamp: returnDateTime,
          message: `Processed sale return for ₹${returnedValue.toFixed(2)}.`,
          type: "return",
          id: sReturn.id,
        });
      }
    });

    // Bulk Uploads
    allBulkUploads.forEach((upload) => {
      const uploadDateTime = new Date(upload.timestamp);
      if (uploadDateTime >= recentDateLimit) {
        activities.push({
          timestamp: uploadDateTime,
          message: `Bulk entry uploaded: ${upload.itemCount || 0} items in ${
            upload.transactionCount || 0
          } transactions.`,
          type: "bulk-upload",
          id: upload.id,
        });
      }
    });
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15); // Show last 15 activities
  }, [
    allCounterSales,
    allIndoorSales,
    allPurchaseTransactions,
    allSaleReturns,
    allBulkUploads,
    allVendors,
  ]);
  // --- INSIGHTS / RECOMMENDATIONS (Example Logic) ---
  const insights = useMemo(() => {
    const currentInsights = [];

    // Low stock insights
    if (lowStockItemsList.length > 0) {
      const itemNames = lowStockItemsList
        .map((item) => item.nameOfItemMedicine || item.name || "Unnamed Item")
        .slice(0, 3)
        .join(", ");
      currentInsights.push(
        `You are low on: ${itemNames}${
          lowStockItemsList.length > 3 ? " and more" : ""
        } — reorder soon!`
      );
    }

    // Expired insights
    if (expiredItems.length > 0) {
      currentInsights.push(
        `${expiredItems.length} item(s) have expired — please remove from inventory and dispose.`
      );
    }

    // Expiring soon insights
    if (expiringSoonItems.length > 0) {
      currentInsights.push(
        `${expiringSoonItems.length} item(s) will expire in the next 6 months — plan sales or promotions accordingly.`
      );
    }

    // Sales trend insight (simple example: today vs yesterday)
    const todaySales = totalCounterSalesToday + totalIndoorSalesToday;
    const yesterday = addDays(new Date(), -1);
    const yesterdaySales =
      allCounterSales
        .filter(
          (sale) => getDateString(sale.saleDate) === getDateString(yesterday)
        )
        .reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0) +
      allIndoorSales
        .filter(
          (sale) => getDateString(sale.saleDate) === getDateString(yesterday)
        )
        .reduce((sum, sale) => sum + (parseFloat(sale.totalAmount) || 0), 0);

    if (yesterdaySales > 0 && todaySales > 0) {
      const percentageChange =
        ((todaySales - yesterdaySales) / yesterdaySales) * 100;
      if (percentageChange > 20) {
        currentInsights.push(
          `Today's sales are ${percentageChange.toFixed(
            0
          )}% higher than yesterday — great work!`
        );
      } else if (percentageChange < -20) {
        currentInsights.push(
          `Today's sales are ${Math.abs(percentageChange).toFixed(
            0
          )}% lower than yesterday — review sales strategy.`
        );
      }
    }

    return currentInsights;
  }, [
    lowStockItemsList,
    expiredItems,
    expiringSoonItems,
    totalCounterSalesToday,
    totalIndoorSalesToday,
    allCounterSales,
    allIndoorSales,
  ]);

  // --- Render Dashboard ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="rounded-xl bg-gradient-to-l from-blue-400 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide">
          {" "}
          INVENTORY DASHBOARD{" "}
        </h1>
        <div className="flex items-center space-x-6">
          <span className="text-lg font-medium hidden sm:block">
            {" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
          </span>
          {/* Notifications icon with a placeholder badge */}
          <div className="relative">
            <button className="text-3xl p-1 text-yellow-300 hover:text-yellow-400 transition-colors duration-200">
              {" "}
              🔔{" "}
            </button>
            {(animatedTotalItemsNearExpiry > 0 ||
              lowStockItemsList.length > 0 ||
              animatedTotalExpiredItems > 0) && (
              <span className="notification-badge">
                {" "}
                {animatedTotalItemsNearExpiry +
                  lowStockItemsList.length +
                  animatedTotalExpiredItems}{" "}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6 flex flex-col gap-6">
        {/* Section A: KPIs - Basic Metrics */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-200">
            {" "}
            Overview Statistics{" "}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-blue-200">
              <h3 className="text-blue-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Total Medicines{" "}
              </h3>
              <p className="text-blue-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalMedicines}{" "}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-green-200">
              <h3 className="text-green-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Total Vendors{" "}
              </h3>
              <p className="text-green-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalVendors}{" "}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-purple-200">
              <h3 className="text-purple-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Medicines in Stock{" "}
              </h3>
              <p className="text-purple-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalStockItems}{" "}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-yellow-200">
              <h3 className="text-yellow-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Items Near Expiry{" "}
              </h3>
              <p className="text-yellow-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalItemsNearExpiry}{" "}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-red-200">
              <h3 className="text-red-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Expired Items{" "}
              </h3>
              <p className="text-red-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalExpiredItems}{" "}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg p-5 text-center shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg border border-indigo-200">
              <h3 className="text-indigo-700 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {" "}
                Bulk Uploads{" "}
              </h3>
              <p className="text-indigo-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedNumberOfBulkUploads}{" "}
              </p>
            </div>
          </div>
        </section>

        {/* Section B: Today's Financials */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-200">
            {" "}
            Today's Financial Summary{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-5 text-center shadow-md border border-blue-200">
              <h3 className="text-blue-700 text-base font-medium">
                {" "}
                Counter Sales (Today){" "}
              </h3>
              <p className="text-blue-600 text-4xl font-extrabold mt-2">
                {" "}
                ₹{animatedTotalCounterSalesToday.toFixed(2)}{" "}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-5 text-center shadow-md border border-green-200">
              <h3 className="text-green-700 text-base font-medium">
                {" "}
                Indoor Sales (Today){" "}
              </h3>
              <p className="text-green-600 text-4xl font-extrabold mt-2">
                {" "}
                ₹{animatedTotalIndoorSalesToday.toFixed(2)}{" "}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-5 text-center shadow-md border border-yellow-200">
              <h3 className="text-yellow-700 text-base font-medium">
                {" "}
                Purchases (Today){" "}
              </h3>
              <p className="text-yellow-600 text-4xl font-extrabold mt-2">
                {" "}
                ₹{animatedTotalPurchaseValueToday.toFixed(2)}{" "}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-5 text-center shadow-md border border-red-200">
              <h3 className="text-red-700 text-base font-medium">
                {" "}
                Sale Returns (Overall){" "}
              </h3>
              <p className="text-red-600 text-4xl font-extrabold mt-2">
                {" "}
                ₹{animatedTotalSaleReturnsValueOverall.toFixed(2)}{" "}
              </p>
            </div>
          </div>
        </section>

        {/* Section C: Inventory Valuation */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-200">
            {" "}
            Current Inventory Valuation{" "}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-5 text-center shadow-md border border-purple-200">
              <h3 className="text-purple-700 text-base font-medium">
                {" "}
                Total Inventory Value (MRP){" "}
              </h3>
              <p className="text-purple-600 text-4xl font-extrabold mt-2">
                {" "}
                ₹{animatedTotalInventoryValueMRP.toFixed(2)}{" "}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-5 text-center shadow-md border border-orange-200">
              <h3 className="text-orange-700 text-base font-medium">
                {" "}
                Total Inventory Quantity{" "}
              </h3>
              <p className="text-orange-600 text-4xl font-extrabold mt-2">
                {" "}
                {animatedTotalStockQty.toFixed(0)}{" "}
              </p>
            </div>
          </div>
        </section>

        {/* Section D: Filters and Toggles */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-200">
            {" "}
            Data Filters{" "}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <label htmlFor="dateRange" className="font-medium text-gray-700">
              {" "}
              Sales/Purchase Data Range:{" "}
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCustomStartDate(""); // Clear custom dates on range change
                setCustomEndDate("");
              }}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange === "custom" && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400"
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center cursor-pointer text-gray-700 font-medium">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={showLowStockItems}
                onChange={() => setShowLowStockItems(!showLowStockItems)}
              />
              <span className="ml-2"> Show Low Stock Items </span>
            </label>

            <label className="flex items-center cursor-pointer text-gray-700 font-medium">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-red-600"
                checked={showExpiredAndExpiringItems}
                onChange={() =>
                  setShowExpiredAndExpiringItems(!showExpiredAndExpiringItems)
                }
              />
              <span className="ml-2"> Show Expired & Expiring Items </span>
            </label>
          </div>
        </section>

        {/* Section E: Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Sales Trend{" "}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  angle={-15}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="counter"
                  name="Counter Sales"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="indoor"
                  name="Indoor Sales"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Purchase vs Sale Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Monthly Sales vs Purchases{" "}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={purchaseVsSaleData}
                barSize={150}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#3b82f6" />
                <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Level Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Stock Level Distribution{" "}
            </h3>
            {stockLevelDistribution.some((data) => data.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockLevelDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ percent }) => ` ${(percent * 100).toFixed(0)}%`}
                  >
                    {stockLevelDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} items`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">
                {" "}
                No stock data available.{" "}
              </p>
            )}
          </div>

          {/* Counter Sale vs Indoor Sale Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Counter vs Indoor Sales{" "}
            </h3>
            {counterIndoorSalesData.length > 0 &&
            counterIndoorSalesData[0].value + counterIndoorSalesData[1].value >
              0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={counterIndoorSalesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {counterIndoorSalesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) =>
                      `₹${value.toFixed(2)} (${props.payload.percentage.toFixed(
                        1
                      )}%)`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">
                {" "}
                No sales data for this period.{" "}
              </p>
            )}
          </div>

          {/* Top 5 Selling Items */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Top 20 Selling Items{" "}
            </h3>
            {topSellingItemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topSellingItemsData}
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `${value} units`} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">
                {" "}
                No sales data for this period.{" "}
              </p>
            )}
          </div>

          {/* Top 5 Returned Items */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              {" "}
              Top 5 Returned Items{" "}
            </h3>
            {topReturnedItemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topReturnedItemsData}
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `${value} units`} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">
                {" "}
                No return data for this period.{" "}
              </p>
            )}
          </div>

          {/* Manufacturer-wise Sales Distribution */}
          {/*
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              Manufacturer-wise Sales
            </h3>
            {manufacturerSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={manufacturerSalesData}
                  layout="vertical"
                  margin={{ left: 100, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-10">
                No manufacturer sales data for this period.
              </p>
            )}
          </div>
          */}
        </section>

        {/* Section F: Alerts & Lists */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Items List */}
          {showLowStockItems && lowStockItemsList.length > 0 && (
            <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
              <h3 className="text-xl font-bold text-yellow-800 mb-4 pb-2 border-b border-yellow-300">
                {" "}
                Low Stock Items{" "}
              </h3>
              <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
                {lowStockItemsList.map((item) => {
                  const itemName =
                    item.nameOfItemMedicine?.trim() ||
                    item.name?.trim() ||
                    item.medicineName?.trim() ||
                    "Unnamed Item";

                  const batchNo = item.batchSrlNo || "N/A";
                  const totalStock = parseFloat(item.currentStock || 0);
                  const unit = item.unitOfMeasurement || "";

                  return (
                    <li
                      key={item.id}
                      className="mb-2 text-yellow-700 font-medium"
                    >
                      <span className="font-semibold">{itemName}</span> - Batch:{" "}
                      <span className="text-gray-700">{batchNo}</span> - Stock:{" "}
                      <span className="text-gray-700">
                        {totalStock} {unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Expired & Expiring Soon Items List */}
          {showExpiredAndExpiringItems &&
            (expiredItems.length > 0 || expiringSoonItems.length > 0) && (
              <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-4 pb-2 border-b border-red-300">
                  Expired & Expiring Items
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  {expiredItems.length > 0 && (
                    <>
                      <h4 className="font-semibold text-red-700 mb-2">
                        Expired (As of Today):
                      </h4>
                      <ul className="list-disc pl-5 mb-4">
                        {expiredItems.map((item) => (
                          <li key={item.id} className="mb-1 text-red-600">
                            <span className="font-medium">
                              {item.nameOfItemMedicine ||
                                item.name ||
                                item.medicineName ||
                                "Unnamed Item"}
                            </span>{" "}
                            - Batch:{" "}
                            <span className="text-gray-700">
                              {item.batchSrlNo || "N/A"}
                            </span>{" "}
                            - Expiry:{" "}
                            <span className="text-gray-700">
                              {item.expDate}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {expiringSoonItems.length > 0 && (
                    <>
                      <h4 className="font-semibold text-yellow-700 mb-2">
                        Expiring in Next 6 Months:
                      </h4>
                      <ul className="list-disc pl-5">
                        {expiringSoonItems.map((item) => (
                          <li key={item.id} className="mb-1 text-yellow-600">
                            <span className="font-medium">
                              {item.nameOfItemMedicine ||
                                item.name ||
                                item.medicineName ||
                                "Unnamed Item"}
                            </span>{" "}
                            - Batch:{" "}
                            <span className="text-gray-700">
                              {item.batchSrlNo || "N/A"}
                            </span>{" "}
                            - Expiry:{" "}
                            <span className="text-gray-700">
                              {item.expDate}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}

          {/* Overstock Items List (Always visible if data exists) */}
          {overstockItemsList.length > 0 && (
            <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200 col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-blue-800 mb-4 pb-2 border-b border-blue-300">
                {" "}
                Overstock Items (Qty &ge; 100){" "}
              </h3>
              <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
                {overstockItemsList.map((item) => (
                  <li key={item.id} className="mb-2 text-blue-700 font-medium">
                    {" "}
                    {item.nameOfItemMedicine ||
                      item.name ||
                      item.medicineName ||
                      "Unnamed Item"}{" "}
                    (Current Stock: {parseFloat(item.currentStock || 0)}{" "}
                    {item.unitOfMeasurement}){" "}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Section G: Activity Feed & Insights */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-800 mb-5 pb-3 border-b-2 border-blue-200">
            {" "}
            Recent Activity & Insights{" "}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg shadow-sm p-5 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {" "}
                Activity Feed (Last 7 Days){" "}
              </h3>
              <ul className="list-none p-0 max-h-80 overflow-y-auto">
                {activityFeed.length > 0 ? (
                  activityFeed.map((activity, index) => (
                    <li
                      key={index}
                      className="flex items-start mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <span className="text-gray-500 text-sm mr-3 mt-1 min-w-[70px]">
                        {" "}
                        {activity.timestamp.toLocaleDateString()}
                      </span>
                      <span
                        className={`text-2xl mr-3 ${
                          activity.type === "sale"
                            ? "text-green-500"
                            : activity.type === "purchase"
                            ? "text-blue-500"
                            : activity.type === "return"
                            ? "text-red-500"
                            : "text-purple-500"
                        }`}
                      >
                        {" "}
                        {activity.type === "sale"
                          ? "📈"
                          : activity.type === "purchase"
                          ? "📦"
                          : activity.type === "return"
                          ? "↩️"
                          : "📊"}{" "}
                      </span>
                      <span className="text-gray-700 leading-relaxed">
                        {activity.message}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-center text-gray-500 p-4">
                    No recent activity.
                  </p>
                )}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg shadow-sm p-5 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Insights & Recommendations
              </h3>
              {insights.length > 0 ? (
                <ul className="list-none p-0">
                  {insights.map((insight, index) => (
                    <li
                      key={index}
                      className="bg-green-100 border border-green-300 rounded-lg p-4 mb-3 text-base text-green-800 flex items-start gap-3 shadow-sm"
                    >
                      <span className="text-green-600 text-2xl">💡</span>
                      <p>{insight}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 p-4">
                  No current insights or recommendations.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
