
import React from 'react';
import { ThemeToggleIcon, SidebarToggleIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, isSidebarOpen, toggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-bunker-900/80 backdrop-blur-sm shadow-md dark:shadow-black/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl md:text-2xl font-bold text-bunker-800 dark:text-bunker-100 whitespace-nowrap">
            Калкулатор за себестойност на проектиране - СК
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center p-2 rounded-full text-bunker-500 dark:text-bunker-400 hover:bg-bunker-100 dark:hover:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-900 transition-colors"
              aria-label="Превключване на странична лента"
              title="Превключване на странична лента"
            >
              <SidebarToggleIcon isOpen={isSidebarOpen} className="h-6 w-6" />
            </button>
            <ThemeToggleIcon theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;