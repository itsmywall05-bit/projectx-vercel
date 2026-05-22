export function computePerContractRisk(
  entry: number,
  sl: number,
  tick_size: number,
  tick_value: number
): number {
  if (!Number.isFinite(entry) || !Number.isFinite(sl) || !Number.isFinite(tick_size) || !Number.isFinite(tick_value)) {
    throw new TypeError('All arguments must be finite numbers');
  }
  if (tick_size <= 0) {
    throw new RangeError('tick_size must be > 0');
  }
  const ticks = Math.abs(entry - sl) / tick_size;
  return ticks * tick_value;
}

export function computeMaxLots(riskAllowed: number, perContractRisk: number): number {
  if (!Number.isFinite(riskAllowed) || !Number.isFinite(perContractRisk)) {
    throw new TypeError('Both arguments must be finite numbers');
  }
  if (riskAllowed <= 0 || perContractRisk <= 0) return 0;
  return Math.max(0, Math.floor(riskAllowed / perContractRisk));
}
