import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeServices } from '../lib/services';
import type { Store } from '../lib/types';
import Button from '../components/Button';

const AdminManageStoresPage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const allStores = await storeServices.getAllStoresForAdmin();
                setStores(allStores);
            } catch (err) {
                setError('Failed to fetch stores.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    if (loading) return <div>Loading stores...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Stores</h1>
                <Link to="/admin/stores/add">
                    <Button>Add New Store</Button>
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{store.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{store.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{store.is_verified ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/stores/${store.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                                    {/* Add delete functionality later */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminManageStoresPage;