import React, { useState, ChangeEvent } from 'react';
import Button from './Button';
import Input from './Input';
import { cityServices } from '../lib/services';
import { trackEvent } from '../lib/analytics';

interface CityRequestFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CityRequestForm: React.FC<CityRequestFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [cityName, setCityName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cityName || !state || !country) {
      setError('Please fill out all fields');
      onError?.('Please fill out all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await cityServices.requestCity(cityName, state, country);
      
      if (result) {
        setSuccess(true);
        setCityName('');
        setState('');
        setCountry('');
        trackEvent('city_requested', {
          city: cityName,
          state,
          country
        });
        onSuccess?.();
      } else {
        throw new Error('Failed to submit city request');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Request Your City</h2>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Thank you for your request! We'll notify you when RefillLocal becomes available in your city.</p>
          <Button 
            className="mt-4 w-full"
            onClick={() => setSuccess(false)}
          >
            Request Another City
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">
              City Name*
            </label>
            <Input
              id="cityName"
              value={cityName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCityName(e.target.value)}
              placeholder="Enter city name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province*
            </label>
            <Input
              id="state"
              value={state}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
              placeholder="Enter state or province"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country*
            </label>
            <Input
              id="country"
              value={country}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
              placeholder="Enter country"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Request City'}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Your request helps us understand demand and prioritize expansion to new cities.
          </p>
        </form>
      )}
    </div>
  );
};

export default CityRequestForm;
