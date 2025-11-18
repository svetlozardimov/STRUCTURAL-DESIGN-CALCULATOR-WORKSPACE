
import { FormState, CalculationResult, SavedProject } from '../types';
import { EURO_RATE, constructionTypes, categoryNames } from '../constants';

// Helper for timestamps
const createTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

const createFileName = (objectName: string, extension: string) => {
  const sanitizedName = (objectName.trim() || 'proekt_SK').replace(/[\s/\\?%*:|"<>]/g, '_');
  return `${createTimestamp()}_${sanitizedName}.${extension}`;
};

// --- Single Project Export ---
export const saveStateToFile = (state: FormState): void => {
  const filename = createFileName(state.objectName, 'json');
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- Workspace Export ---
export interface WorkspaceExport {
    version: number;
    name: string;
    projects: SavedProject[];
    exportedAt: number;
}

export const exportWorkspaceToFile = (name: string, projects: SavedProject[]): void => {
    const workspaceData: WorkspaceExport = {
        version: 1,
        name: name,
        projects: projects,
        exportedAt: Date.now()
    };
    
    const filename = createFileName(name || 'Workspace', 'sk_workspace'); // custom extension or json
    const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.json'; // ensure .json for ease of use
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Printing / TXT Export helpers ---
const formatPrice = (totalEur: number, currency: 'eur' | 'bgn' | 'both'): string => {
    const totalBgn = totalEur * EURO_RATE;
    switch (currency) {
        case 'bgn': return `${totalBgn.toFixed(2)} лв.`;
        case 'both': return `${totalBgn.toFixed(2)} лв. (${totalEur.toFixed(2)} €)`;
        default: return `${totalEur.toFixed(2)} €`;
    }
};

const formatLog = (log: string[], currency: 'eur' | 'bgn' | 'both', forHtml: boolean = false): string => {
    let formatted = log.join(forHtml ? '<br/><br/>' : '\n\n');
    
    if (!forHtml) {
        // For TXT export, strip HTML tags
        formatted = formatted.replace(/<br\/?>/g, '\n').replace(/<b>(.*?)<\/b>/g, '$1');
    }

    const replacer = (match: string, eurValue: string): string => {
        const bgnValue = (parseFloat(eurValue) * EURO_RATE).toFixed(2);
        if (currency === 'bgn') return `${bgnValue} лв.`;
        if (currency === 'both') return `${bgnValue} лв. (${match})`;
        return match;
    };
    
    return formatted.replace(/(\d+\.\d{2})\s*€/g, replacer);
};

export const exportToTxt = (log: string[], totalEur: number, objectName: string, currency: 'eur' | 'bgn' | 'both'): void => {
  const filename = createFileName(objectName, 'txt');
  const formattedPrice = formatPrice(totalEur, currency);
  const formattedLog = formatLog(log, currency, false);
  
  const title = "Минимална себестойност на проектиране – ЧАСТ КОНСТРУКЦИИ";
  const subtitle = `Обект: ${objectName || 'Неозаглавен обект'}`;
  const totalHeader = `ОБЩО (без ДДС):`;
  
  const fullText = `${title}\n${subtitle}\n\nНачин на изчисляване:\n${formattedLog}\n\n${totalHeader} ${formattedPrice}`;
  
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const printOffer = (formState: FormState, result: CalculationResult): void => {
    const { objectName, currencyDisplay, projectType } = formState;
    const { log, currentTotal } = result;

    const formattedPrice = formatPrice(currentTotal, currencyDisplay);
    const formattedLog = formatLog(log, currencyDisplay, true);
    const totalHeader = `ОБЩО (без ДДС):`;
    
    // --- Build Input Data HTML ---
    let inputDataHtml = '';
    const selectedType = constructionTypes[projectType];
    const categoryKey = projectType.split('.')[0];
    const categoryName = categoryNames[categoryKey];

    if (categoryName) {
        inputDataHtml += `<tr><td><strong>Категория:</strong></td><td>${categoryName}</td></tr>`;
    }
    if (selectedType) {
        inputDataHtml += `<tr><td><strong>Вид проект:</strong></td><td>${selectedType.name}</td></tr>`;
    }
    
    const showAreaInput = selectedType && (selectedType.type === 'per_m2' || (categoryKey === 'V' || categoryKey === 'VI'));

    if (showAreaInput && formState.area > 0) {
        inputDataHtml += `<tr><td><strong>Площ:</strong></td><td>${formState.area} м²</td></tr>`;
    }

    if (selectedType && selectedType.type === 'retaining_wall') {
        inputDataHtml += `<tr><td><strong>Брой сечения:</strong></td><td>${formState.wallSections} бр.</td></tr>`;
        if (formState.additionalLength > 0) {
            inputDataHtml += `<tr><td><strong>Доп. дължина:</strong></td><td>${formState.additionalLength} м</td></tr>`;
        }
    }

    const coefficients = [];
    if (formState.hasCrane && (categoryKey === 'V' || categoryKey === 'VI')) coefficients.push('Хале с кран');
    if (formState.hasComplexity) coefficients.push(`Сложна геометрия/терен (+${formState.complexityPercentage > 0 ? formState.complexityPercentage : 'по преценка'}%)`);
    if (formState.isAccelerated) coefficients.push('Ускорено проектиране (+50%)');
    if (formState.includeSupervision) coefficients.push('Авторски надзор (+15%)');

    if (coefficients.length > 0) {
        inputDataHtml += `<tr><td style="vertical-align: top;"><strong>Коефициенти:</strong></td><td>${coefficients.join('<br>')}</td></tr>`;
    }

    // --- HTML Template ---
    const printHtml = `
    <html>
      <head>
        <title>Оферта - ${objectName || 'Неозаглавен обект'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 1rem; color: #1f2937; background-color: #f9fafb; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
          .container { max-width: 800px; margin: auto; background-color: #ffffff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 1rem; margin-bottom: 2rem; }
          h1 { color: #3b82f6; margin: 0; font-size: 1.8rem; }
          h2 { font-size: 1.2rem; color: #6b7280; margin-top: 0.25rem; font-weight: normal; }
          .object-name { font-size: 1.25rem; font-weight: bold; margin-bottom: 2rem; color: #111827; }
          .section { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 2rem; overflow: hidden; }
          .section-header { background-color: #f3f4f6; padding: 0.75rem 1.25rem; font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid #e5e7eb; color: #111827; }
          .section-content { padding: 1.25rem; }
          .input-table { width: 100%; border-collapse: collapse; }
          .input-table td { padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
          .input-table tr:last-child td { border-bottom: none; }
          .input-table td:first-child { width: 35%; color: #4b5563; }
          pre { white-space: pre-wrap; font-family: 'Consolas', 'Menlo', 'Courier New', monospace; font-size: 0.9rem; background-color: #fdfdff; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 5px; line-height: 1.6; }
          .total-section { text-align: right; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 2px solid #3b82f6;}
          .total-header { font-size: 1.1rem; color: #4b5563; margin-bottom: 0.5rem; }
          .total-price { font-size: 2.2rem; font-weight: bold; color: #3b82f6; }
          @media print {
            body { margin: 0; background-color: #ffffff; }
            .container { box-shadow: none; border-radius: 0; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
            <div class="header">
                <h1>Оферта за Проектиране</h1>
                <h2>Част Конструктивна (СК)</h2>
            </div>
            
            <p class="object-name">Обект: ${objectName || 'Неозаглавен обект'}</p>

            <div class="section">
                <div class="section-header">Входни данни</div>
                <div class="section-content">
                    <table class="input-table"><tbody>${inputDataHtml}</tbody></table>
                </div>
            </div>

            <div class="section">
                <div class="section-header">Начин на изчисляване</div>
                <div class="section-content">
                    <pre>${formattedLog}</pre>
                </div>
            </div>

            <div class="total-section">
                <div class="total-header">${totalHeader}</div>
                <div class="total-price">${formattedPrice}</div>
            </div>
        </div>
      </body>
    </html>`;
  
    const win = window.open('', '', 'height=800,width=900');
    if (win) {
        win.document.write(printHtml);
        win.document.close();
        win.print();
    }
};
