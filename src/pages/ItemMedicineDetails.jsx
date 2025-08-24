// src/components/ItemMedicineDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useItemMedicineStore from '../store/itemMedicineStore';
import useGenericStore from '../store/genericStore';
import useManufacturerStore from '../store/manufacturerStore';

const ItemMedicineDetails = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    
    const { items: allItems } = useItemMedicineStore();
    const { generics } = useGenericStore();
    const { manufacturers } = useManufacturerStore();

    const [item, setItem] = useState(null);

    const getGenericName = useCallback((idOrName) => {
        const generic = generics.find(g => g.id === idOrName || g.generic1 === idOrName);
        return generic ? generic.generic1 : idOrName || 'N/A';
    }, [generics]);

    const getManufacturerName = useCallback((idOrName) => {
        const manufacturer = manufacturers.find(m => m.id === idOrName || m.name === idOrName);
        return manufacturer ? manufacturer.name : idOrName || 'N/A';
    }, [manufacturers]);

    useEffect(() => {
        if (itemId && allItems.length > 0) {
            const foundItem = allItems.find(i => i.id === itemId);
            if (foundItem) {
                setItem(foundItem);
            } else {
                alert('Item/Medicine record not found.');
                navigate('/items');
            }
        }
    }, [itemId, allItems, navigate]);

    if (!item) {
        return <div className="text-center mt-8 text-gray-600">Loading item details...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-teal-800">ITEM / MEDICINE DETAILS</h2>
                <button
                    onClick={() => navigate('/additems-list')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    BACK TO ITEM LIST
                </button>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-teal-700 mb-4">GENERAL INFORMATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-800">
                    <div><strong className="text-gray-700">Product Type:</strong> {item.productType}</div>
                    <div><strong className="text-gray-700">Brand Name:</strong> {item.brandName}</div>
                    <div><strong className="text-gray-700">Trade Name:</strong> {item.tradeName || 'N/A'}</div>
                    <div><strong className="text-gray-700">Generic Name:</strong> {getGenericName(item.nameOfGeneric)}</div>
                    <div><strong className="text-gray-700">Manufacturer:</strong> {getManufacturerName(item.manufacturerMake)}</div>
                    <div><strong className="text-gray-700">Product Category:</strong> {item.productCategory || 'N/A'}</div>
                    <div><strong className="text-gray-700">Formulation:</strong> {item.formulation || 'N/A'}</div>
                    <div><strong className="text-gray-700">Strength:</strong> {item.strength || 'N/A'}</div>
                    <div><strong className="text-gray-700">Unit of Measure:</strong> {item.unitOfMeasure || 'N/A'}</div>
                    <div><strong className="text-gray-700">HSN Code:</strong> {item.hsnCode || 'N/A'}</div>
                    <div><strong className="text-gray-700">GST/IGST (%):</strong> {item.gstIgst || '0'}%</div>
                    <div><strong className="text-gray-700">Rack Details:</strong> {item.rackDetails || 'N/A'}</div>
                    <div><strong className="text-gray-700">Status:</strong> {item.status}</div>
                    <div><strong className="text-gray-700">Expiry Date:</strong> {item.expiryCheck || 'N/A'}</div>
                    <div><strong className="text-gray-700">C.F. Qty (cfQty):</strong> {item.cfQty || '0'}</div>
                    <div><strong className="text-gray-700">Purchase Rate (Strip):</strong> {item.purchaseRateStrip || '0'}</div>
                    <div><strong className="text-gray-700">MRP (Strip):</strong> {item.purchaseMrpStrip || '0'}</div>
                    <div><strong className="text-gray-700">Stock Alert Qty :</strong> {item.stockAlertQty || '0'}</div>
                    <div className="col-span-full"><strong className="text-gray-700">Remarks:</strong> {item.remarks || 'N/A'}</div>
                </div>
            </div>
        </div>
    );
};

export default ItemMedicineDetails;