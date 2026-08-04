# Changelog

All notable changes to the Timezone date/time Tiny editor plugin (tiny_timezone)
are documented here. Entries are ordered newest-first.

---

## [2026080400] — 2026-08-04 — Add the GPL-3.0 LICENSE file

### Added

- The full GPL-3.0 licence text is now included as `LICENSE` in the repository
  root. The plugin's licence is unchanged (GPL-3.0-or-later, as declared in
  `composer.json`); the file was simply missing.

## [2026062401] — 2026-06-24 — Fix caret escaping the span; fix duplicate on edit

### Fixed
- Text typed immediately after inserting a date/time could end up *inside*
  the inserted span and be silently discarded once `filter_timezone` rewrote
  the span's contents. Fixed by marking the span `contenteditable="false"` in
  `embed_timezone.mustache`, making it an atomic unit the browser cannot
  place a caret inside — the same pattern TinyMCE itself uses for atomic
  inline widgets (e.g. mentions). An earlier attempt at this fix, which
  manually inserted a zero-width-space placeholder text node after the span,
  turned out to be unreliable: TinyMCE's own idle content cleanup strips
  invisible characters it doesn't recognise as its own, silently
  reintroducing the bug if the user paused a few seconds before typing.
- Clicking an existing span and reopening the dialogue to edit it was
  actually inserting a *second*, duplicate span rather than updating the
  original one. The span being edited was captured correctly when the
  dialogue opened (which is why the form pre-filled with the right values),
  but `setTimezone()` independently re-detected the selected span at save
  time — by which point focus had moved into the dialogue's own form fields
  and the editor no longer reported the span as selected. Fixed by capturing
  the span reference once, when the dialogue opens, and threading it through
  to save time instead of re-querying the editor's selection later.

### Changed
- `embed_timezone.mustache`'s doc comment now correctly documents that the
  `filter_timezone` class and the `data-timestamp`/`data-timezone`
  attributes are required by the JS (previously said "none" for both).

### Verified
- Manually tested in a real browser session (Playwright against a live
  Moodle 5.2 install), repeatedly: typing immediately after insert, typing
  after a multi-second pause, and the full save → reload → filter-render
  round trip — all keep typed text outside the span.
- Re-tested the edit-existing-span flow the same way: editing now updates
  the one existing span in place, with no duplicate, across repeated runs.
- Ran phpcs (Moodle standard), the AMD/Grunt build with ESLint, and
  moodlecheck — all clean.

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
