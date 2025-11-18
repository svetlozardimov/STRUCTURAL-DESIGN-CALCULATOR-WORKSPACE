import { FormState, CalculationResult } from '../types';
import { constructionTypes, categoryNames } from '../constants';

export function calculate(inputs: FormState): CalculationResult {
  const log: string[] = [];
  const type = constructionTypes[inputs.projectType];

  if (!type) {
    return { currentTotal: 0, log: ["Моля, изберете вид проект."], error: false };
  }

  const area = inputs.area;
  const category = inputs.projectType.split('.')[0];
  const categoryName = categoryNames[category];
  const baseLogPrefix = categoryName ? `<b>${categoryName}</b>\n` : '';
  
  const isCraneEligible = category === 'V' || category === 'VI';
  const needsAreaForCalc = type.type === 'per_m2' || (isCraneEligible && inputs.hasCrane);

  if (needsAreaForCalc && (type.minArea || type.maxArea) && area > 0) {
    if ((type.minArea && area < type.minArea) || (type.maxArea && area > type.maxArea)) {
      return { currentTotal: 0, log: ['НЕВАЛИДНА ПЛОЩ', 'Въведената площ е извън границите за избраната категория.'], error: true };
    }
  }

  if (needsAreaForCalc && area <= 0) {
    return { currentTotal: 0, log: ['Моля, въведете площ.'], error: false };
  }

  let basePrice = 0;
  if (type.type === 'fixed') {
    basePrice = type.basePrice;
    log.push(`${baseLogPrefix}Базова цена за "${type.name}": ${basePrice.toFixed(2)} €`);
  } else if (type.type === 'per_m2') {
    basePrice = type.basePrice * area;
    log.push(`${baseLogPrefix}Цена по площ за "${type.name}": ${area} м² * ${type.basePrice.toFixed(2)} €/м² = ${basePrice.toFixed(2)} €`);
  } else if (type.type === 'retaining_wall') {
    let wallLog = '';
    basePrice = type.basePrice * inputs.wallSections;
    wallLog += `${baseLogPrefix}Цена за сечения: ${inputs.wallSections} бр. * ${type.basePrice.toFixed(2)} €/бр. = ${basePrice.toFixed(2)} €`;
    if (inputs.additionalLength > 0) {
      const lengthMultiplier = Math.floor(inputs.additionalLength / 10);
      if (lengthMultiplier > 0) {
        const lengthAddition = (type.basePrice * inputs.wallSections * 0.2) * lengthMultiplier;
        basePrice += lengthAddition;
        wallLog += `\n+ Доп. дължина (${inputs.additionalLength}м): ${lengthAddition.toFixed(2)} €`;
      }
    }
     log.push(wallLog);
  }

  let price = basePrice;
  const additionsLog: string[] = [];

  if (inputs.hasCrane && isCraneEligible) {
    const craneAddition = area * 1.0;
    price += craneAddition;
    additionsLog.push(`+ Кран: ${area} м² * 1.00 €/м² = ${craneAddition.toFixed(2)} €`);
  }

  const showCoefficients = category !== 'I' && category !== 'VII';

  if (showCoefficients) {
      if (inputs.hasComplexity && inputs.complexityPercentage > 0) {
          const priceBeforeComplexity = price;
          const complexityAddition = priceBeforeComplexity * (inputs.complexityPercentage / 100);
          price += complexityAddition;
          additionsLog.push(`+ Сложност (${inputs.complexityPercentage}% от ${priceBeforeComplexity.toFixed(2)}€): ${complexityAddition.toFixed(2)} €`);
      }

      if (inputs.isAccelerated) {
          const priceBeforeAcceleration = price;
          const accelerationAddition = priceBeforeAcceleration * 0.50;
          price += accelerationAddition;
          additionsLog.push(`+ Ускорено проектиране (50% от ${priceBeforeAcceleration.toFixed(2)}€): ${accelerationAddition.toFixed(2)} €`);
      }

      if (inputs.includeSupervision) {
          const priceBeforeSupervision = price;
          const supervisionAddition = priceBeforeSupervision * 0.15;
          price += supervisionAddition;
          additionsLog.push(`+ Авторски надзор (15% от ${priceBeforeSupervision.toFixed(2)}€): ${supervisionAddition.toFixed(2)} €`);
      }
  }
  
  if (additionsLog.length > 0) {
    log.push(`<b>Допълнителни коефициенти:</b>\n${additionsLog.join('\n')}`);
  }

  if (price !== basePrice && price > 0) {
    log.push(`<b>Крайна сума = ${price.toFixed(2)} €</b>`);
  }

  return { currentTotal: price, log: log, error: false };
}