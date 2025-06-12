import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storeServices } from '../../lib/services'; // We'll add the service function here
import Button from '../Button';
// import Textarea from '../Textarea'; // Assuming a Textarea component exists or we'll create a simple one
import Input from '../Input'; // For potential future specific field inputs

interface StoreUpdateSuggestionFormProps {
  storeId: string;
  currentStoreData: Partial<any>; // Pass current store data to prefill or compare
  onSuccess: () => void;
  onCancel: () => void;
}

// Simple Textarea component if one doesn't exist
// If you have a shared Textarea component, you can remove this.
const DefaultTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500 sm:text-sm ${props.className || ''}`}
  />
);


const StoreUpdateSuggestionForm: React.FC<StoreUpdateSuggestionFormProps> = ({
  storeId,
  currentStoreData, // We'll use this later for a more detailed form
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  // For a simple form:
  const [suggestedChangesText, setSuggestedChangesText] = useState('');
  const [reason, setReason] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to suggest updates.");
      return;
    }
    if (!suggestedChangesText.trim()) {
      setError("Please describe the suggested changes.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a more complex form, `suggested_changes` would be a JSON object.
      // For this simple version, we're sending the text as a field within the JSON.
      const payload = {
        store_id: storeId,
        user_id: user.id,
        suggested_changes: { description_of_changes: suggestedChangesText }, // Simple structure for now
        reason: reason || null,
      };
      
      await storeServices.addStoreUpdateSuggestion(payload);

      // alert('Suggestion submitted successfully! Thank you.'); // Consider replacing with a more integrated notification
      onSuccess();
    } catch (err: any) {
      console.error("Failed to submit suggestion:", err);
      setError(err.message || 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="suggestedChangesText" className="block text-sm font-medium text-gray-700 mb-1">
          Describe the update(s) you're suggesting:
        </label>
        <DefaultTextarea
          id="suggestedChangesText"
          rows={4}
          value={suggestedChangesText}
          onChange={(e) => setSuggestedChangesText(e.target.value)}
          placeholder="e.g., The phone number is incorrect, it should be 555-1234. The store is now open on Sundays from 10 AM to 4 PM."
          required
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for the suggestion (Optional):
        </label>
        <DefaultTextarea
          id="reason"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., I visited the store last week, I work there."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </div>
    </form>
  );
};

export default StoreUpdateSuggestionForm;