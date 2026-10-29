/** Pure advanced position-sizing calculation, reusable in tests and UI. */
export function calculateAdvancedLots({ capital, premium, stopPremium, lotSize, bufferPercent = 0,
  riskPercent = 1, brokeragePerOrder = 0, otherChargesPercent = 0 }) {
  const size = Math.max(0, Math.floor(lotSize));
  const usableCapital = Math.max(0, capital) * (1 - Math.min(100, Math.max(0, bufferPercent)) / 100);
  const otherRate = Math.min(10, Math.max(0, otherChargesPercent)) / 100;
  const entryValue = Math.max(0, premium) * size;
  const entryCostPerLot = entryValue + Math.max(0, brokeragePerOrder) + entryValue * otherRate;
  const roundTripCharges = Math.max(0, brokeragePerOrder) * 2 + entryValue * otherRate + Math.max(0, stopPremium) * size * otherRate;
  const riskPerLot = Math.max(0, premium - stopPremium) * size + roundTripCharges;
  const capitalLots = entryCostPerLot > 0 ? Math.floor(usableCapital / entryCostPerLot) : 0;
  const riskBudget = Math.max(0, capital) * Math.max(0, riskPercent) / 100;
  const riskLots = riskPerLot > 0 ? Math.floor(riskBudget / riskPerLot) : 0;
  const lots = Math.min(capitalLots, riskLots);
  return { lots, quantity: lots * size, usableCapital, riskBudget, riskPerLot, capitalLots, riskLots,
    estimatedEntryCost: lots * entryCostPerLot, estimatedRoundTripCharges: lots * roundTripCharges };
}
