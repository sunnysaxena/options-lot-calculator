/** Pure P&L calculation, intentionally separated from the page DOM. */
export function calculateTradePnl({ entry, target, stop, lotSize, lots, charges = 0 }) {
  const quantity = Math.max(0, Math.floor(lotSize)) * Math.max(0, Math.floor(lots));
  const grossProfit = (target - entry) * quantity;
  const grossPnlAtStop = (stop - entry) * quantity;
  return {
    quantity,
    entryCost: entry * quantity,
    grossProfit,
    netProfit: grossProfit - charges,
    grossPnlAtStop,
    netPnlAtStop: grossPnlAtStop - charges,
    riskReward: entry > stop ? Math.max(0, target - entry) / (entry - stop) : null
  };
}
