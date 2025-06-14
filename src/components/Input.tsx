import type { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

const Input = ({ label, error, ...props }: InputProps) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">
        {label}
    </label>
    <input
      {...props}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

export default Input;