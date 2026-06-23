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
 * Tiny Timezone commands.
 *
 * @module      tiny_timezone/commands
 * @copyright   2026 PluginDev
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getString} from 'core/str';
import {component, buttonShortName} from 'tiny_timezone/common';
import {handleAction} from 'tiny_timezone/ui';
import {getSelectedSpan} from 'tiny_timezone/timezone';

export const getSetup = async() => {
    const buttonText = await getString('insertdatetime', component);

    return (editor) => {
        editor.ui.registry.addToggleButton(buttonShortName, {
            icon: 'insert-time',
            tooltip: buttonText,
            onAction: () => {
                handleAction(editor);
            },
            onSetup: toggleActiveState(editor),
        });

        editor.ui.registry.addMenuItem(buttonShortName, {
            icon: 'insert-time',
            text: buttonText,
            onAction: () => {
                handleAction(editor);
            },
        });
    };
};

/**
 * Change the active state of the button when the selection is within a timezone span.
 *
 * @param {TinyMCE} editor
 * @returns {function(*): function(): *}
 */
const toggleActiveState = (editor) => (api) => {
    const updateState = () => api.setActive(!editor.mode.isReadOnly() && !!getSelectedSpan(editor));
    updateState();
    editor.on('NodeChange', updateState);
    return () => editor.off('NodeChange', updateState);
};
