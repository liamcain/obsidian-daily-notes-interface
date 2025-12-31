# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **ISO weekday calculation in weekly notes**: Fixed incorrect date calculation for weekday template placeholders (e.g., `{{sunday:YYYY-MM-DD}}`) when using ISO week formats.
  - **Problem**: For ISO Week 01 of 2026 (Mon Dec 29 2025 – Sun Jan 4 2026), `{{sunday:YYYY-MM-DD}}` incorrectly rendered as 2025-12-28 (the day before Monday) instead of 2026-01-04 (the actual Sunday within the ISO week).
  - **Root Cause**: The template replacement logic used locale-based `moment.weekday()` which doesn't align with ISO week boundaries. Sunday was treated as index 0 (start of locale week) instead of day 7 of the ISO week.
  - **Solution**: Added automatic detection of ISO week formats (formats containing `gggg`, `GGGG`, `ww`, `WW`, `w`, `W`, `e`, or `E` tokens) and switched to `moment.isoWeekday()` for these formats, while maintaining backward compatibility with locale-based formats using the original `moment.weekday()` implementation.
  - **Files Modified**: `src/weekly.ts`
    - Added `isISOWeekFormat()` helper function to detect ISO week format strings
    - Added `getISODayOfWeekNumericalValue()` helper function to map day names to ISO weekday numbers (Monday=1, Sunday=7)
    - Updated template replacement logic in `createWeeklyNote()` to conditionally use `isoWeekday()` or `weekday()` based on the format

### Technical Details

- **Backward Compatibility**: Non-ISO week formats (custom locale-based formats) continue to work exactly as before
- **ISO Weekday Mapping**: Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6, Sunday=7
- **Locale Weekday Mapping**: Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6 (varies by locale)
