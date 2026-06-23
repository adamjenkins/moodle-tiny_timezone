Timezone date/time (Tiny editor plugin)
========================================

A TinyMCE editor plugin that lets a user insert a date and time in their own
timezone, wrapped in a `<span>` tagged with that timezone. The companion
**Timezone** text filter (`filter_timezone`) reads this markup and converts it to
the viewing user's own timezone wherever the content is displayed.

Adds an "Insert date/time with timezone" button (and matching Insert-menu item) to
the TinyMCE toolbar. Clicking it opens a dialogue with a date/time picker and a
timezone selector populated from Moodle's own list of IANA timezones, then inserts:

```html
<span class="filter_timezone" data-timestamp="1782277200" data-timezone="Asia/Tokyo">
  2026-06-24 14:00 (Asia/Tokyo)
</span>
```

The visible text always includes the timezone in parentheses, so the date/time
remains unambiguous even if `filter_timezone` is not installed or is disabled —
that text is the only thing anyone sees in that case.

Clicking the button again with the cursor inside an existing span edits that span
in place rather than inserting a duplicate.

Requirements
============

- Moodle 5.0 or later (CI-tested on Moodle 5.1 and 5.2)
- PHP 8.2 or later
- The `editor_tiny` subsystem (TinyMCE editor, included with Moodle core)

Installation
============

**From GitHub:**
Download the ZIP, extract into `lib/editor/tiny/plugins/timezone/`, then log in as
admin and go to *Site Administration → Notifications* to run the database upgrade.

Pair it with the `filter_timezone` plugin to have inserted date/times actually
convert for viewers; without it, the inserted text is still shown but never
converted.

Setup
=====

No configuration is required. Any user with the `tiny/timezone:use` capability
(allowed for all users by default) will see the toolbar button in any TinyMCE
editor.

Privacy
=======

This plugin does not store any personal data.

Compatibility
=============

| Moodle | PHP | Status |
|---|---|---|
| 5.2 | 8.3, 8.4 | ✓ CI |
| 5.1 | 8.2, 8.3, 8.4 | ✓ CI |

CI runs on PostgreSQL and MariaDB for all combinations above.

License
=======

GNU GPL v3 or later — see http://www.gnu.org/copyleft/gpl.html
