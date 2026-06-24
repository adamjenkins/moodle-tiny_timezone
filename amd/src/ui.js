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
 * Tiny Timezone UI.
 *
 * @module      tiny_timezone/ui
 * @copyright   2026 PluginDev
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import TimezoneModal from 'tiny_timezone/modal';
import {getTimezones} from 'tiny_timezone/options';
import {getCurrentData, getSelectedSpan, setTimezone} from 'tiny_timezone/timezone';
import Selectors from 'tiny_timezone/selectors';

/**
 * Display the timezone dialogue.
 *
 * @param {TinyMCE} editor
 * @returns {Promise<void>}
 */
export const handleAction = async(editor) => {
    // Capture which span (if any) is being edited now, while the editor's selection is still
    // live. By the time the dialogue's save button is clicked, focus has moved into the
    // dialogue's own form fields and the editor no longer reports this span as selected, so
    // setTimezone() must be told which span to update rather than re-detecting it itself.
    const currentSpan = getSelectedSpan(editor);

    const modal = await TimezoneModal.create({
        templateContext: getTemplateContext(editor),
    });

    const $root = await modal.getRoot();
    const root = $root[0];
    const currentForm = root.querySelector('form');

    root.addEventListener('click', (e) => {
        if (e.target.closest(Selectors.actions.submit)) {
            e.preventDefault();
            setTimezone(currentForm, editor, currentSpan);
            modal.destroy();
        }
    });

    root.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.closest(Selectors.actions.submit)) {
            e.preventDefault();
            setTimezone(currentForm, editor, currentSpan);
            modal.destroy();
        }
    });
};

/**
 * Get template context for the dialogue, pre-filled from the selected span when editing.
 *
 * @param {TinyMCE} editor
 * @returns {Object}
 */
const getTemplateContext = (editor) => {
    const data = getCurrentData(editor);
    const timezones = getTimezones(editor);
    const selectedTimezone = data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
        elementid: editor.id,
        isupdating: !!data.timestamp,
        datetime: data.datetime ?? '',
        timezones: Object.keys(timezones).map((value) => ({
            value,
            label: timezones[value],
            selected: value === selectedTimezone,
        })),
    };
};
