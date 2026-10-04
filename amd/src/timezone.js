// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Timezone helper for Tiny Timezone plugin.
 *
 * @module      tiny_timezone/timezone
 * @copyright   2026 Adam Jenkins <adam@wisecat.net>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import Pending from 'core/pending';
import {exception as displayException} from 'core/notification';
import {spanClass} from 'tiny_timezone/common';
import Selectors from 'tiny_timezone/selectors';

/**
 * Get the UTC offset of an IANA timezone at a given instant.
 *
 * @param {Number} instantMs the instant, in milliseconds since the Unix epoch
 * @param {String} timeZone IANA timezone identifier
 * @returns {Number} the zone's offset from UTC at that instant, in milliseconds (east positive)
 */
const zoneOffsetAt = (instantMs, timeZone) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h23',
    }).formatToParts(new Date(instantMs));

    const get = (type) => parseInt(parts.find((part) => part.type === type).value, 10);
    // The zone's wall-clock reading at this instant, read back as if it were UTC.
    const wallAsUtcMs = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
    const wholeSecondMs = instantMs - (((instantMs % 1000) + 1000) % 1000);

    return wallAsUtcMs - wholeSecondMs;
};

/**
 * Convert a "YYYY-MM-DDTHH:MM" wall-clock value, understood as a local time in the given
 * IANA timezone, into a Unix timestamp (UTC seconds).
 *
 * There is no Intl API to parse a wall-clock time directly into a specific zone. The offset
 * must be measured at the real instant, not at the wall-clock value read as UTC, or times near
 * a DST change come out an hour off. So both offsets in force around that wall time (a day
 * either side; no zone changes offset twice in a day) are tried, and an offset is accepted only
 * if the instant it gives really does show that wall time in the zone.
 *
 * Policy (the same as Temporal's "compatible" disambiguation): a wall time that occurs twice
 * when clocks go back resolves to the earlier instant; a wall time skipped when clocks go
 * forward is moved forward by the length of the gap (e.g. 02:30 becomes 03:30).
 *
 * @param {String} datetimeLocalValue value of an <input type="datetime-local">
 * @param {String} timeZone IANA timezone identifier
 * @returns {Number} Unix timestamp in seconds
 */
export const wallTimeToTimestamp = (datetimeLocalValue, timeZone) => {
    const asUtcMs = new Date(`${datetimeLocalValue}:00Z`).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    const offsetBefore = zoneOffsetAt(asUtcMs - dayMs, timeZone);
    const offsetAfter = zoneOffsetAt(asUtcMs + dayMs, timeZone);

    const matches = [offsetBefore, offsetAfter]
        .map((offset) => asUtcMs - offset)
        .filter((candidate) => zoneOffsetAt(candidate, timeZone) === asUtcMs - candidate);

    // No match means a skipped wall time: reading it with the pre-change offset moves it forward.
    const instantMs = matches.length ? Math.min(...matches) : asUtcMs - offsetBefore;

    return Math.round(instantMs / 1000);
};

/**
 * Format a Unix timestamp as a "YYYY-MM-DD HH:MM" wall-clock string in the given timezone.
 *
 * @param {Number} timestamp Unix timestamp in seconds
 * @param {String} timeZone IANA timezone identifier
 * @returns {String}
 */
export const formatWallTime = (timestamp, timeZone) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(new Date(timestamp * 1000));

    const get = (type) => parts.find((part) => part.type === type).value;

    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
};

/**
 * Format a Unix timestamp as a "YYYY-MM-DDTHH:MM" value suitable for an
 * <input type="datetime-local">, in the given timezone.
 *
 * @param {Number} timestamp Unix timestamp in seconds
 * @param {String} timeZone IANA timezone identifier
 * @returns {String}
 */
export const formatForDatetimeInput = (timestamp, timeZone) => formatWallTime(timestamp, timeZone).replace(' ', 'T');

/**
 * Build the failsafe display text shown wherever filter_timezone is not active.
 *
 * @param {Number} timestamp Unix timestamp in seconds
 * @param {String} timeZone IANA timezone identifier
 * @returns {String}
 */
export const buildDisplayText = (timestamp, timeZone) => `${formatWallTime(timestamp, timeZone)} (${timeZone})`;

/**
 * Get the currently selected timezone span, if any.
 *
 * @param {TinyMCE} editor
 * @returns {Element|null}
 */
export const getSelectedSpan = (editor) => {
    const selectedNode = editor.selection.getNode();
    return editor.dom.getParent(selectedNode, `span.${spanClass}`);
};

/**
 * Get the data of the currently selected timezone span, for pre-filling the dialogue.
 *
 * @param {TinyMCE} editor
 * @returns {Object}
 */
export const getCurrentData = (editor) => {
    const span = getSelectedSpan(editor);
    if (!span) {
        return {};
    }

    const timezone = span.getAttribute('data-timezone');
    const timestamp = parseInt(span.getAttribute('data-timestamp'), 10);
    if (!timezone || !timestamp) {
        return {};
    }

    return {
        timezone,
        timestamp,
        datetime: formatForDatetimeInput(timestamp, timezone),
    };
};

/**
 * Insert a new timezone span, or update an existing one, from the dialogue form.
 *
 * @param {Element} currentForm
 * @param {TinyMCE} editor
 * @param {Element|null} currentSpan the span being edited, as captured when the dialogue was
 *        opened (the editor's own selection can no longer be trusted to find it by this point,
 *        since focus has moved into the dialogue's form fields), or null to insert a new one.
 */
export const setTimezone = (currentForm, editor, currentSpan) => {
    const datetimeInput = currentForm.querySelector(Selectors.elements.datetime);
    const timezoneSelect = currentForm.querySelector(Selectors.elements.timezone);

    if (!datetimeInput.value) {
        return;
    }

    const pendingPromise = new Pending('tiny_timezone/setTimezone');

    const timezone = timezoneSelect.value;
    const timestamp = wallTimeToTimestamp(datetimeInput.value, timezone);
    const context = {
        timestamp,
        timezone,
        displaytext: buildDisplayText(timestamp, timezone),
    };

    Templates.renderForPromise('tiny_timezone/embed_timezone', context).then(({html}) => {
        const newSpan = editor.dom.create('div', {}, html).firstElementChild;

        if (currentSpan) {
            editor.dom.replace(newSpan, currentSpan);
        } else {
            editor.selection.setNode(newSpan);
        }

        // The span is contenteditable="false" (see the template), so it is an atomic unit as
        // far as the browser's caret is concerned: it cannot be placed inside it, however the
        // selection below is resolved. That's what actually keeps text typed next outside the
        // span, not this particular placement.
        editor.selection.select(newSpan);
        editor.selection.collapse(false);
        editor.nodeChanged();

        return pendingPromise.resolve();
    }).catch(displayException);
};
