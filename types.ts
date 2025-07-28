
export interface CostRow {
  id: string;
  item: string;
  description: string;
  unitPrice: number;
  quantity: number; // Represents quantity or hours
}

export interface CutListRow {
  id: string;
  length: number;
  quantity: number;
}

export interface CutList {
  description: string;
  unitPrice: number;
  rows: CutListRow[];
}

export interface ProjectDetails {
    name: string;
    date: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
}
