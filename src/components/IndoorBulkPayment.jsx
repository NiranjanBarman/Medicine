// // src/components/IndoorBulkPayment.jsx
// import React, { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import useIndoorSaleStore from "../store/useIndoorSaleStore";

// const safeParseFloat = (value) => parseFloat(value || 0) || 0;
// const formatAmount = (amount) =>
//   typeof amount === "number" ? amount.toFixed(2) : "0.00";

// const IndoorBulkPayment = () => {
//   const navigate = useNavigate();
//   const { indoorSales, updateIndoorSalePayment, getIndoorSaleById } = useIndoorSaleStore();

//   const [selectedPatientId, setSelectedPatientId] = useState("");
//   const [bulkDiscountPercent, setBulkDiscountPercent] = useState(0);
//   const [amountToPay, setAmountToPay] = useState(0);
//   const [detailedBills, setDetailedBills] = useState([]);

//   // 🔹 Patients with outstanding dues
//   const patientsWithDues = useMemo(() => {
//     const patients = {};
//     indoorSales.forEach((sale) => {
//       if (sale.balanceDue > 0) {
//         if (!patients[sale.patientId]) {
//           patients[sale.patientId] = {
//             id: sale.patientId,
//             name: sale.customerName,
//             totalDue: 0,
//           };
//         }
//         patients[sale.patientId].totalDue += safeParseFloat(sale.balanceDue);
//       }
//     });
//     return Object.values(patients);
//   }, [indoorSales]);

//   // 🔹 Get unpaid bills of selected patient
//   const unpaidBillsForPatient = useMemo(() => {
//     if (!selectedPatientId) return [];
//     return indoorSales.filter(
//       (sale) =>
//         sale.patientId === selectedPatientId &&
//         safeParseFloat(sale.balanceDue) > 0
//     );
//   }, [indoorSales, selectedPatientId]);

//   // 🔹 Fetch detailed bill data when a patient is selected
//   useEffect(() => {
//     if (selectedPatientId) {
//       const bills = unpaidBillsForPatient.map(bill => getIndoorSaleById(bill.id));
//       setDetailedBills(bills.filter(Boolean));
//     } else {
//       setDetailedBills([]);
//     }
//   }, [selectedPatientId, unpaidBillsForPatient, getIndoorSaleById]);

//   // 🔹 Total due across all bills
//   const totalBillsDue = useMemo(() => {
//     return unpaidBillsForPatient.reduce(
//       (acc, bill) => acc + safeParseFloat(bill.balanceDue),
//       0
//     );
//   }, [unpaidBillsForPatient]);

//   // 🔹 Final amount with discount + round off
//   const { finalAmountToPay, roundOffAmount } = useMemo(() => {
//     const discountFactor = 1 - safeParseFloat(bulkDiscountPercent) / 100;
//     const calculated = totalBillsDue * discountFactor;
//     const rounded = Math.round(calculated);
//     return { finalAmountToPay: rounded, roundOffAmount: rounded - calculated };
//   }, [totalBillsDue, bulkDiscountPercent]);

//   useEffect(() => {
//     if (selectedPatientId) setAmountToPay(finalAmountToPay);
//     else setAmountToPay(0);
//   }, [finalAmountToPay, selectedPatientId]);

//   // 🔹 Handle bulk payment
//   const handleBulkPay = () => {
//     if (!selectedPatientId) return alert("Please select a patient first.");
//     if (unpaidBillsForPatient.length === 0)
//       return alert("Selected patient has no outstanding dues.");

//     const discount = safeParseFloat(bulkDiscountPercent);
//     if (discount < 0 || discount > 100)
//       return alert("Discount percentage must be between 0 and 100.");

//     const paymentInput = safeParseFloat(amountToPay);
//     if (paymentInput > finalAmountToPay) {
//       return alert(
//         `Payment amount (₹${formatAmount(
//           paymentInput
//         )}) cannot exceed the total due amount after discount (₹${formatAmount(
//           finalAmountToPay
//         )}).`
//       );
//     }

//     if (
//       !window.confirm(
//         `Are you sure you want to process a payment of ₹${formatAmount(
//           paymentInput
//         )}? Remaining due will be ₹${formatAmount(
//           finalAmountToPay - paymentInput
//         )}.`
//       )
//     )
//       return;

//     let remainingPayment = paymentInput;
//     unpaidBillsForPatient.forEach((bill) => {
//       if (remainingPayment > 0) {
//         const billOriginalDue = safeParseFloat(bill.balanceDue);
//         const discountAmountForThisBill = billOriginalDue * (discount / 100);
//         const billDueAfterDiscount = billOriginalDue - discountAmountForThisBill;
//         const amountToPayOnThisBill =
//           remainingPayment >= billDueAfterDiscount
//             ? billDueAfterDiscount
//             : remainingPayment;

//         const updatedSale = {
//           ...bill,
//           amountPaid: safeParseFloat(bill.amountPaid) + amountToPayOnThisBill,
//           balanceDue: billDueAfterDiscount - amountToPayOnThisBill,
//           isPaid: billDueAfterDiscount - amountToPayOnThisBill <= 0.01,
//           bulkDiscountApplied:
//             (safeParseFloat(bill.bulkDiscountApplied) || 0) +
//             discountAmountForThisBill,
//           bulkDiscountPercentApplied: discount,
//         };
//         updateIndoorSalePayment(updatedSale);
//         remainingPayment -= amountToPayOnThisBill;
//       }
//     });

//     alert("Payment successfully processed!");
//     const bulkPaymentId = `BLK-${Date.now()}`;
//     navigate(`/print-indoor-bulk/${bulkPaymentId}`, {
//       state: {
//         patient: {
//           id: selectedPatientId,
//           name: unpaidBillsForPatient[0].customerName,
//           address: unpaidBillsForPatient[0].address,
//           mobileNo: unpaidBillsForPatient[0].mobileNo,
//           patientId: unpaidBillsForPatient[0].patientId,
//         },
//         totalBillsDue,
//         finalAmountToPay,
//         roundOffAmount,
//         amountPaid: paymentInput,
//         remainingDue: finalAmountToPay - paymentInput,
//         bulkDiscountPercent,
//         paidBills: unpaidBillsForPatient.map((bill) => {
//           const billOriginalDue = safeParseFloat(bill.balanceDue);
//           const discountAmount = billOriginalDue * (discount / 100);
//           const amountPaidForThisBill =
//             (billOriginalDue - discountAmount) *
//             (paymentInput / finalAmountToPay);
//           return {
//             id: bill.id, 
//             billNo: bill.billNo,
//             saleDate: bill.saleDate,
//             balanceDue: bill.balanceDue,
//             amountPaid: amountPaidForThisBill,
//           };
//         }),
//       },
//     });
//   };

//   return (
//     <div className="container mx-auto p-3 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl rounded-2xl border border-blue-200">
//       <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center text-indigo-800 tracking-tight">
//         INDOOR BULK PAYMENT
//       </h3>

//       {/* Patient Select */}
//       <div className="bg-white p-4 rounded-xl shadow-lg mb-4 border border-gray-200">
//         <label className="block text-base font-semibold text-gray-800 mb-2">
//           Select Patient with Dues:
//         </label>
//         <select
//           value={selectedPatientId}
//           onChange={(e) => {
//             setSelectedPatientId(e.target.value);
//             setBulkDiscountPercent(0);
//           }}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
//         >
//           <option value="">-- Select a Patient --</option>
//           {patientsWithDues.length === 0 ? (
//             <option value="" disabled>
//               No patients with outstanding dues.
//             </option>
//           ) : (
//             patientsWithDues.map((patient) => (
//               <option key={patient.id} value={patient.id}>
//                 {patient.name} ({patient.id}) - ₹{formatAmount(patient.totalDue)}
//               </option>
//             ))
//           )}
//         </select>
//       </div>

//       {/* Outstanding Bills & Items */}
//       {selectedPatientId && detailedBills.length > 0 && (
//         <div className="mt-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
//           <h3 className="text-lg font-bold text-gray-800 mb-3">
//             Outstanding Bills for{" "}
//             <span className="text-indigo-600">
//               {detailedBills[0].customerName}
//             </span>
//           </h3>

//           {detailedBills.map((bill) => (
//             <div key={bill.id} className="mb-4 p-3 border rounded-lg bg-gray-50">
//               <div className="flex justify-between font-bold text-gray-700 mb-2">
//                 <span>Bill No: {bill.billNo}</span>
//                 <span>Date: {bill.saleDate}</span>
//               </div>
//               <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner mb-2">
//                 <table className="min-w-full divide-y divide-gray-200 text-sm">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="px-3 py-2 text-left font-semibold">Item Name</th>
//                       <th className="px-3 py-2 text-left font-semibold">Batch</th>
//                       <th className="px-3 py-2 text-left font-semibold">HSN</th>
//                       <th className="px-3 py-2 text-right font-semibold">Qty</th>
//                       <th className="px-3 py-2 text-right font-semibold">Rate</th>
//                       <th className="px-3 py-2 text-right font-semibold">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {bill.items.map((item, itemIndex) => (
//                       <tr key={itemIndex} className="hover:bg-blue-50">
//                         <td className="px-3 py-2">{item.nameOfItemMedicine}</td>
//                         <td className="px-3 py-2">{item.batchSrlNo}</td>
//                         <td className="px-3 py-2">3004</td> {/* HSN is a placeholder */}
//                         <td className="px-3 py-2 text-right">{item.stripQty || item.cfQty}</td>
//                         <td className="px-3 py-2 text-right">₹{formatAmount(item.saleRateStrip)}</td>
//                         <td className="px-3 py-2 text-right">₹{formatAmount(item.netAmount)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="flex justify-between font-bold mt-2">
//                 <span>Total Bill Amount: ₹{formatAmount(bill.netAmount)}</span>
//                 <span className="text-red-600">Balance Due: ₹{formatAmount(bill.balanceDue)}</span>
//               </div>
//             </div>
//           ))}

//           {/* Bulk Discount & Payment Section */}
//           <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200 space-y-3 text-sm">
//             <div className="flex justify-between">
//               <span className="font-semibold">Total Outstanding:</span>
//               <span className="font-bold text-red-700">
//                 ₹{formatAmount(totalBillsDue)}
//               </span>
//             </div>

//             <div>
//               <label className="font-semibold mb-1 block">
//                 Apply Bulk Discount (%):
//               </label>
//               <input
//                 type="number"
//                 value={bulkDiscountPercent}
//                 onChange={(e) => setBulkDiscountPercent(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
//                 placeholder="0"
//                 min="0"
//                 max="100"
//                 step="0.01"
//               />
//             </div>

//             <div className="flex justify-between">
//               <span className="font-semibold">Final Amount after Discount:</span>
//               <span className="font-bold text-blue-700">
//                 ₹{formatAmount(finalAmountToPay)}
//               </span>
//             </div>

//             <div className="flex justify-between">
//               <span className="font-semibold">Round Off:</span>
//               <span
//                 className={`font-bold ${
//                   roundOffAmount >= 0 ? "text-green-700" : "text-red-700"
//                 }`}
//               >
//                 {roundOffAmount >= 0 ? "+" : "-"}₹
//                 {formatAmount(Math.abs(roundOffAmount))}
//               </span>
//             </div>

//             <div>
//               <label className="font-semibold mb-1 block">
//                 Enter Amount to Pay:
//               </label>
//               <input
//                 type="number"
//                 value={amountToPay}
//                 onChange={(e) => setAmountToPay(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="flex justify-between border-t pt-2 mt-2">
//               <span className="font-bold">Remaining Due:</span>
//               <span className="font-bold text-red-700">
//                 ₹
//                 {formatAmount(
//                   Math.max(0, finalAmountToPay - safeParseFloat(amountToPay))
//                 )}
//               </span>
//             </div>

//             <div className="flex justify-center pt-3">
//               <button
//                 onClick={handleBulkPay}
//                 className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 shadow-md text-sm"
//               >
//                 Process Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex justify-center mt-6">
//         <button
//           onClick={() => navigate("/indoor-sales-list")}
//           className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 text-sm"
//         >
//           Back to Sales List
//         </button>
//       </div>
//     </div>
//   );
// };

// export default IndoorBulkPayment;

// src/components/IndoorBulkPayment.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useIndoorSaleStore from "../store/useIndoorSaleStore";

const safeParseFloat = (value) => parseFloat(value || 0) || 0;
const formatAmount = (amount) =>
  typeof amount === "number" ? amount.toFixed(2) : "0.00";

const IndoorBulkPayment = () => {
  const navigate = useNavigate();
  const { indoorSales, updateIndoorSalePayment, getIndoorSaleById } = useIndoorSaleStore();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);
  const [detailedBills, setDetailedBills] = useState([]);
  const [expandedBillId, setExpandedBillId] = useState(null);

  const patientsWithDues = useMemo(() => {
    const patients = {};
    indoorSales.forEach((sale) => {
      if (sale.balanceDue > 0) {
        if (!patients[sale.patientId]) {
          patients[sale.patientId] = {
            id: sale.patientId,
            name: sale.customerName,
            totalDue: 0,
          };
        }
        patients[sale.patientId].totalDue += safeParseFloat(sale.balanceDue);
      }
    });
    return Object.values(patients);
  }, [indoorSales]);

  const unpaidBillsForPatient = useMemo(() => {
    if (!selectedPatientId) return [];
    return indoorSales.filter(
      (sale) =>
        sale.patientId === selectedPatientId &&
        safeParseFloat(sale.balanceDue) > 0
    );
  }, [indoorSales, selectedPatientId]);

  useEffect(() => {
    if (selectedPatientId) {
      const bills = unpaidBillsForPatient.map(bill => getIndoorSaleById(bill.id));
      setDetailedBills(bills.filter(Boolean));
    } else {
      setDetailedBills([]);
    }
  }, [selectedPatientId, unpaidBillsForPatient, getIndoorSaleById]);

  const totalBillsDue = useMemo(() => {
    return unpaidBillsForPatient.reduce(
      (acc, bill) => acc + safeParseFloat(bill.balanceDue),
      0
    );
  }, [unpaidBillsForPatient]);

  const { finalAmountToPay, roundOffAmount } = useMemo(() => {
    const discountFactor = 1 - safeParseFloat(bulkDiscountPercent) / 100;
    const calculated = totalBillsDue * discountFactor;
    const rounded = Math.round(calculated);
    return { finalAmountToPay: rounded, roundOffAmount: rounded - calculated };
  }, [totalBillsDue, bulkDiscountPercent]);

  useEffect(() => {
    if (selectedPatientId) setAmountToPay(finalAmountToPay);
    else setAmountToPay(0);
  }, [finalAmountToPay, selectedPatientId]);

  const handleBulkPay = () => {
    if (!selectedPatientId) return alert("Please select a patient first.");
    if (unpaidBillsForPatient.length === 0)
      return alert("Selected patient has no outstanding dues.");

    const discount = safeParseFloat(bulkDiscountPercent);
    if (discount < 0 || discount > 100)
      return alert("Discount percentage must be between 0 and 100.");

    const paymentInput = safeParseFloat(amountToPay);
    if (paymentInput > finalAmountToPay) {
      return alert(
        `Payment amount (₹${formatAmount(
          paymentInput
        )}) cannot exceed the total due amount after discount (₹${formatAmount(
          finalAmountToPay
        )}).`
      );
    }

    if (
      !window.confirm(
        `Are you sure you want to process a payment of ₹${formatAmount(
          paymentInput
        )}? Remaining due will be ₹${formatAmount(
          finalAmountToPay - paymentInput
        )}.`
      )
    )
      return;

    let remainingPayment = paymentInput;
    unpaidBillsForPatient.forEach((bill) => {
      if (remainingPayment > 0) {
        const billOriginalDue = safeParseFloat(bill.balanceDue);
        const discountAmountForThisBill = billOriginalDue * (discount / 100);
        const billDueAfterDiscount = billOriginalDue - discountAmountForThisBill;
        const amountToPayOnThisBill =
          remainingPayment >= billDueAfterDiscount
            ? billDueAfterDiscount
            : remainingPayment;

        const updatedSale = {
          ...bill,
          amountPaid: safeParseFloat(bill.amountPaid) + amountToPayOnThisBill,
          balanceDue: billDueAfterDiscount - amountToPayOnThisBill,
          isPaid: billDueAfterDiscount - amountToPayOnThisBill <= 0.01,
          bulkDiscountApplied:
            (safeParseFloat(bill.bulkDiscountApplied) || 0) +
            discountAmountForThisBill,
          bulkDiscountPercentApplied: discount,
        };
        updateIndoorSalePayment(updatedSale);
        remainingPayment -= amountToPayOnThisBill;
      }
    });

    alert("Payment successfully processed!");
    const bulkPaymentId = `BLK-${Date.now()}`;
    navigate(`/print-indoor-bulk/${bulkPaymentId}`, {
      state: {
        patient: {
          id: selectedPatientId,
          name: unpaidBillsForPatient[0].customerName,
          address: unpaidBillsForPatient[0].address,
          mobileNo: unpaidBillsForPatient[0].mobileNo,
          patientId: unpaidBillsForPatient[0].patientId,
        },
        totalBillsDue,
        finalAmountToPay,
        roundOffAmount,
        amountPaid: paymentInput,
        remainingDue: finalAmountToPay - paymentInput,
        bulkDiscountPercent,
        paidBills: unpaidBillsForPatient.map((bill) => {
          const billOriginalDue = safeParseFloat(bill.balanceDue);
          const discountAmount = billOriginalDue * (discount / 100);
          const amountPaidForThisBill =
            (billOriginalDue - discountAmount) *
            (paymentInput / finalAmountToPay);
          return {
            id: bill.id, 
            billNo: bill.billNo,
            saleDate: bill.saleDate,
            balanceDue: bill.balanceDue,
            amountPaid: amountPaidForThisBill,
          };
        }),
      },
    });
  };

  const handleBillClick = (billId) => {
    setExpandedBillId(expandedBillId === billId ? null : billId);
  };

  return (
    <div className="container mx-auto p-3 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl rounded-2xl border border-blue-200">
      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center text-indigo-800 tracking-tight">
        INDOOR BULK PAYMENT
      </h3>

      <div className="bg-white p-4 rounded-xl shadow-lg mb-4 border border-gray-200">
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Select Patient with Dues:
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => {
            setSelectedPatientId(e.target.value);
            setBulkDiscountPercent(0);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
        >
          <option value="">-- Select a Patient --</option>
          {patientsWithDues.length === 0 ? (
            <option value="" disabled>
              No patients with outstanding dues.
            </option>
          ) : (
            patientsWithDues.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.id}) - ₹{formatAmount(patient.totalDue)}
              </option>
            ))
          )}
        </select>
      </div>

      {selectedPatientId && detailedBills.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Outstanding Bills for{" "}
            <span className="text-indigo-600">
              {detailedBills[0].customerName}
            </span>
          </h3>

          {detailedBills.map((bill) => (
            <div key={bill.id} className="mb-4 p-3 border rounded-lg bg-gray-50">
              <div 
                className="flex justify-between items-center font-bold text-gray-700 cursor-pointer p-2 rounded-md hover:bg-gray-100"
                onClick={() => handleBillClick(bill.id)}
              >
                <span>Bill No: {bill.billNo}</span>
                <span>Date: {bill.saleDate}</span>
                <span>Due: ₹{formatAmount(bill.balanceDue)}</span>
                <span className="text-xl">
                  {expandedBillId === bill.id ? "▲" : "▼"}
                </span>
              </div>
              {expandedBillId === bill.id && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner mt-2">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Item Name</th>
                        <th className="px-3 py-2 text-left font-semibold">HSN</th>
                        <th className="px-3 py-2 text-left font-semibold">EXP</th>
                        <th className="px-3 py-2 text-left font-semibold">Batch</th>
                        
                        <th className="px-3 py-2 text-right font-semibold">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold">Rate</th>
                        <th className="px-3 py-2 text-right font-semibold">GST</th>
                        <th className="px-3 py-2 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bill.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-blue-50">
                          <td className="px-3 py-2">{item.nameOfItemMedicine}</td>
                          <td className="px-3 py-2">3004</td>
                          <td className="px-3 py-2">{item.expDate}</td>
                          <td className="px-3 py-2">{item.batchSrlNo}</td>
                          <td className="px-3 py-2 text-right">{item.stripQty || item.cfQty}</td>
                          <td className="px-3 py-2 text-right">₹{formatAmount(item.saleRateStrip)}</td>
                          <td className="px-3 py-2 text-right">{(item.gstIgst)}%</td>
                          <td className="px-3 py-2 text-right">₹{formatAmount(item.netAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Total Outstanding:</span>
              <span className="font-bold text-red-700">
                ₹{formatAmount(totalBillsDue)}
              </span>
            </div>

            <div>
              <label className="font-semibold mb-1 block">
                Apply Bulk Discount (%):
              </label>
              <input
                type="number"
                value={bulkDiscountPercent}
                onChange={(e) => setBulkDiscountPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Final Amount after Discount:</span>
              <span className="font-bold text-blue-700">
                ₹{formatAmount(finalAmountToPay)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold">Round Off:</span>
              <span
                className={`font-bold ${
                  roundOffAmount >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {roundOffAmount >= 0 ? "+" : "-"}₹
                {formatAmount(Math.abs(roundOffAmount))}
              </span>
            </div>

            <div>
              <label className="font-semibold mb-1 block">
                Enter Amount to Pay:
              </label>
              <input
                type="number"
                value={amountToPay}
                onChange={(e) => setAmountToPay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-bold">Remaining Due:</span>
              <span className="font-bold text-red-700">
                ₹
                {formatAmount(
                  Math.max(0, finalAmountToPay - safeParseFloat(amountToPay))
                )}
              </span>
            </div>

            <div className="flex justify-center pt-3">
              <button
                onClick={handleBulkPay}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 shadow-md text-sm"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/indoor-sales-list")}
          className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 text-sm"
        >
          Back to Sales List
        </button>
      </div>
    </div>
  );
};

export default IndoorBulkPayment;