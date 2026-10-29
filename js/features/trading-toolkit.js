/** Pure helpers for toolkit calculators; UI wiring remains in the legacy app during migration. */
export function calculateRiskLots({ capital, riskPercent, entryPremium, stopPremium, lotSize }) {
  const budget = Math.max(0, capital) * Math.max(0, riskPercent) / 100;
  const riskPerLot = Math.max(0, entryPremium - stopPremium) * Math.max(0, Math.floor(lotSize));
  return { budget, riskPerLot, lots: riskPerLot > 0 ? Math.floor(budget / riskPerLot) : 0 };
}

export function calculateBreakEvenPremium({ entryPremium, units, totalCharges }) {
  return units > 0 ? entryPremium + totalCharges / units : null;
}
