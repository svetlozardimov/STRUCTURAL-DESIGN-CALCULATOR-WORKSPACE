
import React, { ReactNode } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-bunker-600 dark:text-bunker-300 mb-1.5">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="block w-full px-3 py-2 bg-white dark:bg-bunker-800 border border-bunker-300 dark:border-bunker-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
