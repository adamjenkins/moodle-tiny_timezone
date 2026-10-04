@editor @editor_tiny @tiny @tiny_timezone
Feature: Insert a date/time with its timezone in TinyMCE
  In order to tell people in other timezones when something happens
  As a user writing content
  I need to insert a date/time picked in a named timezone, stored as the right instant

  Background:
    Given I log in as "admin"
    And I open my profile in edit mode
    And I set the field "Description" to "<p>Meeting: </p>"

  @javascript
  Scenario: Insert a date/time and re-open it for editing
    When I click on the "Insert date/time with timezone" button for the "Description" TinyMCE editor
    And I set the timezone dialogue to "2026-07-01T18:00" in "Europe/Berlin"
    And I click on "Insert" "button" in the "Insert date/time with timezone" "dialogue"
    And I switch to the "Description" TinyMCE editor iframe
    Then "span.filter_timezone[data-timestamp='1782921600'][data-timezone='Europe/Berlin']" "css_element" should exist
    And I should see "2026-07-01 18:00 (Europe/Berlin)"
    And I switch to the main frame
    And I select the "span" element in position "0" of the "Description" TinyMCE editor
    And I click on the "Insert date/time with timezone" button for the "Description" TinyMCE editor
    And the timezone dialogue should show "2026-07-01T18:00" in "Europe/Berlin"
    And I set the timezone dialogue to "2026-07-01T18:00" in "America/New_York"
    And I click on "Update" "button" in the "Insert date/time with timezone" "dialogue"
    And I switch to the "Description" TinyMCE editor iframe
    # 18:00 EDT (UTC-4) is 22:00 UTC; the span is replaced, not duplicated.
    And "span.filter_timezone[data-timestamp='1782943200'][data-timezone='America/New_York']" "css_element" should exist
    And "span.filter_timezone[data-timezone='Europe/Berlin']" "css_element" should not exist

  # Wall times within a few hours of a daylight-saving change used to be stored one hour off,
  # because the zone offset was measured at the wall time read as UTC instead of at the real instant.
  @javascript
  Scenario Outline: A date/time near a daylight-saving change is stored as the right instant
    When I click on the "Insert date/time with timezone" button for the "Description" TinyMCE editor
    And I set the timezone dialogue to "<wall>" in "<timezone>"
    And I click on "Insert" "button" in the "Insert date/time with timezone" "dialogue"
    And I switch to the "Description" TinyMCE editor iframe
    Then "span.filter_timezone[data-timestamp='<timestamp>'][data-timezone='<timezone>']" "css_element" should exist
    And I should see "<shown> (<timezone>)"

    Examples:
      | wall             | timezone         | timestamp  | shown            | case                                                  |
      | 2026-03-08T03:30 | America/New_York | 1772955000 | 2026-03-08 03:30 | spring forward, negative offset: 03:30 EDT = 07:30Z   |
      | 2026-03-08T02:30 | America/New_York | 1772955000 | 2026-03-08 03:30 | skipped wall time moves forward by the gap            |
      | 2026-11-01T01:30 | America/New_York | 1793511000 | 2026-11-01 01:30 | fall back, negative offset: first 01:30 (EDT) = 05:30Z |
      | 2026-03-29T01:30 | Europe/Berlin    | 1774744200 | 2026-03-29 01:30 | spring forward, positive offset: 01:30 CET = 00:30Z   |
      | 2026-10-25T02:30 | Europe/Berlin    | 1792888200 | 2026-10-25 02:30 | fall back, positive offset: first 02:30 (CEST) = 00:30Z |
