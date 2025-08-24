import React from 'react';

const ImportedItemRow = React.memo(({ item, index, handleItemFieldChange, handleRemoveItem, inputClass, selectClass, units }) => {
    // const requiredSpan = <span className="text-red-500">*</span>;

    return (
        <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
            <td className="py-2 px-4 text-sm text-gray-800">{index + 1}</td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.nameOfItemMedicine || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'nameOfItemMedicine', e.target.value)}
                    className={`${inputClass} w-28`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.itemManufacturerMake || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'itemManufacturerMake', e.target.value)}
                    className={`${inputClass} w-28`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.batchSrlNo || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'batchSrlNo', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.expDate || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'expDate', e.target.value)}
                    className={`${inputClass} w-20`}
                    placeholder="MM/YYYY"
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.actualBillableQty || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'actualBillableQty', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.purchaseQuantity || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'purchaseQuantity', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.purchaseRate || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'purchaseRate', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.mrp || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'mrp', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <select
                    value={item.unit || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                    className={`${selectClass} w-20`}
                >
                    <option value="">N/A</option>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.freeQty || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'freeQty', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.cfQty || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'cfQty', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <select
                    value={item.cfUnit || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'cfUnit', e.target.value)}
                    className={`${selectClass} w-20`}
                >
                    <option value="">N/A</option>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.saleRate || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'saleRate', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.schDisc || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'schDisc', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.disc || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'disc', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.lastFreeQty || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'lastFreeQty', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.lastDiscount || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'lastDiscount', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.drugSchedule || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'drugSchedule', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.rackDetails || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'rackDetails', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.hsnSac || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'hsnSac', e.target.value)}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="number"
                    value={item.gstIgst || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'gstIgst', parseFloat(e.target.value) || '')}
                    className={`${inputClass} w-20`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.packaging || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'packaging', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.formulation || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'formulation', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <input
                    type="text"
                    value={item.barcode || ''}
                    onChange={(e) => handleItemFieldChange(item.id, 'barcode', e.target.value)}
                    className={`${inputClass} w-24`}
                />
            </td>
            <td className="py-2 px-4 text-sm text-gray-800">
                <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                >
                    Remove
                </button>
            </td>
        </tr>
    );
});

export default ImportedItemRow;