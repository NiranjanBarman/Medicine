import React, { useState, useEffect } from 'react';
import useManufacturerStore from '../store/manufacturerStore';
import { useNavigate, useParams } from 'react-router-dom';

const AddEditManufacturer = () => {
    const { manufacturerId } = useParams();
    const navigate = useNavigate();
    const { manufacturers, addManufacturer, updateManufacturer } = useManufacturerStore();

    // State for form fields
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const isEditing = Boolean(manufacturerId);
    
    useEffect(() => {
        if (isEditing && manufacturers.length > 0) {
            const manufacturerToEdit = manufacturers.find(m => m.id === manufacturerId);
            if (manufacturerToEdit) {
                setName(manufacturerToEdit.name || '');
                setShortName(manufacturerToEdit.shortName || '');
                setAddress(manufacturerToEdit.address || '');
                setPhone(manufacturerToEdit.phone || '');
            } else {
                alert('Manufacturer not found for editing.');
                navigate('/manufacturers');
            }
        } else if (!isEditing) {
            resetForm();
        }
    }, [manufacturerId, manufacturers, isEditing, navigate]);

    const resetForm = () => {
        setName('');
        setShortName('');
        setAddress('');
        setPhone('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !shortName) {
            alert('Please fill in all required fields (marked with *).');
            return;
        }

        const manufacturerData = {
            id: isEditing ? manufacturerId : crypto.randomUUID(),
            name,
            shortName,
            address,
            phone,
        };

        if (isEditing) {
            updateManufacturer(manufacturerData);
            alert('Manufacturer updated successfully!');
        } else {
            addManufacturer(manufacturerData);
            alert('Manufacturer added successfully!');
            resetForm();
        }

        navigate('/manufacturer-list');
    };

    const handleBackToManufacturers = () => {
        navigate('/manufacturer-list');
    };

    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    // Changed inputClass to match the border-style of vendor form
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;

    return (
        // Adjusted width to max-w-full and removed vertical margin for "shorter" appearance
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">{isEditing ? 'EDIT MANUFACTURER' : 'ADD NEW MANUFACTURER'}</h2>
                {/* Manufacturer List button, matching Vendor form style */}
                <button
                    onClick={handleBackToManufacturers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    MANUFACTURER LIST
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Adjusted grid to 2 columns, as there are only 4 fields shown.
                    Keeping the gap-x-8 and gap-y-6 for consistent spacing, but changed from 4 columns to 2. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className={labelClass}>Name {requiredSpan}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    {/* Short Name */}
                    <div>
                        <label htmlFor="shortName" className={labelClass}>Short Name {requiredSpan}</label>
                        <input
                            type="text"
                            id="shortName"
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    {/* Address */}
                    <div>
                        <label htmlFor="address" className={labelClass}>Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className={labelClass}>Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Form Actions - Matched Vendor Form Button styles */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center"
                    >
                        RESET
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
                    >
                        {isEditing ? 'UPDATE MANUFACTURER' : 'SAVE MANUFACTURER'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditManufacturer;