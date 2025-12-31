# Bug Fix: ISO Weekday Calculation

## Problem

The `{{sunday:YYYY-MM-DD}}` template placeholder returns the wrong date for ISO week notes.
For ISO Week 01 of 2026 (Mon Dec 29 2025 – Sun Jan 4 2026), Sunday renders as 2025-12-28
(the day before Monday) instead of 2026-01-04 (the day after Saturday).

## Root Cause

In `src/weekly.ts`, the `getDaysOfWeek()` function uses locale-based `moment.weekday()`
which doesn't handle ISO weeks correctly. Sunday gets index 0 instead of 7.

## Fix Required

For ISO week notes, use `moment.isoWeekday()` instead of `moment.weekday()`:

- Monday = 1, Tuesday = 2, ... Saturday = 6, Sunday = 7

## Key Functions to Modify

- `getDaysOfWeek()`
- `getDayOfWeekNumericalValue()`
- Template replacement regex handler (around line using `date.weekday(day)`)

## Files

- `src/weekly.ts`
