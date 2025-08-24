import React from 'react';
import useVendorStore from '../store/vendorStore';
import { Link} from 'react-router-dom';

const VendorList = () => {
    const { vendors, deleteVendor } = useVendorStore();
    // const navigate = useNavigate();

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            deleteVendor(id);
            alert('Vendor deleted successfully!');
        }
    };
    // const handleBackToVendor = () => {
    //     navigate('/');
    // };
    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-7xl mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">LIST OF TOTAL VENDOR / SUPPLIER</h2>
                {/* <button
                
                    onClick={handleBackToVendor}
                    className="px-4 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"  xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    Back To Vendor
                </button> */}
                <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    ADD/BACK VENDOR
                </Link>
                
            </div>

            {vendors.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No Vendors Found.</p>
                    <p className="text-sm text-gray-500">Click "Add Vendor/Supplier" to add new entries.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <th className="py-2 px-3 border-b">Name</th>
                                <th className="py-2 px-3 border-b">Address</th>
                                <th className="py-2 px-3 border-b">Phone No. 1</th>
                                <th className="py-2 px-3 border-b">Email ID</th>
                                <th className="py-2 px-3 border-b">GSTIN No.</th>
                                <th className="py-2 px-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50 text-sm text-gray-800">
                                    <td className="py-2 px-3 border-b">{vendor.name}</td>
                                    <td className="py-2 px-3 border-b">{`${vendor.addressLine1}, ${vendor.state} - ${vendor.pinCode}`}</td>
                                    <td className="py-2 px-3 border-b">{vendor.phoneNo1}</td>
                                    <td className="py-2 px-3 border-b">{vendor.vendorEmailID}</td>
                                    <td className="py-2 px-3 border-b">{vendor.gstinNo}</td>
                                    <td className="py-2 px-3 border-b">
                                        <Link to={`/vendors/edit/${vendor.id}`} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</Link>
                                        <button onClick={() => handleDelete(vendor.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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

export default VendorList;