import { CURRENCY_LOCALE, CURRENCY_CODE } from '../constants';

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove R$, espaços e caracteres invisíveis
  let cleanValue = value.replace(/[R$\s]/g, '').trim();

  // Caso comum no Brasil: 1.200,50
  if (cleanValue.includes(',') && cleanValue.includes('.')) {
    // Remove os pontos de milhar e troca vírgula por ponto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  // Caso apenas com vírgula: 1200,50 ou 50,00
  else if (cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(',', '.');
  }
  
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(value);
};
