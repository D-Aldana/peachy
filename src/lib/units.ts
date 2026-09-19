import type { Unit } from './types';

const KG_PER_LB = 0.45359237;

export function toKg(value: number, unit: Unit): number {
  return unit === 'kg' ? value : value * KG_PER_LB;
}

export function fromKg(kg: number, unit: Unit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB;
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function formatNumber(value: number, maxDecimals = 1): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: maxDecimals });
}

export function formatWeight(kg: number, unit: Unit): string {
  return formatNumber(fromKg(kg, unit));
}

export function weightStep(unit: Unit): number {
  return unit === 'kg' ? 2.5 : 5;
}
