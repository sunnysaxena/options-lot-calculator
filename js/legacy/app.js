// Main application logic extracted from the original single-file app.
// Keep existing behavior stable here; new features can be moved into feature modules.
(function () {
  const ids = ['index', 'capital', 'premium', 'stoploss', 'lotsize', 'buffer', 'riskPct', 'brokerage', 'otherPct'];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const num = id => Number(el[id].value);
  const app = document.getElementById('app');
  const simpleMode = document.getElementById('simpleMode');
  const advancedMode = document.getElementById('advancedMode');
  const pnlMode = document.getElementById('pnlMode');
  const toolkitMode = document.getElementById('toolkitMode');
  const appearanceDefaults = {primary:'#1457d9',header:'#102344',background:'#f3f6fb',text:'#172033'};
  const appearanceInputs = {primary:document.getElementById('colorPrimary'),header:document.getElementById('colorHeader'),background:document.getElementById('colorBackground'),text:document.getElementById('colorText')};
  function applyAppearance(colors) {
    const root=document.documentElement;
    const dark=colors.background.toLowerCase()==='#0b1118';
    root.style.setProperty('--site-primary',colors.primary);
    root.style.setProperty('--site-secondary',colors.header);
    root.style.setProperty('--site-background',colors.background);
    root.style.setProperty('--site-on-background',colors.text);
    root.style.setProperty('--text',colors.text);
    root.style.setProperty('--surface',dark?'#17212d':'#ffffff');
    root.style.setProperty('--surface-soft',dark?'#202d3b':'#f7f9fd');
    root.style.setProperty('--muted',dark?'#c0ccda':'#65728a');
    root.style.setProperty('--border',dark?'#526174':'#dce3ef');
    root.style.setProperty('--good',dark?'#72edb5':'#087f5b');
    root.style.setProperty('--bad',dark?'#ffaaa3':'#b42318');
    root.style.setProperty('--site-on-primary',dark?'#07130f':'#ffffff');
    root.style.setProperty('--site-on-secondary',dark?'#f4f8ff':'#ffffff');
    Object.keys(appearanceInputs).forEach(k=>appearanceInputs[k].value=colors[k]);
  }
  Object.entries(appearanceInputs).forEach(([key,input])=>input.addEventListener('input',()=>{const colors=Object.fromEntries(Object.entries(appearanceInputs).map(([k,v])=>[k,v.value]));applyAppearance(colors);try{localStorage.setItem('optionsCalculatorAppearance',JSON.stringify(colors));}catch(e){}}));
  const themes={blue:appearanceDefaults,green:{primary:'#16805d',header:'#12382f',background:'#f1f8f4',text:'#172b25'},purple:{primary:'#7047d1',header:'#2d2050',background:'#f6f3fc',text:'#241d35'},dark:{primary:'#42d392',header:'#101a24',background:'#0b1118',text:'#e7f0fa'}};
  document.querySelectorAll('[data-theme]').forEach(btn=>btn.addEventListener('click',()=>{applyAppearance(themes[btn.dataset.theme]);try{localStorage.setItem('optionsCalculatorAppearance',JSON.stringify(themes[btn.dataset.theme]));}catch(e){}}));
  document.getElementById('resetAppearance').addEventListener('click',()=>{applyAppearance(appearanceDefaults);try{localStorage.removeItem('optionsCalculatorAppearance');}catch(e){}});
  try{const saved=JSON.parse(localStorage.getItem('optionsCalculatorAppearance')||'null');if(saved&&Object.keys(appearanceDefaults).every(k=>/^#[0-9a-f]{6}$/i.test(saved[k]||'')))applyAppearance(saved);}catch(e){}
  const modeDescription = document.getElementById('modeDescription');
  function setMode(mode) {
    const simple = mode === 'simple';
    const pnl = mode === 'pnl';
    const toolkit = mode === 'toolkit';
    app.classList.toggle('simple-mode', simple);
    app.classList.toggle('pnl-mode', pnl);
    app.classList.toggle('toolkit-mode', toolkit);
    simpleMode.setAttribute('aria-pressed', String(simple));
    advancedMode.setAttribute('aria-pressed', String(mode === 'advanced'));
    pnlMode.setAttribute('aria-pressed', String(pnl));
    toolkitMode.setAttribute('aria-pressed', String(toolkit));
    modeDescription.textContent = simple ? 'Quickly estimate how many option lots fit your available capital, using premium and units per lot.' : pnl ? 'Calculate potential profit at your target and loss at your stop-loss for a long option position.' : toolkit ? 'Access 12 additional trading calculators from one menu, including risk, exits, charges and performance tracking.' : 'Estimate lots using both buying power and a stop-loss risk budget, with simplified transaction-cost assumptions.';
    document.getElementById('inputDescription').textContent = simple ? 'Choose an index, enter your capital and option premium, and check the selected lot size.' : pnl ? 'Use the dedicated trade P&L fields to enter entry, target, stop-loss, lot size and lots.' : toolkit ? 'Use the Trading Toolkit tab to open the additional calculators.' : 'Choose an index, enter the option premium and stop-loss premium, and adjust the cost assumptions to your broker.';
  }
  simpleMode.addEventListener('click', () => setMode('simple'));
  advancedMode.addEventListener('click', () => setMode('advanced'));
  pnlMode.addEventListener('click', () => setMode('pnl'));
  toolkitMode.addEventListener('click', () => setMode('toolkit'));
  const presets = { NIFTY: 65, BANKNIFTY: 30, MIDCPNIFTY: 120, FINNIFTY: 60, SENSEX: 20 };
  const helpContent = {
    capital: { title: 'Available capital', body: '<p>The total rupee amount you have set aside for this trade. The calculator uses it to estimate how many lots you can afford and to calculate your risk budget.</p><div class="example"><strong>Example:</strong> ₹50,000 available capital with a 1% risk budget gives a risk limit of ₹500 per trade.</div>' },
    premium: { title: 'Option premium', body: '<p>Enter the current premium per option unit, not the cost of a whole lot. Approximate lot cost is premium × units per lot, plus estimated charges.</p><div class="example"><strong>Example:</strong> ₹100 premium × 65 units = ₹6,500 before charges for one lot.</div>' },
    stoploss: { title: 'Stop-loss premium', body: '<p>Enter the option premium at which you plan to exit if the trade moves against you. It should be below your entry premium for a long option trade. Real execution can be worse due to slippage or gaps.</p><div class="example"><strong>Example:</strong> Entry ₹100 and stop ₹80 means a planned ₹20 loss per unit, before charges.</div>' },
    lotsize: { title: 'Units per lot', body: '<p>The number of option units in one exchange contract lot for the selected index. This is editable because lot sizes can change; verify the current exchange contract specification before trading.</p><div class="example"><strong>Example:</strong> If the lot size is 65 and you buy 2 lots, your position contains 130 units.</div>' },
    buffer: { title: 'Capital kept aside (%)', body: '<p>This percentage is reserved instead of being used to buy the option. It leaves a cash cushion for charges, slippage, or other unexpected costs. It reduces the capital available for the position, but does not change the risk-budget calculation.</p><div class="example"><strong>Example:</strong> With ₹50,000 capital and a 5% buffer, ₹2,500 is kept aside and ₹47,500 is available for the estimated entry cost.</div>' },
    riskPct: { title: 'Risk budget per trade (%)', body: '<p>This is the maximum planned loss you are willing to accept on one trade, expressed as a percentage of your total available capital. The calculator estimates the loss from entry premium to stop-loss premium, plus simplified round-trip charges, and limits the lot count accordingly. It is a planning limit, not a guarantee of maximum loss.</p><div class="example"><strong>Example:</strong> ₹50,000 capital × 1% = ₹500 risk budget. If the estimated risk is ₹200 per lot, the risk limit allows 2 lots (₹400 estimated risk), not 3.</div>' },
    brokerage: { title: 'Brokerage per order', body: '<p>Enter the brokerage your broker charges for one order. The estimate applies this amount once for entry and once for exit. Check your broker’s pricing plan; actual charges may vary by order and segment.</p><div class="example"><strong>Example:</strong> ₹20 per order is estimated as ₹40 for a completed entry-and-exit trade.</div>' },
    otherPct: { title: 'Other charges estimate (%)', body: '<p>A simplified allowance for transaction costs beyond brokerage. Actual charges can include STT, exchange transaction charges, GST, SEBI charges, stamp duty and other applicable fees. This calculator does not reproduce an exact broker contract note.</p><div class="example"><strong>Example:</strong> 0.10% of a ₹6,500 entry value is ₹6.50 for the entry-side estimate; exit-side charges are estimated separately.</div>' }
  };
  const helpBackdrop = document.getElementById('helpBackdrop');
  const helpTitle = document.getElementById('helpTitle');
  const helpBody = document.getElementById('helpBody');
  const helpClose = document.getElementById('helpClose');
  let lastHelpTrigger = null;
  function closeHelp() { helpBackdrop.classList.remove('open'); if (lastHelpTrigger) lastHelpTrigger.focus(); }
  function addContextualHelp() {
    const areas = [document.querySelector('.pnl-inputs'), document.querySelector('.toolkit-inputs'), document.getElementById('journalPanel')];
    areas.forEach(area => area.querySelectorAll('label[for]').forEach(label => {
      if (label.querySelector('.help-btn')) return;
      const targetId = label.htmlFor;
      const target = document.getElementById(targetId);
      if (!target) return;
      const row = document.createElement('div');
      row.className = 'label-row';
      label.parentNode.insertBefore(row, label);
      row.appendChild(label);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'help-btn';
      btn.dataset.contextHelp = targetId;
      btn.setAttribute('aria-label', 'Help: ' + label.textContent.trim());
      btn.title = 'Explain this field';
      btn.textContent = '?';
      row.appendChild(btn);
    }));
  }
  function contextualHelpContent(key, btn) {
    const known = {
      pnlIndex: ['Index', 'Select the index whose option contract you are planning to trade. The index name does not fetch live prices or guarantee that the entered lot size is current.'],
      pnlEntry: ['Entry premium', 'Enter the option premium per unit at which you expect to buy. The calculator uses this as the starting price for profit, loss and position value.'],
      pnlTarget: ['Target premium', 'Enter the premium per unit where you plan to exit in profit. For a long option trade, the target should normally be above the entry premium.'],
      pnlStop: ['Stop-loss premium', 'Enter the premium per unit where you plan to exit to limit a loss. For a long option trade, keep it below entry; slippage can make the actual loss larger.'],
      pnlLotSize: ['Units per lot', 'Enter the number of option units in one contract lot. Check the latest exchange contract specification because lot sizes can change.'],
      pnlLots: ['Number of lots', 'Enter how many lots you plan to buy. Total quantity equals units per lot multiplied by number of lots.'],
      pnlCharges: ['Estimated total charges', 'Enter your estimated combined charges for the complete entry-and-exit trade. Net target and stop outcomes subtract this amount; actual broker charges may differ.'],
      toolType: ['Choose calculator', 'Choose the calculation you want to use. The input fields and their meanings change with the selected calculator. Outputs are estimates and are not trading signals.'],
      journalResult: ['Trade net P&L', 'Enter the completed trade result after charges. Positive values represent profits and negative values represent losses; this feeds the session statistics.'],
      journalName: ['Trade note', 'Add a short label to help identify the trade in your session journal. Avoid entering passwords or other sensitive account information.']
    };
    if (key === 'toolType') {
      const calculatorHelp = {
        risk: ['Risk-based position sizing', 'Estimates how many lots fit your planned risk budget using entry premium, stop-loss premium and units per lot. It does not include every trading cost, and a stop may execute at a worse price.', '₹50,000 capital × 1% risk = ₹500 budget. Entry ₹100, stop ₹80 and 65 units mean ₹1,300 planned risk per lot before charges, so the budget allows 0 lots.'],
        breakeven: ['Break-even premium', 'Calculates the option premium needed to cover your entry premium and the total charges you entered. It also estimates P&L at the current premium.', 'Entry ₹100, 65 units and ₹40 total charges gives break-even premium ₹100 + (₹40 ÷ 65) = about ₹100.62.'],
        trailing: ['Trailing stop-loss', 'Suggests a stop level from the highest premium reached minus your trailing distance. It is a planning reference only and does not place or update a broker order.', 'Entry ₹100, highest premium ₹140 and trailing distance ₹15 gives a proposed stop of ₹125.'],
        rr: ['Risk-to-reward', 'Compares the planned loss between entry and stop with the potential gain at your target. Review charges too; a favourable ratio does not guarantee a winning trade.', 'Entry ₹100, target ₹130 and stop ₹80 gives ₹30 potential reward versus ₹20 risk per unit, or a gross ratio of 1:1.5.'],
        daily: ['Daily profit & loss limits', 'Tracks your entered daily net P&L against a loss limit, profit target and maximum trade count. It is a discipline aid and does not monitor or block broker trades.', 'Daily loss limit ₹1,500 and current net P&L −₹900 means ₹600 remains before the entered loss limit is reached.'],
        journal: ['Trade journal & statistics', 'Records completed trades you add during this page session and summarizes net P&L, win rate, average trade and profit factor. Entries are not saved after the page session ends.', 'Trades of +₹500, +₹300 and −₹200 produce net P&L +₹600, a 66.7% win rate and ₹200 average P&L per trade.'],
        charges: ['Brokerage & charges estimate', 'Estimates brokerage for entry and exit orders plus an allowance for other charges, based on your entered values. It is not an exact broker contract note.', '₹20 brokerage per order for one completed trade means ₹40 estimated brokerage for entry and exit, before other charges.'],
        partial: ['Partial exit calculator', 'Estimates realized P&L for the units you plan to exit and shows how many units would remain open. Charges allocation is simplified.', 'Buy 130 units at ₹100, sell 65 at ₹125 and allocate ₹40 charges: gross P&L ₹1,625; estimated net P&L ₹1,585, with 65 units remaining.'],
        average: ['Averaging calculator', 'Calculates the weighted average premium after an additional purchase and estimates P&L at the current premium. Averaging increases exposure and can increase losses.', 'Buy 65 units at ₹100 and another 65 at ₹80. The weighted average premium becomes ₹90 across 130 units.'],
        compound: ['Compounding calculator', 'Projects how a balance could grow over multiple periods if the same return and contributions repeat. Actual returns vary and can be negative; this is not a forecast.', '₹50,000 growing by an assumed 2% per period for 3 periods, with no additions, projects to about ₹53,060. This is illustrative, not a forecast.'],
        recovery: ['Loss recovery calculator', 'Shows the gain percentage needed on the reduced balance to return to the starting capital after a loss. Recovery figures are mathematical illustrations, not a reason to take extra risk.', 'A ₹10,000 loss on ₹50,000 leaves ₹40,000. Returning to ₹50,000 requires a 25% gain on the remaining ₹40,000.'],
        movement: ['Premium percentage movement', 'Measures the percentage change from entry premium to current premium and estimates gross P&L for your entered quantity, excluding charges and slippage.', 'Premium rises from ₹100 to ₹125: change is +25%. For 65 units, gross P&L is ₹25 × 65 = ₹1,625 before charges.']
      };
      const description = calculatorHelp[document.getElementById('toolType').value];
      if (description) return {title: description[0], body: '<p>' + description[1] + '</p><div class="example"><strong>' + (description[2] ? 'Example:' : 'Tip:') + '</strong> ' + (description[2] || 'Choose another calculator from the menu and click ? again to read its description.') + '</div>'};
    }
    if (known[key]) return {title: known[key][0], body: '<p>' + known[key][1] + '</p>'};
    const label = document.querySelector('label[for="' + key + '"]');
    const fieldName = label ? label.textContent.trim() : key;
    const toolName = document.getElementById('toolOutputTitle').textContent;
    const input = document.getElementById(key);
    const value = input ? input.value : '';
    let explanation = 'Enter the value that matches your trade plan. This field is used by the selected calculator to estimate its output; confirm the units and assumptions before relying on the result.';
    if (/premium|price|high|stop|target|distance/i.test(fieldName)) explanation = 'Enter a premium or price per option unit in rupees, using the definition shown in this field label. The selected calculator uses it to estimate the planned price movement, risk or reward. For a long option buy, a stop is generally below entry and a profit target above entry.';
    else if (/capital|amount|loss limit|profit target|charges|value/i.test(fieldName)) explanation = 'Enter the rupee amount relevant to this calculation. Use your own capital, limit or cost estimate; charges and actual execution can differ from these simplified estimates.';
    else if (/%|return|rate|risk/i.test(fieldName)) explanation = 'Enter a percentage as a number, not a decimal fraction. For example, type 1 for 1%. This is a planning assumption, not a guaranteed return or maximum loss.';
    else if (/units|quantity|lots|trades|periods/i.test(fieldName)) explanation = 'Enter a whole-number quantity or count appropriate to this field. Check that it matches your actual position or the number of trades/periods you want to model.';
    return {title: fieldName, body: '<p><strong>Calculator:</strong> ' + toolName + '</p><p>' + explanation + '</p><div class="example"><strong>Current value:</strong> ' + (value === '' ? 'not entered' : value) + '<br>Change it to match your own assumptions. Results are estimates only.</div>'};
  }
  addContextualHelp();
  document.addEventListener('click', event => {
    const btn = event.target.closest('[data-help], [data-context-help]');
    if (!btn) return;
    const content = helpContent[btn.dataset.help];
    const selectedContent = btn.dataset.contextHelp ? contextualHelpContent(btn.dataset.contextHelp, btn) : content;
    if (!selectedContent) return;
    lastHelpTrigger = btn;
    helpTitle.textContent = selectedContent.title;
    helpBody.innerHTML = selectedContent.body;
    helpBackdrop.classList.add('open');
    helpClose.focus();
  });
  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', event => { if (event.target === helpBackdrop) closeHelp(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && helpBackdrop.classList.contains('open')) closeHelp(); });
  function calculate() {
    const capital = Math.max(0, num('capital') || 0);
    const premium = Math.max(0, num('premium') || 0);
    const stop = Math.max(0, num('stoploss') || 0);
    const lotSize = Math.max(0, Math.floor(num('lotsize') || 0));
    const buffer = Math.min(100, Math.max(0, num('buffer') || 0));
    const riskPct = Math.min(100, Math.max(0, num('riskPct') || 0));
    const brokerage = Math.max(0, num('brokerage') || 0);
    const otherPct = Math.min(10, Math.max(0, num('otherPct') || 0)) / 100;
    const usable = capital * (1 - buffer / 100);
    const entryPerLot = premium * lotSize;
    const entryOtherPerLot = entryPerLot * otherPct;
    const entryCostPerLot = entryPerLot + brokerage + entryOtherPerLot;
    const roundTripChargesPerLot = brokerage * 2 + entryOtherPerLot + stop * lotSize * otherPct;
    const riskPerLot = Math.max(0, premium - stop) * lotSize + roundTripChargesPerLot;
    const capitalLots = entryCostPerLot > 0 ? Math.floor(usable / entryCostPerLot) : 0;
    const simpleCostPerLot = premium * lotSize;
    const simpleLots = simpleCostPerLot > 0 ? Math.floor(capital / simpleCostPerLot) : 0;
    const simpleCost = simpleLots * simpleCostPerLot;
    document.getElementById('simpleLotCount').textContent = simpleLots.toLocaleString('en-IN');
    document.getElementById('simpleLotWord').textContent = simpleLots === 1 ? 'lot' : 'lots';
    document.getElementById('simpleQuantity').textContent = (simpleLots * lotSize).toLocaleString('en-IN');
    document.getElementById('simpleCostPerLot').textContent = fmt(simpleCostPerLot);
    document.getElementById('simpleTotalCost').textContent = fmt(simpleCost);
    document.getElementById('simpleRemaining').textContent = fmt(capital - simpleCost);
    const simpleStatus = document.getElementById('simpleStatus');
    if (premium <= 0 || lotSize <= 0) simpleStatus.innerHTML = '<strong>Check your inputs.</strong> Enter a positive premium and valid units per lot.';
    else if (simpleLots === 0) simpleStatus.innerHTML = '<strong>Not enough capital for one lot.</strong> Reduce the premium or add more capital to fit a lot.';
    else simpleStatus.innerHTML = '<strong>Simple estimate calculated.</strong> Charges, slippage and stop-loss risk are not included.';
    const riskBudget = capital * riskPct / 100;
    const riskLots = riskPerLot > 0 ? Math.floor(riskBudget / riskPerLot) : 0;
    const lots = Math.min(capitalLots, riskLots);
    const quantity = lots * lotSize;
    const cost = lots * entryCostPerLot;
    const charges = lots * roundTripChargesPerLot;
    const riskAmount = lots * riskPerLot;
    const remaining = capital - cost;
    const usedPercent = usable > 0 ? Math.min(100, cost / usable * 100) : 0;
    document.getElementById('lotCount').textContent = lots.toLocaleString('en-IN');
    document.getElementById('lotWord').textContent = lots === 1 ? 'lot' : 'lots';
    document.getElementById('quantity').textContent = quantity.toLocaleString('en-IN');
    document.getElementById('costPerLot').textContent = fmt(entryCostPerLot);
    document.getElementById('capitalLots').textContent = capitalLots.toLocaleString('en-IN');
    document.getElementById('riskLots').textContent = riskLots.toLocaleString('en-IN');
    document.getElementById('usableCapital').textContent = fmt(usable);
    document.getElementById('totalCost').textContent = fmt(cost);
    document.getElementById('charges').textContent = fmt(charges);
    document.getElementById('riskAmount').textContent = fmt(riskAmount);
    document.getElementById('riskBudget').textContent = fmt(riskBudget);
    document.getElementById('remaining').textContent = fmt(remaining);
    document.getElementById('barFill').style.width = usedPercent + '%';
    document.getElementById('usedLabel').textContent = Math.round(usedPercent) + '% of usable capital used';
    document.getElementById('budgetLabel').textContent = 'Budget ' + fmt(capital);
    const status = document.getElementById('status');
    if (premium <= 0 || lotSize <= 0 || stop >= premium) {
      status.innerHTML = '<strong>Check your inputs.</strong> Enter a positive entry premium, a valid lot size, and a stop-loss premium below entry.';
    } else if (lots === 0) {
      status.innerHTML = '<strong>No lot fits both limits.</strong> ' + (riskLots === 0 && capitalLots > 0 ? 'Capital can afford ' + capitalLots.toLocaleString('en-IN') + ' lot(s), but your risk budget of ' + fmt(riskBudget) + ' is below the estimated risk of ' + fmt(riskPerLot) + ' for one lot. Increase the risk budget only if it fits your plan, reduce the position risk, or use a smaller lot size.' : 'Your available capital after the buffer or your stop-loss risk budget is too small for one lot with these assumptions.');
    } else if (riskLots < capitalLots) {
      status.innerHTML = '<strong>Risk budget is the limiting factor.</strong> The lot count is capped by your stop-loss risk setting.';
    } else {
      status.innerHTML = '<strong>Capital budget is the limiting factor.</strong> The selected lot count fits the estimated entry cost and risk budget.';
    }
  }
  const pnlIds = ['pnlEntry','pnlTarget','pnlStop','pnlLotSize','pnlLots','pnlCharges'];
  const pnlEl = Object.fromEntries(pnlIds.map(id => [id, document.getElementById(id)]));
  const pnlIndex = document.getElementById('pnlIndex');
  pnlIndex.addEventListener('change', () => { pnlEl.pnlLotSize.value = presets[pnlIndex.value] || 65; calculatePnl(); });
  el.index.addEventListener('change', () => { el.lotsize.value = presets[el.index.value] || 65; pnlIndex.value = el.index.value; pnlEl.pnlLotSize.value = presets[el.index.value] || 65; calculate(); calculatePnl(); });
  const precise = n => '₹' + n.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
  function calculatePnl() {
    const entry = Math.max(0, Number(pnlEl.pnlEntry.value) || 0);
    const target = Math.max(0, Number(pnlEl.pnlTarget.value) || 0);
    const stop = Math.max(0, Number(pnlEl.pnlStop.value) || 0);
    const size = Math.max(0, Math.floor(Number(pnlEl.pnlLotSize.value) || 0));
    const lots = Math.max(0, Math.floor(Number(pnlEl.pnlLots.value) || 0));
    const charges = Math.max(0, Number(pnlEl.pnlCharges.value) || 0);
    const qty = size * lots;
    const cost = entry * qty;
    const grossProfit = (target - entry) * qty;
    const grossLoss = (stop - entry) * qty;
    const netProfit = grossProfit - charges;
    const netLoss = grossLoss - charges;
    const risk = Math.max(0, entry - stop) * qty;
    const reward = Math.max(0, target - entry) * qty;
    document.getElementById('pnlTargetProfit').textContent = precise(netProfit);
    document.getElementById('pnlTargetProfit').className = 'big ' + (netProfit >= 0 ? 'pnl-positive' : 'pnl-negative');
    document.getElementById('pnlTargetNote').textContent = netProfit >= 0 ? 'Estimated net profit if the target is reached.' : 'Estimated net result after charges; this target does not cover the estimated charges.';
    document.getElementById('pnlQuantity').textContent = qty.toLocaleString('en-IN') + ' units';
    document.getElementById('pnlEntryCost').textContent = precise(cost);
    document.getElementById('pnlGrossProfit').textContent = (grossProfit < 0 ? '−' : '') + precise(Math.abs(grossProfit));
    document.getElementById('pnlNetProfit').textContent = (netProfit < 0 ? '−' : '') + precise(Math.abs(netProfit));
    document.getElementById('pnlGrossLoss').textContent = (grossLoss > 0 ? '+' : '−') + precise(Math.abs(grossLoss));
    document.getElementById('pnlNetLoss').textContent = (netLoss > 0 ? '+' : '−') + precise(Math.abs(netLoss));
    document.getElementById('pnlRR').textContent = risk > 0 ? '1 : ' + (reward / risk).toFixed(2) : 'N/A';
    document.getElementById('pnlReturn').textContent = cost > 0 ? ((netProfit / cost) * 100).toFixed(2) + '%' : 'N/A';
    const status = document.getElementById('pnlStatus');
    if (entry <= 0 || size <= 0 || lots <= 0 || target <= entry || stop >= entry) {
      status.innerHTML = '<strong>Check your inputs.</strong> For a long option buy, entry must be positive, target above entry, stop-loss below entry, and lot size/lots at least 1.';
    } else {
      status.innerHTML = '<strong>Estimate calculated.</strong> Net figures subtract the entered total charges. Stop-loss fills can slip and actual losses may be larger.';
    }
  }
  pnlIds.forEach(id => pnlEl[id].addEventListener('input', calculatePnl));
  document.querySelectorAll('[data-pnl-preset]').forEach(btn => btn.addEventListener('click', () => {
    const entry = Math.max(0, Number(pnlEl.pnlEntry.value) || 0);
    const preset = btn.dataset.pnlPreset;
    const settings = { conservative: [1.20, 0.90], balanced: [1.30, 0.80], wide: [1.50, 0.75] }[preset];
    pnlEl.pnlTarget.value = (entry * settings[0]).toFixed(2);
    pnlEl.pnlStop.value = (entry * settings[1]).toFixed(2);
    calculatePnl();
  }));
  pnlEl.pnlLotSize.addEventListener('change', () => { if (Number(pnlEl.pnlLotSize.value) > 0) calculatePnl(); });
  ids.filter(id => id !== 'index').forEach(id => el[id].addEventListener('input', calculate));
  document.querySelectorAll('[data-premium]').forEach(btn => btn.addEventListener('click', () => { el.premium.value = btn.dataset.premium; calculate(); }));
  const toolDefs = {
    risk:{title:'Risk-based position sizing',labels:['Available capital (₹)','Risk per trade (%)','Entry premium (₹)','Stop-loss premium (₹)','Units per lot'],values:[50000,1,100,80,65],main:'Maximum lots by planned risk',run:v=>{const budget=v[0]*v[1]/100,per=Math.max(0,v[2]-v[3])*v[4],lots=per>0?Math.floor(budget/per):0;return [lots+' lots','Planned risk budget: '+precise(budget),[['Risk budget',precise(budget)],['Risk per lot before charges',precise(per)],['Position quantity',String(lots*Math.max(0,Math.floor(v[4])))+' units'],['Estimated premium cost',precise(lots*Math.max(0,v[2])*Math.max(0,v[4]))]],'Risk is planned, not guaranteed; slippage can increase losses.'];}},
    breakeven:{title:'Break-even premium',labels:['Entry premium (₹)','Total charges (₹)','Units held','Current premium (₹)','Reserved field'],values:[100,40,65,100,0],main:'Break-even premium',run:v=>{const q=Math.max(0,v[2]),be=q>0?v[0]+v[1]/q:0,pnl=(v[3]-v[0])*q-v[1];return [precise(be),'Premium needed to cover entry premium plus entered total charges.',[['Entry value',precise(v[0]*q)],['Charges per unit',precise(q?v[1]/q:0)],['P&L at current premium',precise(pnl)],['Move to break even',precise(be-v[3])]],'Assumes charges are entered as a total for the complete trade.'];}},
    trailing:{title:'Trailing stop-loss',labels:['Entry premium (₹)','Highest premium reached (₹)','Trailing distance (₹)','Units held','Current stop (₹)'],values:[100,140,15,65,0],main:'Proposed trailing stop',run:v=>{const stop=Math.max(v[0],v[1]-Math.max(0,v[2])),q=Math.max(0,v[3]);return [precise(stop),'Stop level is calculated from the highest premium minus trailing distance, never below entry.',[['Entry-to-stop buffer',precise(stop-v[0])],['Planned P&L at stop',precise((stop-v[0])*q)],['Premium high-water mark',precise(v[1])],['Trailing distance',precise(v[2])]],'This is a manual planning level; it does not place or move a broker order.'];}},
    rr:{title:'Risk-to-reward calculator',labels:['Entry premium (₹)','Target premium (₹)','Stop-loss premium (₹)','Units held','Total charges (₹)'],values:[100,130,80,65,40],main:'Risk : reward',run:v=>{const risk=Math.max(0,v[0]-v[2])*v[3],reward=Math.max(0,v[1]-v[0])*v[3],netR=reward-v[4],netRisk=risk+v[4];return [risk>0?'1 : '+(reward/risk).toFixed(2):'N/A','Compares planned gross reward with planned gross risk.',[['Gross risk',precise(risk)],['Gross reward',precise(reward)],['Net target outcome',precise(netR)],['Net stop outcome',precise(-netRisk)]],'A favourable ratio does not guarantee that a trade will win.'];}},
    daily:{title:'Daily profit & loss limits',labels:['Daily loss limit (₹)','Daily profit target (₹)','Current net P&L (₹)','Trades taken today','Maximum trades'],values:[1500,2500,0,0,5],main:'Daily trading status',run:v=>{const loss=Math.max(0,v[0]+Math.min(0,v[2])),target=Math.max(0,v[1]-Math.max(0,v[2]));return [v[2]<=-Math.abs(v[0])?'Loss limit reached':v[2]>=v[1]?'Profit target reached':v[3]>=v[4]?'Trade count limit reached':'Within entered limits','Status based on the current P&L and limits entered.',[['Remaining loss allowance',precise(loss)],['Profit target remaining',precise(target)],['Trades remaining',String(Math.max(0,Math.floor(v[4]-v[3])))],['Current net P&L',precise(v[2])]],'Use this as a discipline aid; it does not block trades or monitor your broker.'];}},
    journal:{title:'Trade journal & statistics',labels:['','','','',''],values:[0,0,0,0,0],main:'Session journal statistics',run:()=>['Add trades below','Record each completed trade net of charges.',[],'Journal entries are held only in this open page session.']},
    charges:{title:'Brokerage & charges estimate',labels:['Entry value (₹)','Exit value (₹)','Brokerage per order (₹)','Other charges rate (%)','Number of completed trades'],values:[6500,7800,20,0.1,1],main:'Estimated total charges',run:v=>{const other=(v[0]+v[1])*Math.max(0,v[3])/100,total=Math.max(0,v[2])*2*Math.max(0,v[4])+other;return [precise(total),'Simplified estimate for the number of completed round trips.',[['Estimated brokerage',precise(Math.max(0,v[2])*2*Math.max(0,v[4]))],['Other charges allowance',precise(other)],['Entry plus exit value',precise(v[0]+v[1])],['Total completed trades',String(Math.max(0,v[4]))]],'Not a broker contract note; applicable taxes and charges can differ.'];}},
    partial:{title:'Partial exit calculator',labels:['Entry premium (₹)','Exit premium (₹)','Total units held','Units to exit','Total charges (₹)'],values:[100,125,130,65,40],main:'Realised P&L on partial exit',run:v=>{const q=Math.min(Math.max(0,v[2]),Math.max(0,v[3])),p=(v[1]-v[0])*q-v[4];return [precise(p),'Estimate for the quantity exited only, less entered charges.',[['Units exited',String(q)],['Units remaining',String(Math.max(0,v[2]-q))],['Gross realised P&L',precise((v[1]-v[0])*q)],['Net realised P&L',precise(p)]],'Charges allocation is simplified; include only charges attributable to this exit if tracking partial trades.'];}},
    average:{title:'Averaging calculator',labels:['First quantity (units)','First buy price (₹)','Added quantity (units)','Added buy price (₹)','Current premium (₹)'],values:[65,100,65,80,90],main:'New average premium',run:v=>{const q=Math.max(0,v[0])+Math.max(0,v[2]),cost=Math.max(0,v[0])*v[1]+Math.max(0,v[2])*v[3],avg=q?cost/q:0;return [precise(avg),'Weighted average entry price after the additional purchase.',[['Total quantity',String(q)],['Total premium cost',precise(cost)],['P&L at current premium',precise((v[4]-avg)*q)],['Capital committed',precise(cost)]],'Adding to a losing option position increases exposure and may increase losses.'];}},
    compound:{title:'Compounding calculator',labels:['Starting capital (₹)','Return per period (%)','Number of periods','Contribution per period (₹)','Reserved field'],values:[50000,2,12,0,0],main:'Projected ending balance',run:v=>{let total=Math.max(0,v[0]);const rate=v[1]/100,n=Math.max(0,Math.min(600,Math.floor(v[2]))),con=Math.max(0,v[3]);for(let i=0;i<n;i++)total=total*(1+rate)+con;return [precise(total),'Illustrative projection assuming the same return each period.',[['Starting capital',precise(v[0])],['Net projected change',precise(total-v[0]-con*n)],['Added contributions',precise(con*n)],['Periods modelled',String(n)]],'Returns are not guaranteed; actual trading results vary and can be negative.'];}},
    recovery:{title:'Loss recovery calculator',labels:['Starting capital (₹)','Loss amount (₹)','Expected recovery return (%)','Reserved field','Reserved field'],values:[50000,10000,5,0,0],main:'Gain needed to recover loss',run:v=>{const base=Math.max(0,v[0]-v[1]),pct=v[0]>0?v[1]/v[0]*100:0,need=base>0?v[1]/base*100:Infinity;return [Number.isFinite(need)?need.toFixed(2)+'%':'N/A','Percentage gain required on the reduced balance to return to starting capital.',[['Capital after loss',precise(base)],['Loss as % of starting capital',pct.toFixed(2)+'%'],['Recovery gain required',precise(v[1])],['Periods at entered return',v[2]>0&&base>0?String(Math.ceil(Math.log(v[0]/base)/Math.log(1+v[2]/100))):'N/A']], 'Recovery is a mathematical illustration, not a forecast or a reason to increase risk.'];}},
    movement:{title:'Premium percentage movement',labels:['Entry premium (₹)','Current premium (₹)','Units held','Reserved field','Reserved field'],values:[100,125,65,0,0],main:'Premium change',run:v=>{const pct=v[0]>0?(v[1]-v[0])/v[0]*100:0,change=(v[1]-v[0])*v[2];return [pct.toFixed(2)+'%', 'Percentage change from entry premium to current premium.',[['Premium change per unit',precise(v[1]-v[0])],['Gross P&L for entered units',precise(change)],['Entry value',precise(v[0]*v[2])],['Current value',precise(v[1]*v[2])]],'Excludes charges, slippage and any change in position quantity.'];}}
  };
  const toolType=document.getElementById('toolType'),toolInputs=[1,2,3,4,5].map(i=>document.getElementById('tool'+i)),journalPanel=document.getElementById('journalPanel');
  const toolDefaults={};Object.keys(toolDefs).forEach(k=>toolDefaults[k]=toolDefs[k].values.slice());
  function renderToolFields(){const d=toolDefs[toolType.value];d.labels.forEach((label,i)=>{document.getElementById('toolLabel'+(i+1)).textContent=label||'Not used for this calculator';toolInputs[i].parentElement.style.display=label?'flex':'none';toolInputs[i].value=d.values[i]??0;});document.getElementById('toolOutputTitle').textContent=d.title;document.getElementById('toolMainLabel').textContent=d.main;journalPanel.style.display=toolType.value==='journal'?'block':'none';document.getElementById('toolFields').style.display=toolType.value==='journal'?'none':'grid';document.getElementById('toolCalculate').style.display=toolType.value==='journal'?'none':'inline-block';document.getElementById('toolReset').style.display=toolType.value==='journal'?'none':'inline-block';calculateTool();}
  function calculateTool(){const d=toolDefs[toolType.value],v=toolInputs.map(x=>Number(x.value)||0);const out=d.run(v);document.getElementById('toolMainValue').textContent=out[0];document.getElementById('toolMainNote').textContent=out[1];document.getElementById('toolStats').innerHTML=(out[2]||[]).map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');document.getElementById('toolStatus').textContent=out[3]||'Estimate calculated.';}
  toolType.addEventListener('change',renderToolFields);toolInputs.forEach(x=>x.addEventListener('input',calculateTool));document.getElementById('toolCalculate').addEventListener('click',calculateTool);document.getElementById('toolReset').addEventListener('click',()=>{toolInputs.forEach((x,i)=>x.value=toolDefaults[toolType.value][i]??0);calculateTool();});
  const journal=[];function renderJournal(){const wins=journal.filter(x=>x.pnl>0),losses=journal.filter(x=>x.pnl<0),total=journal.reduce((s,x)=>s+x.pnl,0),grossWin=wins.reduce((s,x)=>s+x.pnl,0),grossLoss=Math.abs(losses.reduce((s,x)=>s+x.pnl,0));document.getElementById('journalStats').innerHTML=[['Trades recorded',journal.length],['Win rate',journal.length?(wins.length/journal.length*100).toFixed(1)+'%':'N/A'],['Net P&L',precise(total)],['Average trade',journal.length?precise(total/journal.length):'N/A'],['Profit factor',grossLoss>0?(grossWin/grossLoss).toFixed(2):grossWin>0?'∞':'N/A']].map(x=>'<div class="stat"><span>'+x[0]+'</span><strong>'+x[1]+'</strong></div>').join('');document.getElementById('journalRows').innerHTML=journal.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+x.note.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</td><td>'+precise(x.pnl)+'</td></tr>').join('');}
  document.getElementById('journalAdd').addEventListener('click',()=>{journal.push({pnl:Number(document.getElementById('journalResult').value)||0,note:document.getElementById('journalName').value||'Trade'});renderJournal();document.getElementById('journalName').value='';});document.getElementById('journalClear').addEventListener('click',()=>{journal.length=0;renderJournal();});
  renderToolFields();renderJournal();
  setMode('simple');
  calculate();
  calculatePnl();
})();
