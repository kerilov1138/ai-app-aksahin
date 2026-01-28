
export enum FoundationType {
  RADYE = 'RADYE',
  SUREKLI = 'SUREKLI'
}

export interface UnitPrices {
  concrete: number;
  iron: number;
  formworkLabor: number;
  wallLabor: number;
  ironLabor: number;
  membraneLabor: number;
}

export interface EstimationResults {
  concreteQty: number;
  ironQty: number;
  formworkQty: number;
  costs: {
    concrete: number;
    iron: number;
    formworkLabor: number;
    wallLabor: number;
    ironLabor: number;
    membraneLabor: number;
  };
  roughTotal: number;
  projectTotal: number;
  landIncludedTotal: number;
}
