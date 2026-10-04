# Changes

## [Unreleased]

- Fix: a date/time picked within a few hours of a daylight-saving change was stored
  (and shown to every viewer) one hour off. A time skipped when clocks go forward now
  moves forward by the gap; a time that occurs twice when clocks go back resolves to
  the first occurrence.
- Add PHPUnit tests for the editor configuration, the capability check and the
  privacy provider, and Behat tests for inserting and re-editing a date/time,
  including times either side of a daylight-saving change.
- Correct the copyright holder in the JavaScript file headers.

## v1.1.2 (2026100300)

- Declare Moodle 5.3 support.
