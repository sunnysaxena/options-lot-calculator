import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSimpleLots } from '../js/features/simple-calculator.js';
import { calculateTradePnl } from '../js/features/trade-pnl.js';
import { calculateRiskLots, calculateBreakEvenPremium } from '../js/features/trading-toolkit.js';
import { calculateAdvancedLots } from '../js/features/advanced-calculator.js';

test('simple lot estimate respects capital and lot cost', () => {
  assert.deepEqual(calculateSimpleLots({ capital: 50000, premium: 100, lotSize: 65 }),
    { lots: 7, quantity: 455, lotCost: 6500, totalCost: 45500, remaining: 4500 });
});

test('trade P&L subtracts total charges', () => {
  const result = calculateTradePnl({ entry: 100, target: 130, stop: 80, lotSize: 65, lots: 1, charges: 40 });
  assert.equal(result.netProfit, 1910);
  assert.equal(result.netPnlAtStop, -1340);
  assert.equal(result.riskReward, 1.5);
});

test('risk calculator returns zero when one lot exceeds budget', () => {
  assert.equal(calculateRiskLots({ capital: 50000, riskPercent: 1, entryPremium: 100, stopPremium: 80, lotSize: 65 }).lots, 0);
});

test('break-even includes charges per unit', () => {
  assert.equal(calculateBreakEvenPremium({ entryPremium: 100, units: 65, totalCharges: 40 }), 100 + 40 / 65);
});

test('advanced calculator caps lots by the stricter limit', () => {
  const result = calculateAdvancedLots({ capital: 100000, premium: 100, stopPremium: 80, lotSize: 65,
    bufferPercent: 5, riskPercent: 1, brokeragePerOrder: 20, otherChargesPercent: 0.1 });
  assert.equal(result.lots, Math.min(result.capitalLots, result.riskLots));
});
