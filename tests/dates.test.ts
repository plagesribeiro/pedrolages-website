import { describe, expect, it } from 'vitest';
import { formatMonth, formatRange, yearsSince } from '$lib/utils/dates';

describe('yearsSince', () => {
  it('counts full years between two dates', () => {
    expect(yearsSince('2019-07-01', new Date('2026-01-01'))).toBe(6);
  });

  it('floors partial years (anniversary not reached)', () => {
    expect(yearsSince('2020-07-01', new Date('2024-06-30'))).toBe(3);
  });

  it('returns 0 on the same day', () => {
    expect(yearsSince('2024-01-15', new Date('2024-01-15'))).toBe(0);
  });

  it('handles YYYY-only input', () => {
    expect(yearsSince('2020', new Date('2025-06-01'))).toBe(5);
  });

  it('never returns negative', () => {
    expect(yearsSince('2030-01-01', new Date('2020-01-01'))).toBe(0);
  });
});

describe('formatMonth', () => {
  it('formats year+month in PT', () => {
    expect(formatMonth('2023-07', 'pt')).toBe('jul/23');
  });
  it('formats year+month in EN', () => {
    expect(formatMonth('2023-07', 'en')).toBe('Jul/23');
  });
  it('returns year-only for YYYY input', () => {
    expect(formatMonth('2023', 'pt')).toBe('2023');
  });
  it('returns empty string for empty input', () => {
    expect(formatMonth(undefined, 'pt')).toBe('');
  });
});

describe('formatRange', () => {
  it('uses "hoje" for current PT', () => {
    expect(formatRange('2023-01', undefined, true, 'pt')).toBe('jan/23 → hoje');
  });
  it('uses "present" for current EN', () => {
    expect(formatRange('2023-01', undefined, true, 'en')).toBe('Jan/23 → present');
  });
  it('shows start → end when both are set', () => {
    expect(formatRange('2020-01', '2022-06', false, 'pt')).toBe('jan/20 → jun/22');
  });
});
