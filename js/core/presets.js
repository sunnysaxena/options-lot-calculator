/** Editable defaults only; verify exchange lot sizes before trading. */
export const LOT_SIZE_PRESETS = Object.freeze({
  NIFTY: 65,
  BANKNIFTY: 30,
  MIDCPNIFTY: 120,
  FINNIFTY: 60,
  SENSEX: 20
});

export const getLotSizePreset = (symbol) => LOT_SIZE_PRESETS[symbol] ?? 65;
