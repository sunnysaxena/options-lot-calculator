/** Shared display formatters. Keep calculations numeric until display time. */
export const formatINR = (value, decimals = 0) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
}).format(Number.isFinite(Number(value)) ? Number(value) : 0);

export const formatNumber = (value, decimals = 0) => new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: decimals, maximumFractionDigits: decimals
}).format(Number.isFinite(Number(value)) ? Number(value) : 0);

export const readNumber = (element, fallback = 0) => {
  const value = Number(element?.value);
  return Number.isFinite(value) ? value : fallback;
};
