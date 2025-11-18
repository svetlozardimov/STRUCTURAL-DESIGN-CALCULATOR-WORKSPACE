import React from 'react';
import { priceTableData } from '../constants';
import Button from './common/Button';
import { XIcon } from './icons';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PriceTableModal: React.FC<PriceTableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Redesigned color scheme for better readability, inspired by user feedback
  const colorClasses: { [key: string]: { header: string; row: string } } = {
    blue:         { header: 'bg-blue-200 text-blue-900 dark:bg-blue-800/70 dark:text-blue-100', row: 'bg-blue-50/70 dark:bg-blue-950/30' },
    'green-light':{ header: 'bg-green-200 text-green-900 dark:bg-green-800/70 dark:text-green-100', row: 'bg-green-50/70 dark:bg-green-950/30' },
    'green-dark': { header: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-800/70 dark:text-cyan-100', row: 'bg-cyan-50/70 dark:bg-cyan-950/30' },
    yellow:       { header: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800/70 dark:text-yellow-100', row: 'bg-yellow-50/70 dark:bg-yellow-950/30' },
    pink:         { header: 'bg-pink-200 text-pink-900 dark:bg-pink-800/70 dark:text-pink-100', row: 'bg-pink-50/70 dark:bg-pink-950/30' },
    gray:         { header: 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100', row: 'bg-slate-100/70 dark:bg-slate-800/30' },
    'orange-light':{ header: 'bg-orange-200 text-orange-900 dark:bg-orange-800/70 dark:text-orange-100', row: 'bg-orange-50/70 dark:bg-orange-950/30' },
    purple:       { header: 'bg-purple-200 text-purple-900 dark:bg-purple-800/70 dark:text-purple-100', row: 'bg-purple-50/70 dark:bg-purple-950/30' },
    'blue-dark':  { header: 'bg-sky-200 text-sky-900 dark:bg-sky-800/70 dark:text-sky-100', row: 'bg-sky-50/70 dark:bg-sky-950/30' },
    'orange-dark':{ header: 'bg-amber-200 text-amber-900 dark:bg-amber-800/70 dark:text-amber-100', row: 'bg-amber-50/70 dark:bg-amber-950/30' },
    red:          { header: 'bg-red-200 text-red-900 dark:bg-red-800/70 dark:text-red-100', row: 'bg-red-50/70 dark:bg-red-950/30' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-bunker-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b dark:border-bunker-800 shrink-0">
          <h2 className="text-xl font-bold">Себестойност на проектантския труд по част "СК"</h2>
          <Button onClick={onClose} variant="secondary" className="p-2 h-auto w-auto rounded-full !shadow-none">
            <XIcon className="h-5 w-5"/>
          </Button>
        </header>
        <div className="overflow-y-auto p-4">
          <table className="w-full border-collapse text-left text-bunker-800 dark:text-bunker-200">
            <thead className="sticky top-0 bg-white dark:bg-bunker-900 z-10">
              <tr>
                <th className="p-3 w-24 font-semibold text-sm border-b-2 border-bunker-200 dark:border-bunker-700">Раздел</th>
                <th className="p-3 font-semibold text-sm border-b-2 border-bunker-200 dark:border-bunker-700">Описание</th>
                <th className="p-3 w-48 font-semibold text-sm border-b-2 border-bunker-200 dark:border-bunker-700">Минимална цена</th>
              </tr>
            </thead>
            <tbody>
              {priceTableData.map(group => (
                <React.Fragment key={group.name}>
                  <tr className={`${colorClasses[group.color].header} font-bold`}>
                    <td colSpan={3} className="p-3 text-base">{group.name}</td>
                  </tr>
                  {group.items.map((item, index) => (
                    <tr key={index} className={`${colorClasses[group.color].row} border-b border-bunker-100 dark:border-bunker-800`}>
                      <td className="p-3 align-top font-mono text-bunker-500 dark:text-bunker-400 text-xs">{item[0]}</td>
                      <td className="p-3 align-top text-sm">{item[1]}</td>
                      <td className="p-3 align-top text-sm">{item[2]}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceTableModal;
