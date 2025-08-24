// src/components/ItemMedicineList.jsx
import React, { useState, useMemo } from 'react';
import useItemMedicineStore from '../store/itemMedicineStore';
import useGenericStore from '../store/genericStore';
import useManufacturerStore from '../store/manufacturerStore';
import { Link, useNavigate } from 'react-router-dom';

const ItemMedicineList = () => {
    const { items, bulkItems, deleteItem, clearAllItems } = useItemMedicineStore();
    const { generics } = useGenericStore();
    const { manufacturers } = useManufacturerStore();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const allCombinedItems = useMemo(() => {
        const uniqueItemIds = new Set();
        const combined = [];

        const tempCombined = [...items, ...(bulkItems || [])];

        tempCombined.forEach(item => {
            if (!uniqueItemIds.has(item.id)) {
                combined.push(item);
                uniqueItemIds.add(item.id);
            }
        });
        return combined;
    }, [items, bulkItems]);

    // Move these helper functions INSIDE the useMemo where they are used for filtering
    const filteredItems = useMemo(() => {
        // These functions now have access to 'generics' and 'manufacturers'
        // which are already dependencies of this useMemo
        const getGenericName = (id) => {
            const generic = generics.find(g => g.id === id);
            return generic ? generic.generic1 : 'N/A';
        };

        const getManufacturerName = (id) => {
            const manufacturer = manufacturers.find(m => m.id === id);
            return manufacturer ? manufacturer.name : 'N/A';
        };

        return allCombinedItems.filter(item => {
            const genericName = getGenericName(item.nameOfGeneric);
            const manufacturerName = getManufacturerName(item.manufacturerMake);
            const searchString = `${item.brandName} ${item.tradeName} ${genericName} ${manufacturerName} ${item.hsnCode} ${item.strength} ${item.gstIgst} ${item.productType} ${item.itemSubCategory || ''} ${item.expiryDate || ''}`.toLowerCase();
            return searchString.includes(searchTerm.toLowerCase());
        });
    }, [allCombinedItems, searchTerm, generics, manufacturers]); // Dependencies are correctly listed now

    // The rest of your component remains the same
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item/medicine?')) {
            deleteItem(id);
            alert('Item/Medicine deleted successfully!');
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Are you absolutely sure you want to delete ALL items/medicines? This action cannot be undone.')) {
            clearAllItems();
            alert('All items/medicines deleted successfully!');
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/items/view/${id}`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">
                    LIST OF ITEMS / MEDICINES
                    <span className="ml-4 text-teal-600 text-lg font-normal">
                        (Count: {filteredItems.length})
                    </span>
                </h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Clear All Data
                    </button>
                    <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        ADD/BACK ITEM AND MEDICINE
                    </Link>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by brand, trade, generic, manufacturer etc."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredItems.length === 0 && searchTerm === '' ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No Items/Medicines Found.</p>
                    <p className="text-sm text-gray-500">Click "Add Item / Medicine" to add new entries.</p>
                </div>
            ) : filteredItems.length === 0 && searchTerm !== '' ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No matching items/medicines found for "{searchTerm}".</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <th className="py-2 px-3 border-b">Product Type</th>
                                <th className="py-2 px-3 border-b">Brand Name</th>
                                {/* <th className="py-2 px-3 border-b">Trade Name</th> */}
                                <th className="py-2 px-3 border-b">Generic</th>
                                <th className="py-2 px-3 border-b">Manufacturer</th>
                                <th className="py-2 px-3 border-b">PRODUCT CATEGORY</th>
                                {/* <th className="py-2 px-3 border-b">Strength</th> */}
                                {/* <th className="py-2 px-3 border-b">HSN Code</th> */}
                                <th className="py-2 px-3 border-b">EXPIRY DATE</th>
                                {/* <th className="py-2 px-3 border-b">GST/IGST (%)</th>  */}
                                <th className="py-2 px-3 border-b">Status</th>
                                <th className="py-2 px-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 text-sm text-gray-800">
                                    <td className="py-2 px-3 border-b">{item.productType}</td>
                                    <td className="py-2 px-3 border-b">{item.brandName}</td>
                                    {/* <td className="py-2 px-3 border-b">{item.tradeName}</td> */}
                                    <td className="py-2 px-3 border-b">{
                                        // Use the direct find method since getGenericName/getManufacturerName are scoped to useMemo
                                        generics.find(g => g.id === item.nameOfGeneric)?.generic1 || item.nameOfGeneric ||'N/A'
                                    }</td>
                                    <td className="py-2 px-3 border-b">{
                                        manufacturers.find(m => m.id === item.manufacturerMake)?.name || item.manufacturerMake ||'N/A'
                                    }</td>
                                    <td className="py-2 px-3 border-b">{item.productCategory}</td>
                                    {/* <td className="py-2 px-3 border-b">{item.strength}</td>
                                    <td className="py-2 px-3 border-b">{item.hsnCode}</td> */}
                                    <td className="py-2 px-3 border-b">{item.expiryCheck}</td>
                                    {/* <td className="py-2 px-3 border-b">{item.gstIgst}</td> */}
                                    <td className="py-2 px-3 border-b">{item.status}</td>
                                    <td className="py-2 px-3 border-b">
                                        <button
                                            onClick={() => handleViewDetails(item.id)}
                                            className="text-green-600 hover:text-green-800 text-sm mr-3"
                                        >
                                            View
                                        </button>
                                        <Link to={`/items/edit/${item.id}`} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</Link>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ItemMedicineList;