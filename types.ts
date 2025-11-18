
export interface FormState {
  projectType: string;
  area: number;
  wallSections: number;
  additionalLength: number;
  objectName: string;
  currencyDisplay: 'eur' | 'bgn' | 'both';
  hasCrane: boolean;
  hasComplexity: boolean;
  complexityPercentage: number;
  isAccelerated: boolean;
  includeSupervision: boolean;
}

export interface CalculationResult {
  currentTotal: number;
  log: string[];
  error: boolean;
}

export type ConstructionType = {
  name: string;
  basePrice: number;
  type: 'fixed' | 'per_m2' | 'retaining_wall';
  minArea?: number;
  maxArea?: number;
};

export interface SavedProject {
  id: string;
  name: string;
  lastModified: number;
  data: FormState;
  isArchived?: boolean;
}