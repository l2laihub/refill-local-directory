import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Store, City } from '../lib/types';
import { storeServices, cityServices } from '../lib/services';

type StoreFormData = Omit<Store, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'city_id' | 'latitude' | 'longitude' | 'added_by_user_id' | 'hours_of_operation' | 'products'> & {
  cityName: string;
  latitudeStr: string;
  longitudeStr: string;
  productsStr: string;
  hours_of_operation_str: string;
};

const initialFormData: StoreFormData = {
  name: '',
  description: '',
  website_url: '',
  phone: '',
  email: '',
  address: '',
  cityName: '',
  latitudeStr: '',
  longitudeStr: '',
  hours_of_operation_str: '',
  what_to_bring: '',
  productsStr: '',
  image_url: '',
};

const AddStorePage: React.FC = () => {
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.name || !formData.description || !formData.address || !formData.cityName || !formData.productsStr) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (*).' });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Resolve City Name to City ID
      const city: City | null = await cityServices.getCityBySlug(formData.cityName.trim());
      if (!city || !city.id) {
        setMessage({ type: 'error', text: `City "${formData.cityName}" not found. Please ensure it's an existing city in our system or request it.` });
        setIsLoading(false);
        return;
      }

      // 2. Prepare Store Data
      const productsArray = formData.productsStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
      if (productsArray.length === 0) {
        setMessage({ type: 'error', text: 'Please list at least one product.' });
        setIsLoading(false);
        return;
      }
      
      const latitude = formData.latitudeStr ? parseFloat(formData.latitudeStr) : undefined;
      const longitude = formData.longitudeStr ? parseFloat(formData.longitudeStr) : undefined;

      if ((formData.latitudeStr && isNaN(latitude!)) || (formData.longitudeStr && isNaN(longitude!))) {
        setMessage({ type: 'error', text: 'Latitude and Longitude must be valid numbers.' });
        setIsLoading(false);
        return;
      }
      
      // For now, we pass hours_of_operation as a string.
      // The backend service expects Omit<Store, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'added_by_user_id'>
      // The Store type has `hours_of_operation: string | StoreHoursOfOperation;`
      // So, we need to ensure the object passed to addStore matches the expected input type.
      
      const storePayload: Omit<Store, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'added_by_user_id'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website_url: formData.website_url?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        address: formData.address.trim(),
        city_id: city.id,
        latitude: latitude!, // Asserting non-null as we'd error if string was present but unparseable
        longitude: longitude!, // Asserting non-null
        hours_of_operation: formData.hours_of_operation_str.trim(), // Sending as string
        what_to_bring: formData.what_to_bring.trim(),
        products: productsArray,
        image_url: formData.image_url?.trim() || undefined,
      };
      
      // 3. Call API to submit store data
      const newStore = await storeServices.addStore(storePayload);

      if (newStore) {
        setMessage({ type: 'success', text: 'Store submitted successfully! It will be reviewed shortly.' });
        setFormData(initialFormData); // Reset form
      } else {
        setMessage({ type: 'error', text: 'Failed to submit store. Please try again. If the city is correct, there might be a server issue.' });
      }
    } catch (error) {
      console.error("Error submitting store:", error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 sm:text-5xl">
            Add a Refill Store
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Help our community grow by adding a refill or zero-waste store you know.
            Your contribution makes a difference!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 bg-white shadow-xl rounded-2xl p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Store Name*</label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full" placeholder="e.g., The Eco Warrior"/>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500" placeholder="Tell us about this store..."></textarea>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Full Address*</label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="w-full" placeholder="123 Green St, Eco City, EC 45678"/>
          </div>

          <div>
            <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-1">City Name*</label>
            <Input type="text" name="cityName" id="cityName" value={formData.cityName} onChange={handleChange} required className="w-full" placeholder="e.g., Springfield (Must be an existing city in our system)"/>
            <p className="text-xs text-gray-500 mt-1">We'll match this to an existing city. If your city isn't listed yet, please request it first.</p>
            {/* TODO: Replace with a city dropdown/autocomplete that provides city_id */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="latitudeStr" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <Input type="text" name="latitudeStr" id="latitudeStr" value={formData.latitudeStr} onChange={handleChange} className="w-full" placeholder="e.g., 34.0522"/>
            </div>
            <div>
              <label htmlFor="longitudeStr" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <Input type="text" name="longitudeStr" id="longitudeStr" value={formData.longitudeStr} onChange={handleChange} className="w-full" placeholder="e.g., -118.2437"/>
            </div>
          </div>
          <p className="text-xs text-gray-500">Optional. Helps us map the store accurately. Find with an online tool if you know the address.</p>


          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <Input type="url" name="website_url" id="website_url" value={formData.website_url} onChange={handleChange} className="w-full" placeholder="https://www.storewebsite.com"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full" placeholder="(555) 123-4567"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full" placeholder="contact@store.com"/>
            </div>
          </div>

          <div>
            <label htmlFor="hours_of_operation_str" className="block text-sm font-medium text-gray-700 mb-1">Hours of Operation</label>
            <textarea name="hours_of_operation_str" id="hours_of_operation_str" value={formData.hours_of_operation_str} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500" placeholder="e.g., Mon-Fri: 9am-6pm, Sat: 10am-4pm, Sun: Closed"></textarea>
            {/* TODO: Implement a more structured way to input hours */}
          </div>

          <div>
            <label htmlFor="productsStr" className="block text-sm font-medium text-gray-700 mb-1">Products Available (comma-separated)*</label>
            <Input type="text" name="productsStr" id="productsStr" value={formData.productsStr} onChange={handleChange} required className="w-full" placeholder="e.g., Bulk grains, spices, soaps, cleaning supplies"/>
            {/* TODO: Improve with a tag input or multi-select */}
          </div>
          
          <div>
            <label htmlFor="what_to_bring" className="block text-sm font-medium text-gray-700 mb-1">What to Bring (e.g., container requirements)</label>
            <textarea name="what_to_bring" id="what_to_bring" value={formData.what_to_bring} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sage-500 focus:border-sage-500" placeholder="e.g., Bring your own clean containers. Some containers available for purchase."></textarea>
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Store Image URL</label>
            <Input type="url" name="image_url" id="image_url" value={formData.image_url} onChange={handleChange} className="w-full" placeholder="https://example.com/store-image.jpg"/>
            {/* TODO: Implement file upload */}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-700 transition-colors text-lg font-semibold disabled:opacity-50" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Store'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">Submissions will be reviewed before appearing on the site. Thank you for contributing!</p>
        </form>
      </div>
    </div>
  );
};

export default AddStorePage;
