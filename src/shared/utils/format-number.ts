export function formatOneDecimal(value: number): string {
  return value.toFixed(1);
}

export function formatTwoDecimals(value: number): string {
  return value.toFixed(2);
}

export function formatWholeNumber(value: number): string {
  return Math.round(value).toString();
}
