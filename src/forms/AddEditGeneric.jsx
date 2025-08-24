import React, { useState, useEffect } from 'react';
import useGenericStore from '../store/genericStore';
import { useNavigate, useParams } from 'react-router-dom';

const AddEditGeneric = () => {
    const { genericId } = useParams(); // Get genericId from URL for editing
    const navigate = useNavigate();
    const { generics, addGeneric, updateGeneric } = useGenericStore();

    // State for form fields based on the provided image
    const [genericCode, setGenericCode] = useState('');
    const [generic1, setGeneric1] = useState(''); // Marked as required in the image
    const [generic2, setGeneric2] = useState('');
    const [generic3, setGeneric3] = useState('');
    const [generic4, setGeneric4] = useState('');
    const [generic5, setGeneric5] = useState('');
    const [nameOfGeneric, setNameOfGeneric] = useState('');
    const [classOfGeneric, setClassOfGeneric] = useState('');
    const [group, setGroup] = useState('');

    const isEditing = Boolean(genericId);

    // Effect to load generic data if in edit mode
    useEffect(() => {
        if (isEditing && generics.length > 0) {
            const genericToEdit = generics.find(g => g.id === genericId);
            if (genericToEdit) {
                setGenericCode(genericToEdit.genericCode || '');
                setGeneric1(genericToEdit.generic1 || '');
                setGeneric2(genericToEdit.generic2 || '');
                setGeneric3(genericToEdit.generic3 || '');
                setGeneric4(genericToEdit.generic4 || '');
                setGeneric5(genericToEdit.generic5 || '');
                setNameOfGeneric(genericToEdit.nameOfGeneric || '');
                setClassOfGeneric(genericToEdit.classOfGeneric || '');
                setGroup(genericToEdit.group || '');
            } else {
                alert('Generic not found for editing.');
                navigate('/generics'); // Redirect back to generic list
            }
        } else if (!isEditing) {
            // Reset fields if navigating from edit to add
            resetForm();
        }
    }, [genericId, generics, isEditing, navigate]);

    const resetForm = () => {
        setGenericCode('');
        setGeneric1('');
        setGeneric2('');
        setGeneric3('');
        setGeneric4('');
        setGeneric5('');
        setNameOfGeneric('');
        setClassOfGeneric('');
        setGroup('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation for Generic 1 as it's marked required
        if (!generic1) {
            alert('Please fill in the required field (Generic 1).');
            return;
        }

        const genericData = {
            id: isEditing ? genericId : crypto.randomUUID(), // Use existing ID if editing, new UUID if adding
            genericCode,
            generic1,
            generic2,
            generic3,
            generic4,
            generic5,
            nameOfGeneric,
            classOfGeneric,
            group,
        };

        if (isEditing) {
            updateGeneric(genericData);
            alert('Generic updated successfully!');
        } else {
            addGeneric(genericData);
            alert('Generic added successfully!');
            resetForm(); // Reset form after adding
        }

        navigate('/generic-list'); // Navigate back to generic list/dashboard after save
    };

    const handleGenericslist = () => {
        navigate('/generic-list'); // Assuming a route for listing generics
    };

    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    // Changed inputClass to match the border-style of vendor/manufacturer forms
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;

    return (
        // Adjusted width to max-w-full and removed vertical margin for "shorter" appearance
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">GENERIC INFORMATION</h2>
                {/* Generic List button, matching Vendor/Manufacturer form style */}
                <button
                    onClick={handleGenericslist}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    GENERIC LIST
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Adjusted grid to 2 columns for most fields, with some spanning 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                    {/* Generic Code */}
                    <div>
                        <label htmlFor="genericCode" className={labelClass}>Generic Code :-</label>
                        <input
                            type="text"
                            id="genericCode"
                            value={genericCode}
                            onChange={(e) => setGenericCode(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Generic 1 */}
                    <div>
                        <label htmlFor="generic1" className={labelClass}>Generic 1 :- {requiredSpan}</label>
                        <input
                            type="text"
                            id="generic1"
                            value={generic1}
                            onChange={(e) => setGeneric1(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    {/* Generic 2 */}
                    <div>
                        <label htmlFor="generic2" className={labelClass}>Generic 2 :-</label>
                        <input
                            type="text"
                            id="generic2"
                            value={generic2}
                            onChange={(e) => setGeneric2(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Generic 3 */}
                    <div>
                        <label htmlFor="generic3" className={labelClass}>Generic 3 :-</label>
                        <input
                            type="text"
                            id="generic3"
                            value={generic3}
                            onChange={(e) => setGeneric3(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Generic 4 */}
                    <div>
                        <label htmlFor="generic4" className={labelClass}>Generic 4 :-</label>
                        <input
                            type="text"
                            id="generic4"
                            value={generic4}
                            onChange={(e) => setGeneric4(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Generic 5 */}
                    <div>
                        <label htmlFor="generic5" className={labelClass}>Generic 5 :-</label>
                        <input
                            type="text"
                            id="generic5"
                            value={generic5}
                            onChange={(e) => setGeneric5(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Name of Generic */}
                    <div className="md:col-span-2"> {/* Span 2 columns for wider input */}
                        <label htmlFor="nameOfGeneric" className={labelClass}>Name of Generic :-</label>
                        <input
                            type="text"
                            id="nameOfGeneric"
                            value={nameOfGeneric}
                            onChange={(e) => setNameOfGeneric(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Class of Generic */}
                    <div className="md:col-span-2"> {/* Span 2 columns for wider input */}
                        <label htmlFor="classOfGeneric" className={labelClass}>Class of Generic :-</label>
                        <input
                            type="text"
                            id="classOfGeneric"
                            value={classOfGeneric}
                            onChange={(e) => setClassOfGeneric(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    {/* Group */}
                    <div className="md:col-span-2"> {/* Span 2 columns for wider input */}
                        <label htmlFor="group" className={labelClass}>Group :-</label>
                        <input
                            type="text"
                            id="group"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Form Actions - Matched Vendor/Manufacturer Form Button styles */}
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
                        {isEditing ? 'UPDATE GENERIC' : 'SAVE GENERIC'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditGeneric;