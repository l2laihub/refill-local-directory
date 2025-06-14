import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StoreForm from '../components/forms/StoreForm';
import { storeServices } from '../lib/services';
import type { Store } from '../lib/types';

const AdminEditStorePage: React.FC = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const [store, setStore] = useState<Store | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!storeId) {
            navigate('/admin/stores'); // Redirect if no ID is provided
            return;
        }
        storeServices.getStoreById(storeId)
            .then(data => {
                if (!data) {
                    setError('Store not found.');
                }
                setStore(data);
            })
            .catch(err => {
                setError('Failed to fetch store details.');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [storeId, navigate]);

    const handleSubmit = async (data: any) => {
        if (!storeId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await storeServices.updateStore(storeId, data);
            navigate('/admin/stores');
        } catch (err) {
            setError('Failed to update store. Please check the details and try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Loading store details...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Edit Store</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {store && (
                    <StoreForm 
                        store={store}
                        onSubmit={handleSubmit as any} 
                        onCancel={() => navigate('/admin/stores')} 
                        isSubmitting={isSubmitting} 
                    />
                )}
            </div>
        </div>
    );
};

export default AdminEditStorePage;