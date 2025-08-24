import React, { useState, useEffect } from 'react';
import useVendorStore from '../store/vendorStore'; // This remains .js
import { useNavigate, useParams } from 'react-router-dom';

const AddEditVendorSupplier = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { vendors, addVendor, updateVendor } = useVendorStore();

    // State for all form fields
    const [name, setName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [state, setState] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [phoneNo1, setPhoneNo1] = useState('');
    const [phoneNo2, setPhoneNo2] = useState('');
    const [faxNo, setFaxNo] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPersonPhoneNo, setContactPersonPhoneNo] = useState('');
    const [vendorEmailID, setVendorEmailID] = useState('');
    const [mfgLicNo, setMfgLicNo] = useState('');
    const [dlNo, setDlNo] = useState('');
    const [panNo, setPanNo] = useState('');
    const [gstinNo, setGstinNo] = useState('');
    const [creditPeriod, setCreditPeriod] = useState('');
    const [website, setWebsite] = useState('');
    const [fssaiNo, setFssaiNo] = useState('');
    const [cinNo, setCinNo] = useState('');
    const [tinNo, setTinNo] = useState('');
    const [bankAccountNo, setBankAccountNo] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [branchName, setBranchName] = useState('');
    const [remarks, setRemarks] = useState('');

    const isEditing = Boolean(vendorId);

    useEffect(() => {
        if (isEditing && vendors.length > 0) {
            const vendorToEdit = vendors.find(v => v.id === vendorId);
            if (vendorToEdit) {
                setName(vendorToEdit.name || '');
                setAddressLine1(vendorToEdit.addressLine1 || '');
                setAddressLine2(vendorToEdit.addressLine2 || '');
                setState(vendorToEdit.state || '');
                setPinCode(vendorToEdit.pinCode || '');
                setPhoneNo1(vendorToEdit.phoneNo1 || '');
                setPhoneNo2(vendorToEdit.phoneNo2 || '');
                setFaxNo(vendorToEdit.faxNo || '');
                setContactPerson(vendorToEdit.contactPerson || '');
                setContactPersonPhoneNo(vendorToEdit.contactPersonPhoneNo || '');
                setVendorEmailID(vendorToEdit.vendorEmailID || '');
                setMfgLicNo(vendorToEdit.mfgLicNo || '');
                setDlNo(vendorToEdit.dlNo || '');
                setPanNo(vendorToEdit.panNo || '');
                setGstinNo(vendorToEdit.gstinNo || '');
                setCreditPeriod(vendorToEdit.creditPeriod || '');
                setWebsite(vendorToEdit.website || '');
                setFssaiNo(vendorToEdit.fssaiNo || '');
                setCinNo(vendorToEdit.cinNo || '');
                setTinNo(vendorToEdit.tinNo || '');
                setBankAccountNo(vendorToEdit.bankAccountNo || '');
                setIfscCode(vendorToEdit.ifscCode || '');
                setBankName(vendorToEdit.bankName || '');
                setBranchName(vendorToEdit.branchName || '');
                setRemarks(vendorToEdit.remarks || '');
            } else {
                alert('Vendor not found for editing.');
                navigate('/vendors');
            }
        } else if (!isEditing) {
            resetForm();
        }
    }, [vendorId, vendors, isEditing, navigate]);

    const resetForm = () => {
        setName('');
        setAddressLine1('');
        setAddressLine2('');
        setState('');
        setPinCode('');
        setPhoneNo1('');
        setPhoneNo2('');
        setFaxNo('');
        setContactPerson('');
        setContactPersonPhoneNo('');
        setVendorEmailID('');
        setMfgLicNo('');
        setDlNo('');
        setPanNo('');
        setGstinNo('');
        setCreditPeriod('');
        setWebsite('');
        setFssaiNo('');
        setCinNo('');
        setTinNo('');
        setBankAccountNo('');
        setIfscCode('');
        setBankName('');
        setBranchName('');
        setRemarks('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !addressLine1 || !state || !pinCode || !phoneNo1) {
            alert('Please fill in all required fields (marked with *).');
            return;
        }

        const vendorData = {
            id: isEditing ? vendorId : crypto.randomUUID(),
            name,
            addressLine1,
            addressLine2,
            state,
            pinCode,
            phoneNo1,
            phoneNo2,
            faxNo,
            contactPerson,
            contactPersonPhoneNo,
            vendorEmailID,
            mfgLicNo,
            dlNo,
            panNo,
            gstinNo,
            creditPeriod: parseInt(creditPeriod) || 0,
            website,
            fssaiNo,
            cinNo,
            tinNo,
            bankAccountNo,
            ifscCode,
            bankName,
            branchName,
            remarks,
        };

        if (isEditing) {
            updateVendor(vendorData);
            alert('Vendor updated successfully!');
        } else {
            addVendor(vendorData);
            alert('Vendor added successfully!');
            resetForm();
        }

        navigate('/vendor-list');
    };

    const handleBackToVendors = () => {
        navigate('/vendor-list');
    };

    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500';
    const requiredSpan = <span className="text-red-500">*</span>;

    return (
        // Adjusted width to max-w-full and removed vertical margin for "shorter" appearance
        <div className="bg-white p-4 rounded-lg shadow-md max-w-full mx-auto border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">{isEditing ? 'EDIT VENDOR/SUPPLIER' : 'ADD NEW VENDOR/SUPPLIER'}</h2>
                {/* New button to go to Vendor List */}
                <button
                    onClick={handleBackToVendors}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    VENDOR LIST
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    {/* Basic Details */}
                    <div>
                        <label htmlFor="name" className={labelClass}>Name {requiredSpan}</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="addressLine1" className={labelClass}>Address Line 1 {requiredSpan}</label>
                        <input type="text" id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="addressLine2" className={labelClass}>Address Line 2</label>
                        <input type="text" id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="state" className={labelClass}>State {requiredSpan}</label>
                        <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="pinCode" className={labelClass}>Pin Code {requiredSpan}</label>
                        <input type="text" id="pinCode" value={pinCode} onChange={(e) => setPinCode(e.target.value)} className={inputClass} maxLength="6" required />
                    </div>
                    <div>
                        <label htmlFor="phoneNo1" className={labelClass}>Phone No. 1 {requiredSpan}</label>
                        <input type="text" id="phoneNo1" value={phoneNo1} onChange={(e) => setPhoneNo1(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="phoneNo2" className={labelClass}>Phone No. 2</label>
                        <input type="text" id="phoneNo2" value={phoneNo2} onChange={(e) => setPhoneNo2(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="faxNo" className={labelClass}>Fax No.</label>
                        <input type="text" id="faxNo" value={faxNo} onChange={(e) => setFaxNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="contactPerson" className={labelClass}>Contact Person</label>
                        <input type="text" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="contactPersonPhoneNo" className={labelClass}>Contact Person Phone No.</label>
                        <input type="text" id="contactPersonPhoneNo" value={contactPersonPhoneNo} onChange={(e) => setContactPersonPhoneNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="vendorEmailID" className={labelClass}>Vendor Email ID</label>
                        <input type="email" id="vendorEmailID" value={vendorEmailID} onChange={(e) => setVendorEmailID(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="mfgLicNo" className={labelClass}>Mfg. Lic. No.</label>
                        <input type="text" id="mfgLicNo" value={mfgLicNo} onChange={(e) => setMfgLicNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="dlNo" className={labelClass}>D.L. No.</label>
                        <input type="text" id="dlNo" value={dlNo} onChange={(e) => setDlNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="panNo" className={labelClass}>PAN No.</label>
                        <input type="text" id="panNo" value={panNo} onChange={(e) => setPanNo(e.target.value)} className={inputClass} maxLength="10" />
                    </div>
                    <div>
                        <label htmlFor="gstinNo" className={labelClass}>GSTIN No.</label>
                        <input type="text" id="gstinNo" value={gstinNo} onChange={(e) => setGstinNo(e.target.value)} className={inputClass} maxLength="15" />
                    </div>
                    <div>
                        <label htmlFor="creditPeriod" className={labelClass}>Credit Period (In Days)</label>
                        <input type="number" id="creditPeriod" value={creditPeriod} onChange={(e) => setCreditPeriod(e.target.value)} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                        <label htmlFor="website" className={labelClass}>Website</label>
                        <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://example.com" />
                    </div>
                    <div>
                        <label htmlFor="fssaiNo" className={labelClass}>FSSAI No.</label>
                        <input type="text" id="fssaiNo" value={fssaiNo} onChange={(e) => setFssaiNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="cinNo" className={labelClass}>CIN No.</label>
                        <input type="text" id="cinNo" value={cinNo} onChange={(e) => setCinNo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="tinNo" className={labelClass}>TIN No.</label>
                        <input type="text" id="tinNo" value={tinNo} onChange={(e) => setTinNo(e.target.value)} className={inputClass} />
                    </div>
                </div>

                {/* Bank Details Section */}
                <fieldset className="border border-gray-300 p-3 rounded-md mb-4">
                    <legend className="text-teal-700 font-semibold px-2">Bank Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="bankAccountNo" className={labelClass}>Account No.</label>
                            <input type="text" id="bankAccountNo" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="ifscCode" className={labelClass}>IFSC Code</label>
                            <input type="text" id="ifscCode" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="bankName" className={labelClass}>Bank Name</label>
                            <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="branchName" className={labelClass}>Branch Name</label>
                            <input type="text" id="branchName" value={branchName} onChange={(e) => setBranchName(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </fieldset>

                {/* Remarks */}
                <div className="mb-6">
                    <label htmlFor="remarks" className={labelClass}>Remarks</label>
                    <textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className={`${inputClass} h-24`} rows="3"></textarea>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center"
                    >
                        {isEditing ? 'UPDATE VENDOR' : 'SAVE VENDOR'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md flex items-center"
                    >
                        RESET
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditVendorSupplier;