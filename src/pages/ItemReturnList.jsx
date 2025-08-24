// src/components/ItemReturnList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useReturnStore from '../store/itemwisereturnStore';

const ItemReturnList = () => {
  const navigate = useNavigate();
  const returnDocuments = useReturnStore((state) => state.returnDocuments);

  const handleView = (doc) => {
    navigate("/item-return-voucher", { state: { returnDocument: doc } });
  };

  // const handleEdit = (documentId) => {
  //   navigate(`/return-form/${documentId}`);
  // };

  const containerClass =
    "bg-white p-4 rounded-lg shadow-md max-w-full mx-auto my-4 border border-gray-200 text-gray-900";
  const tableContainerClass = "overflow-x-auto";
  const tableClass = "min-w-full divide-y divide-gray-200";
  const tableHeaderClass = "bg-gray-200";
  const tableCellClass = "px-3 py-2 whitespace-nowrap text-xs text-gray-900";
  const tableHeaderCellClass =
    "px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-2xl font-bold text-teal-700">
          PURCHASE RETURN LIST (GRT)
        </h2>
        <button
          onClick={() => navigate("/return-form")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-semibold"
        >
          Back
        </button>
      </div>

      {returnDocuments.length > 0 ? (
        <div className={tableContainerClass}>
          <table className={tableClass}>
            <thead className={tableHeaderClass}>
              <tr>
                <th className={tableHeaderCellClass}>Document ID</th>
                <th className={tableHeaderCellClass}>Return Date</th>
                <th className={tableHeaderCellClass}>Vendor Name</th>
                <th className={tableHeaderCellClass}>Item Name</th>
                <th className={tableHeaderCellClass}>Batch No.</th>
                <th className={tableHeaderCellClass}>Return Qty.</th>
                <th className={tableHeaderCellClass}>Rate</th>
                <th className={`${tableHeaderCellClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returnDocuments.map((doc) => (
                <tr key={doc.documentId}>
                  <td className={tableCellClass}>{doc.documentId}</td>
                  <td className={tableCellClass}>{doc.returnDate}</td>
                  <td className={tableCellClass}>{doc.vendorName}</td>
                  <td className={tableCellClass}>
                    {doc.items.map((item) => (
                      <div key={item.id}>
                        {item.nameOfGeneric || item.tradeName}
                      </div>
                    ))}
                  </td>
                  <td className={tableCellClass}>
                    {doc.items.map((item) => (
                      <div key={item.id}>{item.batchSrNo}</div>
                    ))}
                  </td>
                  <td className={tableCellClass}>
                    {doc.items.map((item) => (
                      <div key={item.id}>
                        {item.returnQty} {item.returnUnit}
                      </div>
                    ))}
                  </td>
                  <td className={tableCellClass}>
                    {doc.items.map((item) => (
                      <div key={item.id}>₹{item.actRate?.toFixed(2)}</div>
                    ))}
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex justify-end gap-2">
                      {/* <button
                        onClick={() => handleEdit(doc.documentId)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleView(doc)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 font-semibold text-lg">
            No return documents saved yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemReturnList;
