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
 * Options helper for Tiny Timezone plugin.
 *
 * @module      tiny_timezone/options
 * @copyright   2026 PluginDev
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getPluginOptionName} from 'editor_tiny/options';
import {pluginName} from 'tiny_timezone/common';

const timezonesName = getPluginOptionName(pluginName, 'timezones');

/**
 * Register the options for the Tiny Timezone plugin.
 *
 * @param {TinyMCE} editor
 */
export const register = (editor) => {
    const registerOption = editor.options.register;

    registerOption(timezonesName, {
        processor: 'object',
        "default": {},
    });
};

/**
 * Get the list of timezones available to choose from, as configured server-side.
 *
 * @param {TinyMCE} editor
 * @returns {object} map of IANA timezone identifier to localised display name
 */
export const getTimezones = (editor) => editor.options.get(timezonesName);
