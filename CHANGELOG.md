# Changelog

All notable changes to the Timezone date/time Tiny editor plugin (tiny_timezone)
are documented here. Entries are ordered newest-first.

---

## [2026062400] — 2026-06-24 — Initial release

### Added
- Toolbar button and Insert-menu item ("Insert date/time with timezone") that
  opens a modal with a date/time picker and a timezone selector populated from
  `core_date::get_list_of_timezones()`.
- Inserts a `<span class="filter_timezone" data-timestamp="..."
  data-timezone="...">` element whose visible text is the chosen date/time with
  the timezone shown in parentheses as a failsafe — meant to be converted by the
  companion `filter_timezone` plugin, but unambiguous on its own.
- Clicking the button with the cursor inside an existing span edits it in place
  instead of inserting a duplicate.
- `tiny/timezone:use` capability (allowed for all users by default).
- GitHub Actions CI (Moodle 5.1, 5.2 — PHP 8.2–8.4 as supported per branch;
  PostgreSQL and MariaDB), including AMD build via Grunt and Mustache lint.

### Verified
- Manually tested end-to-end in a browser: toolbar button appears, modal opens,
  date/time + timezone insert correctly, and the resulting span round-trips
  through save/display.
- Ran phplint, Moodle CodeSniffer, phpmd, and `validate` — all clean (interface
  signature "unused parameter" notices accepted as expected).
