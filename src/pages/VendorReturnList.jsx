// src/components/VendorReturnList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useVendorWiseReturnStore from "../store/vendorWiseReturnStore";

const VendorReturnList = () => {
  const navigate = useNavigate();

  const vendorReturnDocuments =
    useVendorWiseReturnStore((state) => state.vendorReturnDocuments) || [];
  const deleteReturnDocument = useVendorWiseReturnStore(
    (state) => state.deleteReturnDocument // make sure this is defined in store
  );

  const handleDelete = (documentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this return document? This action cannot be undone."
      )
    ) {
      if (deleteReturnDocument) {
        deleteReturnDocument(documentId);
        alert(`Return document ${documentId} has been deleted.`);
      } else {
        alert("Delete function not implemented in store!");
      }
    }
  };

  const handleView = (doc) => {
    navigate("/vendor-return-voucher", { state: { returnDocument: doc } });
  };

  const containerClass =
    "bg-white p-4 rounded-lg shadow-md max-w-full mx-auto my-4 border border-gray-200 text-gray-900";
  const tableContainerClass = "overflow-x-auto";
  const tableClass = "min-w-full divide-y divide-gray-200";
  const tableHeaderClass = "bg-gray-200";
  const tableCellClass =
    "px-3 py-2 whitespace-nowrap text-xs text-gray-900 align-top";
  const tableHeaderCellClass =
    "px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-teal-700">
          VENDOR RETURN LIST (GRT)
        </h2>
        <button
          onClick={() => navigate("/vendor-return")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
        >
          Back
        </button>
      </div>

      {vendorReturnDocuments.length > 0 ? (
        <div className={tableContainerClass}>
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th className={tableHeaderCellClass}>Document ID</th>
                <th className={tableHeaderCellClass}>Return Date</th>
                <th className={tableHeaderCellClass}>Vendor Name</th>
                <th className={tableHeaderCellClass}>Bill No</th>
                <th className={tableHeaderCellClass}>Bill Date</th>
                <th className={tableHeaderCellClass}>Item Name</th>
                <th className={tableHeaderCellClass}>Batch</th>
                <th className={tableHeaderCellClass}>Qty</th>
                <th className={`${tableHeaderCellClass} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorReturnDocuments.map((doc) =>
                doc.items?.map((item, idx) => (
                  <tr key={`${doc.documentId}-${idx}`}>
                    {/* Document info only once using rowSpan */}
                    {idx === 0 && (
                      <>
                        <td rowSpan={doc.items.length} className={tableCellClass}>
                          {doc.documentId}
                        </td>
                        <td rowSpan={doc.items.length} className={tableCellClass}>
                          {doc.returnDate}
                        </td>
                        <td rowSpan={doc.items.length} className={tableCellClass}>
                          {doc.vendorName}
                        </td>
                        <td rowSpan={doc.items.length} className={tableCellClass}>
                          {doc.billNo || "-"}
                        </td>
                        <td rowSpan={doc.items.length} className={tableCellClass}>
                          {doc.billDate || "-"}
                        </td>
                      </>
                    )}

                    {/* Item level info */}
                    <td className={tableCellClass}>
                      {item.nameOfItemMedicine ||
                        item.tradeName ||
                        item.nameOfGeneric ||
                        "Unnamed Item"}
                    </td>
                    <td className={tableCellClass}>{item.batchSrlNo || "-"}</td>
                    <td className={tableCellClass}>{item.returnQty || 0}</td>

                    {/* Action button only once */}
                    {idx === 0 && (
                      <td
                        rowSpan={doc.items.length}
                        className={`${tableCellClass} text-right`}
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            View
                          </button>
                          {deleteReturnDocument && (
                            <button
                              onClick={() => handleDelete(doc.documentId)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 font-semibold text-lg">
            No vendor return documents saved yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorReturnList;
