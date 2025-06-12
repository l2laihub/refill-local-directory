import React, { useEffect, useState } from 'react';
import { storeServices } from '../lib/services';
import { Store, StoreUpdateSuggestion } from '../lib/types';
import Button from '../components/Button'; // Assuming a generic Button component
import { useAuth } from '../contexts/AuthContext';

// Extend Store type to potentially include city name if fetched via join
interface StoreWithCity extends Store {
  cities?: { name: string; slug: string } | null;
}

const AdminModerationPage: React.FC = () => {
  const { user: adminUser } = useAuth();
  const [stores, setStores] = useState<StoreWithCity[]>([]);
  const [storeUpdateSuggestions, setStoreUpdateSuggestions] = useState<StoreUpdateSuggestion[]>([]);
  
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  
  const [storesError, setStoresError] = useState<string | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  
  const [storeActionMessage, setStoreActionMessage] = useState<string | null>(null);
  const [suggestionActionMessage, setSuggestionActionMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    setIsLoadingStores(true);
    setStoresError(null);
    setStoreActionMessage(null);
    try {
      const unverifiedStores = await storeServices.getUnverifiedStores();
      setStores(unverifiedStores as StoreWithCity[]); // Cast as StoreWithCity
    } catch (err) {
      console.error("Error fetching stores for moderation:", err);
      setStoresError('Failed to load stores. Please try again.');
    } finally {
      setIsLoadingStores(false);
    }
  };

  const fetchStoreUpdateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    setSuggestionActionMessage(null);
    try {
      const suggestions = await storeServices.getPendingStoreUpdateSuggestions();
      setStoreUpdateSuggestions(suggestions);
    } catch (err) {
      console.error("Error fetching store update suggestions:", err);
      setSuggestionsError('Failed to load store update suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStoreUpdateSuggestions();
  }, []);

  const handleApprove = async (storeId: string) => {
    setStoreActionMessage(null);
    const originalStores = [...stores];
    setStores(stores.filter(s => s.id !== storeId)); // Optimistic update

    const success = await storeServices.approveStore(storeId);
    if (success) {
      setStoreActionMessage(`Store ${storeId} approved successfully.`);
      // No need to re-fetch, already removed from list
    } else {
      setStoreActionMessage(`Failed to approve store ${storeId}.`);
      setStores(originalStores); // Revert optimistic update
    }
  };

  const handleReject = async (storeId: string) => {
    setStoreActionMessage(null);
    if (!window.confirm('Are you sure you want to reject (delete) this store submission?')) {
      return;
    }
    const originalStores = [...stores];
    setStores(stores.filter(s => s.id !== storeId)); // Optimistic update

    const success = await storeServices.rejectStore(storeId);
    if (success) {
      setStoreActionMessage(`Store ${storeId} rejected and deleted successfully.`);
      // No need to re-fetch, already removed from list
    } else {
      setStoreActionMessage(`Failed to reject store ${storeId}.`);
      setStores(originalStores); // Revert optimistic update
    }
  };

  const handleApproveSuggestion = async (suggestionId: string) => {
    if (!adminUser?.id) {
      setSuggestionActionMessage("Admin user ID not found. Cannot approve.");
      return;
    }
    setSuggestionActionMessage(null);
    const originalSuggestions = [...storeUpdateSuggestions];
    setStoreUpdateSuggestions(storeUpdateSuggestions.filter(s => s.id !== suggestionId));

    const success = await storeServices.approveStoreUpdateSuggestion(suggestionId, adminUser.id);
    if (success) {
      setSuggestionActionMessage(`Suggestion ${suggestionId} approved.`);
    } else {
      setSuggestionActionMessage(`Failed to approve suggestion ${suggestionId}.`);
      setStoreUpdateSuggestions(originalSuggestions);
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    if (!adminUser?.id) {
      setSuggestionActionMessage("Admin user ID not found. Cannot reject.");
      return;
    }
    if (!window.confirm('Are you sure you want to reject this update suggestion?')) {
      return;
    }
    setSuggestionActionMessage(null);
    const originalSuggestions = [...storeUpdateSuggestions];
    setStoreUpdateSuggestions(storeUpdateSuggestions.filter(s => s.id !== suggestionId));

    const success = await storeServices.rejectStoreUpdateSuggestion(suggestionId, adminUser.id);
    if (success) {
      setSuggestionActionMessage(`Suggestion ${suggestionId} rejected.`);
    } else {
      setSuggestionActionMessage(`Failed to reject suggestion ${suggestionId}.`);
      setStoreUpdateSuggestions(originalSuggestions);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Store Submissions Section */}
        <section>
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Store Submission Moderation
          </h1>

          {isLoadingStores && <div className="p-4 text-center">Loading store submissions...</div>}
          {storesError && <div className="p-4 text-center text-red-500">{storesError}</div>}
          {storeActionMessage && (
            <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700 text-center">
              {storeActionMessage}
            </div>
          )}

          {!isLoadingStores && !storesError && stores.length === 0 && (
            <p className="text-center text-gray-600 text-lg">
              No pending store submissions. Great job!
            </p>
          )}

          {!isLoadingStores && !storesError && stores.length > 0 && (
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
                    <div className="md:col-span-1 flex flex-col space-y-2 mt-4 md:mt-0">
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
        </section>

        {/* Store Update Suggestions Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Store Update Suggestion Moderation
          </h2>

          {isLoadingSuggestions && <div className="p-4 text-center">Loading update suggestions...</div>}
          {suggestionsError && <div className="p-4 text-center text-red-500">{suggestionsError}</div>}
          {suggestionActionMessage && (
            <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700 text-center">
              {suggestionActionMessage}
            </div>
          )}

          {!isLoadingSuggestions && !suggestionsError && storeUpdateSuggestions.length === 0 && (
            <p className="text-center text-gray-600 text-lg">
              No pending store update suggestions.
            </p>
          )}

          {!isLoadingSuggestions && !suggestionsError && storeUpdateSuggestions.length > 0 && (
            <div className="space-y-6">
              {storeUpdateSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white shadow-lg rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-sage-700 mb-1">Suggestion for: {suggestion.store_name || 'N/A'}</h3>
                      <p className="text-sm text-gray-500 mb-1">
                        <strong>Submitted by:</strong> {suggestion.user_display_name || 'Anonymous'} (User ID: {suggestion.user_id || 'N/A'})
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Date Submitted:</strong> {new Date(suggestion.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <h4 className="text-md font-semibold text-gray-700 mb-1">Suggested Changes:</h4>
                        <pre className="text-sm whitespace-pre-wrap break-all">
                          {JSON.stringify(suggestion.suggested_changes, null, 2)}
                        </pre>
                      </div>

                      {suggestion.reason && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-md font-semibold text-gray-700 mb-1">Reason:</h4>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-1 flex flex-col space-y-2 mt-4 md:mt-0">
                      <Button
                        onClick={() => handleApproveSuggestion(suggestion.id)}
                        className="w-full px-4 py-2 text-sm font-medium rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
                      >
                        Approve Suggestion
                      </Button>
                      <Button
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                        className="w-full px-4 py-2 text-sm font-medium rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        Reject Suggestion
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminModerationPage;