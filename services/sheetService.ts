import { SHEET_ID, PRICE_COLUMN_KEYWORDS } from '../constants';
import { SheetData, ProductRow } from '../types';

// Aceita um ID opcional e um nome de aba opcional.
export const fetchSheetData = async (customSheetId?: string, sheetName?: string): Promise<SheetData> => {
  const targetId = customSheetId || SHEET_ID;
  
  // URL padrão: exporta a primeira aba (ou a padrão) como CSV
  let csvUrl = `https://docs.google.com/spreadsheets/d/${targetId}/export?format=csv`;

  // Se um nome de aba for fornecido, usa a API de visualização (gviz) para buscar essa aba específica
  if (sheetName) {
    csvUrl = `https://docs.google.com/spreadsheets/d/${targetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Falha ao acessar a planilha. Verifique se ela é pública e se o nome da aba está correto.');
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Error fetching sheet:", error);
    throw error;
  }
};

const parseCSV = (csvText: string): SheetData => {
  const lines = csvText.split(/\r\n|\n/);
  
  // Extract Headers
  const headers = splitCSVLine(lines[0]);
  
  // Detect Price Column
  let priceColumnIndex = -1;
  headers.forEach((header, index) => {
    if (PRICE_COLUMN_KEYWORDS.some(keyword => header.toLowerCase().includes(keyword))) {
      priceColumnIndex = index;
    }
  });

  const rows: ProductRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) continue; // Skip empty lines

    const values = splitCSVLine(currentLine);
    
    // Create a map of header -> value
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index]?.trim() || '';
    });

    // Only add if there is some data
    if (Object.values(rowData).some(val => val !== '')) {
      rows.push({
        id: `row-${i}`,
        data: rowData,
        originalIndex: i
      });
    }
  }

  return { headers, rows, priceColumnIndex };
};

// Helper to handle CSV lines that might contain commas inside quotes
const splitCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let start = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      let field = line.substring(start, i);
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      result.push(field);
      start = i + 1;
    }
  }
  
  let lastField = line.substring(start);
  if (lastField.startsWith('"') && lastField.endsWith('"')) {
    lastField = lastField.slice(1, -1).replace(/""/g, '"');
  }
  result.push(lastField);

  return result;
};