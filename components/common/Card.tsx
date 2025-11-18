
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-bunker-900 rounded-xl shadow-md dark:shadow-2xl dark:shadow-black/20 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-b border-bunker-100 dark:border-bunker-800 ${className}`}>
      <h2 className="text-xl font-semibold text-bunker-800 dark:text-bunker-100">{children}</h2>
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
