# Changes

## v1.1.0 (2026062401)

- Fixed text typed right after an inserted date/time ending up inside the
  span (and being lost when filter_timezone rewrote it): the span is now
  `contenteditable="false"`, an atomic unit the caret cannot enter.
- Fixed editing an existing date/time inserting a duplicate span instead of
  updating the original.
- CI now tests Moodle 5.0, 5.1 and 5.2 with compatible PHP versions
  (5.0: 8.2-8.3, 5.1: 8.2-8.4, 5.2: 8.3-8.4).

## v1.0.0 (2026062400)

- Initial release: a TinyMCE button/menu item that inserts a date/time picked
  in the author's own timezone, embedded with its Unix timestamp and IANA
  timezone so the filter_timezone text filter can display it in each
  viewer's local time.
