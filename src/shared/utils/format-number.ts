export function formatOneDecimal(value: number): string {
  return formatDecimalNumber(value, 1);
}

export function formatTwoDecimals(value: number): string {
  return formatDecimalNumber(value, 2);
}

export function formatWholeNumber(value: number): string {
  return formatIntegerPart(Math.round(value).toString());
}

function formatDecimalNumber(value: number, decimals: number): string {
  const fixedValue = value.toFixed(decimals);
  const [integerPart, decimalPart] = fixedValue.split(".");
  const formattedInteger = formatIntegerPart(integerPart);

  return decimalPart === undefined
    ? formattedInteger
    : `${formattedInteger}.${decimalPart}`;
}

function formatIntegerPart(value: string): string {
  const sign = value.startsWith("-") ? "-" : "";
  const unsignedValue = sign ? value.slice(1) : value;

  return `${sign}${unsignedValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
}
