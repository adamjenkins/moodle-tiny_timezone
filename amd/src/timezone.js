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
 * @copyright   2026 PluginDev
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Templates from 'core/templates';
import Pending from 'core/pending';
import {exception as displayException} from 'core/notification';
import {spanClass} from 'tiny_timezone/common';
import Selectors from 'tiny_timezone/selectors';

/**
 * Convert a "YYYY-MM-DDTHH:MM" wall-clock value, understood as a local time in the given
 * IANA timezone, into a Unix timestamp (UTC seconds).
 *
 * There is no Intl API to parse a wall-clock time directly into a specific zone, so we use
 * the standard round-trip trick: treat the wall-clock value as if it were UTC, then measure
 * the offset between that same instant rendered in UTC and rendered in the target zone, and
 * apply the difference.
 *
 * @param {String} datetimeLocalValue value of an <input type="datetime-local">
 * @param {String} timeZone IANA timezone identifier
 * @returns {Number} Unix timestamp in seconds
 */
export const wallTimeToTimestamp = (datetimeLocalValue, timeZone) => {
    const asUtcMs = new Date(`${datetimeLocalValue}:00Z`).getTime();

    const utcRendered = new Date(asUtcMs).toLocaleString('en-US', {timeZone: 'UTC'});
    const zoneRendered = new Date(asUtcMs).toLocaleString('en-US', {timeZone});
    const offsetMs = new Date(utcRendered).getTime() - new Date(zoneRendered).getTime();

    return Math.round((asUtcMs + offsetMs) / 1000);
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
 * Insert a new timezone span, or update the one currently selected, from the dialogue form.
 *
 * @param {Element} currentForm
 * @param {TinyMCE} editor
 */
export const setTimezone = (currentForm, editor) => {
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
        const currentSpan = getSelectedSpan(editor);
        if (currentSpan) {
            currentSpan.outerHTML = html;
        } else {
            editor.insertContent(html);
        }
        return pendingPromise.resolve();
    }).catch(displayException);
};
