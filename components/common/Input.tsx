
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-bunker-600 dark:text-bunker-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full px-3 py-2 bg-white dark:bg-bunker-800 border border-bunker-300 dark:border-bunker-700 rounded-md shadow-sm placeholder-bunker-400 dark:placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
      />
    </div>
  );
};

export default Input;
