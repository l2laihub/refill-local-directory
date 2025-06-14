import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreForm from '../components/forms/StoreForm';
import { storeServices } from '../lib/services';
import type { Store } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

const AdminAddStorePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleSubmit = async (data: any) => {
      if (!user) {
        setError("You must be logged in to add a store.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const storeData = {
                ...data,
                added_by_user_id: user.id
            };
            await storeServices.addStoreAsAdmin(storeData);
            navigate('/admin/stores'); // Redirect to the management page on success
        } catch (err) {
            setError('Failed to add store. Please check the details and try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Add New Store</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <StoreForm 
                    onSubmit={handleSubmit as any} 
                    onCancel={() => navigate('/admin/stores')} 
                    isSubmitting={isSubmitting} 
                />
            </div>
        </div>
    );
};

export default AdminAddStorePage;