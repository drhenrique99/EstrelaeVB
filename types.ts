export interface ProductRow {
  id: string; // Generated unique ID based on row index
  data: Record<string, string>; // Dynamic columns from CSV
  originalIndex: number;
}

export interface CartItem extends ProductRow {
  quantity: number;
}

export interface SheetData {
  headers: string[];
  rows: ProductRow[];
  priceColumnIndex: number; // -1 if not found
}
