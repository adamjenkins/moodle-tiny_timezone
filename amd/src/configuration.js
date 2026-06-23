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
 * Tiny Timezone configuration.
 *
 * @module      tiny_timezone/configuration
 * @copyright   2026 PluginDev
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {buttonShortName} from 'tiny_timezone/common';
import {addToolbarButtons} from 'editor_tiny/utils';

const configureMenu = (menu) => {
    if (menu.insert.items.match(buttonShortName)) {
        return menu;
    }

    menu.insert.items = `${buttonShortName} ${menu.insert.items}`;

    return menu;
};

export const configure = (instanceConfig) => {
    return {
        menu: configureMenu(instanceConfig.menu),
        toolbar: addToolbarButtons(instanceConfig.toolbar, 'content', [buttonShortName]),
    };
};
