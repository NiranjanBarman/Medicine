import React from 'react';
import useManufacturerStore from '../store/manufacturerStore';
import { Link} from 'react-router-dom'; // Import useNavigate

const ManufacturerList = () => {
    const { manufacturers, deleteManufacturer } = useManufacturerStore();
    // const navigate = useNavigate(); // Initialize useNavigate hook

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this manufacturer?')) {
            deleteManufacturer(id);
            alert('Manufacturer deleted successfully!');
        }
    };

    return (
        // Changed max-w-4xl to max-w-full for wider appearance, matching VendorList
        // Removed my-4 to reduce vertical margin, making it "shorter" if not needed
        <div className="bg-white p-4 rounded-lg shadow-md max-w-7xl mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                {/* Heading style remains consistent */}
                <h2 className="text-2xl font-bold text-teal-800">LIST OF MANUFACTURERS</h2>
                {/* Changed Link to ADD MANUFACTURER for clarity and consistency with VendorList */}
                <Link to="/manufacturer" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    ADD/BACK MANUFACTURER
                </Link>
            </div>

            {manufacturers.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No Manufacturers Found.</p>
                    <p className="text-sm text-gray-500">Click "Add Manufacturer" to add new entries.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead>
                            {/* Table header styles are fine */}
                            <tr className="bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <th className="py-2 px-3 border-b">Name</th>
                                <th className="py-2 px-3 border-b">Short Name</th>
                                <th className="py-2 px-3 border-b">Address</th>
                                <th className="py-2 px-3 border-b">Phone</th>
                                <th className="py-2 px-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manufacturers.map((manufacturer) => (
                                <tr key={manufacturer.id} className="hover:bg-gray-50 text-sm text-gray-800">
                                    {/* Table cell styles are fine */}
                                    <td className="py-2 px-3 border-b">{manufacturer.name}</td>
                                    <td className="py-2 px-3 border-b">{manufacturer.shortName}</td>
                                    <td className="py-2 px-3 border-b">{manufacturer.address}</td>
                                    <td className="py-2 px-3 border-b">{manufacturer.phone}</td>
                                    <td className="py-2 px-3 border-b">
                                        {/* Edit and Delete button styles are fine */}
                                        <Link to={`/manufacturers/edit/${manufacturer.id}`} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</Link>
                                        <button onClick={() => handleDelete(manufacturer.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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

export default ManufacturerList;