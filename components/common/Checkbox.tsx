
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center">
        <label htmlFor={id} className="flex items-center cursor-pointer group">
            <input
            id={id}
            type="checkbox"
            {...props}
            className="sr-only peer"
            />
            <div className="relative w-5 h-5 rounded border-2 border-bunker-300 dark:border-bunker-600 bg-white dark:bg-bunker-800 group-hover:border-bunker-400 dark:group-hover:border-bunker-500 peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 dark:peer-focus:ring-offset-bunker-950 transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600">
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        <span className="ml-3 text-sm font-medium text-bunker-700 dark:text-bunker-300">
            {label}
        </span>
        </label>
    </div>
  );
};

export default Checkbox;
