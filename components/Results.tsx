
import React from 'react';
import Card, { CardContent } from './common/Card';
import Button from './common/Button';
import { CalculationResult, FormState } from '../types';
import { EURO_RATE } from '../constants';
import { PrinterIcon, DownloadIcon } from './icons';

interface ResultsProps {
  result: CalculationResult;
  formState: FormState;
  onPrint: () => void;
  onExport: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, formState, onPrint, onExport }) => {
  const { currentTotal, log, error } = result;
  const { currencyDisplay, objectName } = formState;

  const formatPrice = (): string => {
    if (error) return '---';
    const totalInBgn = currentTotal * EURO_RATE;
    switch (currencyDisplay) {
      case 'bgn':
        return `${totalInBgn.toFixed(2)} лв.`;
      case 'both':
        return `${totalInBgn.toFixed(2)} лв. (${currentTotal.toFixed(2)} €)`;
      default: // eur
        return `${currentTotal.toFixed(2)} €`;
    }
  };
  
  const getHeader = (): string => {
      switch (currencyDisplay) {
        case 'bgn': return 'ОБЩО (лв. без ДДС):';
        case 'both': return 'ОБЩО (без ДДС):';
        default: return 'ОБЩО (€ без ДДС):';
      }
  }

  const formatLog = (logLines: string[]): React.ReactNode[] => {
    return logLines.map((line, index) => {
        const parts = line.split('\n').map(part => {
            let formattedPart = part;
            if (currencyDisplay === 'bgn' || currencyDisplay === 'both') {
                formattedPart = formattedPart.replace(/(\d+\.\d{2})\s*€/g, (match, eurValue) => {
                    const bgnValue = (parseFloat(eurValue) * EURO_RATE).toFixed(2);
                    return currencyDisplay === 'bgn' ? `${bgnValue} лв.` : `${bgnValue} лв. (${match})`;
                });
            }
            return <span key={Math.random()} dangerouslySetInnerHTML={{ __html: formattedPart }} />;
        });

        return <div key={index} className="whitespace-pre-wrap">{parts.map((p, i) => <React.Fragment key={i}>{p}{i < parts.length - 1 && <br />}</React.Fragment>)}</div>
    });
  };

  return (
    <Card className="bg-gradient-to-br from-bunker-50 to-bunker-100 dark:from-bunker-900 dark:to-bunker-950">
      <CardContent className="text-center space-y-4">
        {objectName && <h3 className="text-2xl font-bold text-bunker-800 dark:text-bunker-100">{objectName}</h3>}
        <h2 className="text-lg font-semibold text-bunker-600 dark:text-bunker-300">{getHeader()}</h2>
        <p className={`text-4xl md:text-5xl font-bold ${error ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
          {formatPrice()}
        </p>
        <div className="bg-white dark:bg-bunker-800/50 p-4 rounded-lg text-left font-mono text-sm text-bunker-700 dark:text-bunker-300 min-h-[120px] overflow-x-auto">
          {error ? (
            <div className="text-red-500 font-semibold flex items-center justify-center h-full">{log.join('\n')}</div>
          ) : (
            <div className="space-y-3">{formatLog(log)}</div>
          )}
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={onPrint} Icon={PrinterIcon} variant="secondary">Принтирай</Button>
          <Button onClick={onExport} Icon={DownloadIcon} variant="secondary">Експорт (.txt)</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Results;