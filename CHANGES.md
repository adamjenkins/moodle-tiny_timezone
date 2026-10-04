# Changes

## v1.1.3 (2026100400)

- Fix: a date/time picked within a few hours of a daylight-saving change was stored
  (and shown to every viewer) one hour off. A time skipped when clocks go forward now
  moves forward by the gap; a time that occurs twice when clocks go back resolves to
  the first occurrence.
- Add PHPUnit tests for the editor configuration, the capability check and the
  privacy provider, and Behat tests for inserting and re-editing a date/time,
  including times either side of a daylight-saving change.
- Correct the copyright holder in the JavaScript file headers.
- composer.json now requires `moodle/moodle` `^5.0` rather than `>=5.0 <5.4`, so later
  Moodle 5.x releases are no longer excluded.
- Releases are now also published to the camp plugin registry (camp-registry.org).
- Continuous integration now tests against the released Moodle 5.3 (`MOODLE_503_STABLE`)
  instead of Moodle's development branch.
