
import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-bunker-800 px-3 py-2 text-center text-sm font-normal text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-bunker-700">
        <p>{text}</p>
        <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-8 border-t-bunker-800 border-l-transparent border-b-transparent border-r-transparent dark:border-t-bunker-700" />
      </div>
    </div>
  );
};

export default Tooltip;
