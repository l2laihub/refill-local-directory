import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cityServices } from '../../lib/services';
import type { Store, City } from '../../lib/types';
import Input from '../Input';
import Button from '../Button';

// Zod schema for form validation
const storeSchema = z.object({
  name: z.string().min(3, 'Name is required and must be at least 3 characters.'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required.'),
  city_id: z.string().min(1, 'City selection is required.'),
  latitude: z.number(),
  longitude: z.number(),
  website_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  what_to_bring: z.string().optional(),
  products: z.string().optional(), // Comma-separated string
  image_url: z.string().url().optional().or(z.literal('')),
  hours_of_operation: z.string().optional(),
  is_verified: z.boolean(),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface StoreFormProps {
  store?: Store;
  onSubmit: (data: StoreFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const defaultHours = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "", close: "", closed: true },
  sunday: { open: "", close: "", closed: true },
};

const StoreForm: React.FC<StoreFormProps> = ({ store, onSubmit, onCancel, isSubmitting }) => {
  const [cities, setCities] = useState<City[]>([]);
  const { control, handleSubmit, formState: { errors } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name || '',
      description: store?.description || '',
      address: store?.address || '',
      city_id: store?.city_id || '',
      latitude: store?.latitude || 0,
      longitude: store?.longitude || 0,
      website_url: store?.website_url || '',
      phone: store?.phone || '',
      email: store?.email || '',
      what_to_bring: store?.what_to_bring || '',
      products: store?.products?.join(', ') || '',
      image_url: store?.image_url || '',
      hours_of_operation: store?.hours_of_operation
        ? (typeof store.hours_of_operation === 'object' ? JSON.stringify(store.hours_of_operation, null, 2) : store.hours_of_operation)
        : JSON.stringify(defaultHours, null, 2),
      is_verified: store?.is_verified ?? true, // Default to true for admin-edited stores
    },
  });

  useEffect(() => {
    cityServices.getAllCities().then(setCities);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller name="name" control={control} render={({ field }) => (
        <Input label="Store Name" {...field} error={errors.name?.message} />
      )} />
      
      <Controller name="address" control={control} render={({ field }) => (
        <Input label="Address" {...field} error={errors.address?.message} />
      )} />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Controller name="latitude" control={control} render={({ field }) => (
          <Input label="Latitude" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} error={errors.latitude?.message} />
        )} />
        <Controller name="longitude" control={control} render={({ field }) => (
            <Input label="Longitude" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} error={errors.longitude?.message} />
        )} />
      </div>

       <Controller
        name="city_id"
        control={control}
        render={({ field }) => (
          <div>
            <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">City</label>
            <select {...field} id="city_id" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="">Select a City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.city_id && <p className="mt-2 text-sm text-red-600">{errors.city_id.message}</p>}
          </div>
        )}
      />

      <Controller name="website_url" control={control} render={({ field }) => (
        <Input label="Website URL" {...field} error={errors.website_url?.message} />
      )} />
       <Controller name="image_url" control={control} render={({ field }) => (
        <Input label="Image URL" {...field} error={errors.image_url?.message} />
      )} />

       <Controller name="products" control={control} render={({ field }) => (
        <Input label="Products (comma-separated)" {...field} error={errors.products?.message} />
      )} />

       <Controller name="hours_of_operation" control={control} render={({ field }) => (
          <div>
            <label htmlFor="hours_of_operation" className="block text-sm font-medium text-gray-700">Hours of Operation (JSON)</label>
            <textarea
              {...field}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.hours_of_operation && <p className="mt-2 text-sm text-red-600">{errors.hours_of_operation.message}</p>}
          </div>
        )} />
      
       <Controller name="is_verified" control={control} render={({ field: { onChange, onBlur, value, name, ref } }) => (
        <div className="flex items-center">
            <input
                type="checkbox"
                onChange={onChange}
                onBlur={onBlur}
                checked={value}
                name={name}
                ref={ref}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_verified" className="ml-2 block text-sm text-gray-900">Verified</label>
        </div>
      )} />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (store ? 'Updating...' : 'Adding...') : (store ? 'Update Store' : 'Add Store')}
        </Button>
      </div>
    </form>
  );
};

export default StoreForm;