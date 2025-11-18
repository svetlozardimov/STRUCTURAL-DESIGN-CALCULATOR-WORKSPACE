
import React, { useMemo } from 'react';
import Card, { CardHeader, CardContent } from './common/Card';
import Select from './common/Select';
import Input from './common/Input';
import { FormState } from '../types';
import { constructionTypes, categoryNames } from '../constants';

interface MainContentProps {
  formState: FormState;
  onInputChange: (id: keyof FormState, value: string | number | boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ formState, onInputChange }) => {
  
  const projectTypeOptions = useMemo(() => {
    const grouped: { [key: string]: { key: string; name: string }[] } = {};
    for (const key in constructionTypes) {
        const category = key.split('.')[0];
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({ key, name: constructionTypes[key].name });
    }

    return Object.keys(categoryNames).map(catKey => {
        if (!grouped[catKey]) return null;
        return (
            <optgroup label={categoryNames[catKey]} key={catKey}>
                {grouped[catKey].map(type => (
                    <option key={type.key} value={type.key}>
                        {type.name}
                    </option>
                ))}
            </optgroup>
        );
    }).filter(Boolean);
  }, []);

  const selectedType = constructionTypes[formState.projectType];
  const category = formState.projectType.split('.')[0];
  const isCraneEligible = category === 'V' || category === 'VI';
  const showAreaInput = selectedType && (selectedType.type === 'per_m2' || (isCraneEligible && formState.hasCrane));
  const showFixedPriceInfo = selectedType && selectedType.type === 'fixed' && !showAreaInput;
  const showWallSections = selectedType && selectedType.type === 'retaining_wall';

  return (
    <Card>
      <CardHeader>Основни параметри</CardHeader>
      <CardContent className="space-y-6">
        <Select
          label="Вид строителен проект"
          id="projectType"
          value={formState.projectType}
          onChange={(e) => onInputChange('projectType', e.target.value)}
        >
          <option value="">-- Изберете вид проект --</option>
          {projectTypeOptions}
        </Select>

        {showAreaInput && (
          <Input
            label="Площ (м²)"
            id="area"
            type="number"
            min="0"
            placeholder="Въведете площ"
            value={formState.area > 0 ? formState.area : ''}
            onChange={(e) => onInputChange('area', e.target.valueAsNumber || 0)}
          />
        )}

        {showFixedPriceInfo && (
           <div className="w-full">
             <label htmlFor="fixedPrice" className="block text-sm font-medium text-bunker-600 dark:text-bunker-300 mb-1.5">
               Базова цена
             </label>
             <div
               id="fixedPrice"
               className="block w-full px-3 py-2 bg-bunker-100 dark:bg-bunker-800/50 border border-bunker-200 dark:border-bunker-700 rounded-md shadow-sm text-bunker-700 dark:text-bunker-300 sm:text-sm"
             >
               {selectedType.basePrice.toFixed(2)} €
             </div>
           </div>
        )}

        {showWallSections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Брой сечения"
              id="wallSections"
              type="number"
              min="1"
              value={formState.wallSections}
              onChange={(e) => onInputChange('wallSections', e.target.valueAsNumber || 1)}
            />
            <Input
              label="Доп. дължина (м)"
              id="additionalLength"
              type="number"
              min="0"
              value={formState.additionalLength > 0 ? formState.additionalLength : ''}
              onChange={(e) => onInputChange('additionalLength', e.target.valueAsNumber || 0)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MainContent;