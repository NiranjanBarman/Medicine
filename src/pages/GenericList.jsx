import React from 'react';
import useGenericStore from '../store/genericStore';
import { Link} from 'react-router-dom';

const GenericList = () => {
    const { generics, deleteGeneric } = useGenericStore();
    

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this generic?')) {
            deleteGeneric(id);
            alert('Generic deleted successfully!');
        }
    };
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md max-w-7xl mx-auto my-4 border border-gray-200 text-gray-900">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-teal-800">LIST OF GENERICS</h2>
                <Link to="/generic" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    ADD/BACK GENERICS
                </Link>
            </div>

            {generics.length === 0 ? (
                <div className="text-center p-6 bg-gray-50 rounded-md border border-gray-200 mt-4">
                    <p className="text-lg text-gray-600">No Generics Found.</p>
                    <p className="text-sm text-gray-500">Click "Add Generic" to add new entries.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead>
                            <tr className="bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                <th className="py-2 px-3 border-b">Generic Code</th>
                                <th className="py-2 px-3 border-b">Generic 1</th>
                                <th className="py-2 px-3 border-b">Name of Generic</th>
                                <th className="py-2 px-3 border-b">Class of Generic</th>
                                <th className="py-2 px-3 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generics.map((generic) => (
                                <tr key={generic.id} className="hover:bg-gray-50 text-sm text-gray-800">
                                    <td className="py-2 px-3 border-b">{generic.genericCode}</td>
                                    <td className="py-2 px-3 border-b">{generic.generic1}</td>
                                    <td className="py-2 px-3 border-b">{generic.nameOfGeneric}</td>
                                    <td className="py-2 px-3 border-b">{generic.classOfGeneric}</td>
                                    <td className="py-2 px-3 border-b">
                                        <Link to={`/generics/edit/${generic.id}`} className="text-blue-600 hover:text-blue-800 text-sm mr-3">Edit</Link>
                                        <button onClick={() => handleDelete(generic.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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

export default GenericList;