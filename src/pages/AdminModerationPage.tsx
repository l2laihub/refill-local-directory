import React, { useEffect, useState } from 'react';
import { storeServices } from '../lib/services';
import { Store } from '../lib/types';
import Button from '../components/Button'; // Assuming a generic Button component

// Extend Store type to potentially include city name if fetched via join
interface StoreWithCity extends Store {
  cities?: { name: string; slug: string } | null; 
}

const AdminModerationPage: React.FC = () => {
  const [stores, setStores] = useState<StoreWithCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);
    setActionMessage(null);
    try {
      const unverifiedStores = await storeServices.getUnverifiedStores();
      setStores(unverifiedStores as StoreWithCity[]); // Cast as StoreWithCity
    } catch (err) {
      console.error("Error fetching stores for moderation:", err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleApprove = async (storeId: string) => {
    setActionMessage(null);
    const originalStores = [...stores];
    setStores(stores.filter(s => s.id !== storeId)); // Optimistic update

    const success = await storeServices.approveStore(storeId);
    if (success) {
      setActionMessage(`Store ${storeId} approved successfully.`);
      // No need to re-fetch, already removed from list
    } else {
      setActionMessage(`Failed to approve store ${storeId}.`);
      setStores(originalStores); // Revert optimistic update
    }
  };

  const handleReject = async (storeId: string) => {
    setActionMessage(null);
    if (!window.confirm('Are you sure you want to reject (delete) this store submission?')) {
      return;
    }
    const originalStores = [...stores];
    setStores(stores.filter(s => s.id !== storeId)); // Optimistic update

    const success = await storeServices.rejectStore(storeId);
    if (success) {
      setActionMessage(`Store ${storeId} rejected and deleted successfully.`);
      // No need to re-fetch, already removed from list
    } else {
      setActionMessage(`Failed to reject store ${storeId}.`);
      setStores(originalStores); // Revert optimistic update
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading pending submissions...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Store Submission Moderation
        </h1>

        {actionMessage && (
          <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700 text-center">
            {actionMessage}
          </div>
        )}

        {stores.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No pending store submissions. Great job!
          </p>
        ) : (
          <div className="space-y-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white shadow-lg rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold text-sage-700 mb-2">{store.name}</h2>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>City:</strong> {store.cities?.name || store.city_id}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Address:</strong> {store.address}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Submitted:</strong> {new Date(store.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mt-2 mb-3 text-sm">
                      <strong>Description:</strong> {store.description}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-sage-600 hover:text-sage-800">More details</summary>
                      <div className="mt-2 space-y-1 bg-gray-50 p-3 rounded">
                        <p><strong>Website:</strong> {store.website_url || 'N/A'}</p>
                        <p><strong>Phone:</strong> {store.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> {store.email || 'N/A'}</p>
                        <p><strong>Hours:</strong> {typeof store.hours_of_operation === 'string' ? store.hours_of_operation : JSON.stringify(store.hours_of_operation)}</p>
                        <p><strong>What to Bring:</strong> {store.what_to_bring}</p>
                        <p><strong>Products:</strong> {store.products.join(', ')}</p>
                        <p><strong>Image URL:</strong> {store.image_url || 'N/A'}</p>
                        <p><strong>Store ID:</strong> {store.id}</p>
                      </div>
                    </details>
                  </div>
                  <div className="md:col-span-1 flex flex-col space-y-2 mt-4 md:mt-0"> {/* Simplified flex layout for buttons */}
                    <Button
                      onClick={() => handleApprove(store.id)}
                      className="w-full px-4 py-2 text-sm font-medium rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(store.id)}
                      className="w-full px-4 py-2 text-sm font-medium rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;