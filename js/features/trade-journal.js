/** Small in-memory journal model; persistence can be added independently later. */
export function createTradeJournal() {
  const trades = [];
  return {
    add({ pnl, note = 'Trade' }) { trades.push({ pnl: Number(pnl) || 0, note: String(note || 'Trade') }); },
    clear() { trades.length = 0; },
    list() { return trades.map(trade => ({ ...trade })); },
    stats() {
      const wins = trades.filter(t => t.pnl > 0);
      const losses = trades.filter(t => t.pnl < 0);
      const grossWin = wins.reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
      const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      return { count: trades.length, netPnl, winRate: trades.length ? wins.length / trades.length * 100 : null,
        average: trades.length ? netPnl / trades.length : null,
        profitFactor: grossLoss ? grossWin / grossLoss : (grossWin ? Infinity : null) };
    }
  };
}
