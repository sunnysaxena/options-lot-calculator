import { byId } from '../core/dom.js';
import { formatINR, formatNumber, readNumber } from '../core/format.js';

/** Example of a genuinely independent feature module. */
export function calculateSimpleLots({ capital, premium, lotSize }) {
  const lotCost = Math.max(0, premium) * Math.max(0, Math.floor(lotSize));
  const lots = lotCost > 0 ? Math.floor(Math.max(0, capital) / lotCost) : 0;
  return { lots, quantity: lots * Math.max(0, Math.floor(lotSize)), lotCost, totalCost: lots * lotCost,
    remaining: Math.max(0, capital) - lots * lotCost };
}

// Can be enabled once the equivalent section is removed from legacy/app.js.
export function initSimpleCalculator() {
  const capital = byId('capital'), premium = byId('premium'), lotSize = byId('lotsize');
  if (!capital || !premium || !lotSize) return;
  const render = () => {
    const result = calculateSimpleLots({ capital: readNumber(capital), premium: readNumber(premium), lotSize: readNumber(lotSize) });
    byId('simpleLotCount').textContent = formatNumber(result.lots);
    byId('simpleLotWord').textContent = result.lots === 1 ? 'lot' : 'lots';
    byId('simpleQuantity').textContent = formatNumber(result.quantity);
    byId('simpleCostPerLot').textContent = formatINR(result.lotCost);
    byId('simpleTotalCost').textContent = formatINR(result.totalCost);
    byId('simpleRemaining').textContent = formatINR(result.remaining);
  };
  [capital, premium, lotSize].forEach(input => input.addEventListener('input', render));
  render();
}
