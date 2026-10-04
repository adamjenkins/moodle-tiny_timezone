<?php
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

namespace tiny_timezone;

use advanced_testcase;

/**
 * Unit tests for the tiny_timezone plugininfo class.
 *
 * @package    tiny_timezone
 * @copyright  2026 Adam Jenkins <adam@wisecat.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[\PHPUnit\Framework\Attributes\CoversClass(plugininfo::class)]
final class plugininfo_test extends advanced_testcase {
    /**
     * The configuration handed to the editor holds a non-empty list of real IANA zones only.
     *
     * The JS side (amd/src/timezone.js) feeds each key straight into Intl.DateTimeFormat, so the
     * "99" (server default) sentinel or any other non-IANA key would make the conversion throw.
     */
    public function test_configuration_lists_only_real_timezones(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $config = plugininfo::get_plugin_configuration_for_context(\context_system::instance(), [], []);

        $this->assertSame(['timezones'], array_keys($config));
        $timezones = $config['timezones'];
        $this->assertNotEmpty($timezones);
        $this->assertArrayNotHasKey('99', $timezones);
        $this->assertArrayNotHasKey(99, $timezones);
        $this->assertArrayHasKey('Europe/Berlin', $timezones);
        $this->assertArrayHasKey('America/New_York', $timezones);

        $valid = array_flip(\DateTimeZone::listIdentifiers(\DateTimeZone::ALL_WITH_BC));
        foreach ($timezones as $key => $label) {
            $this->assertIsString($key);
            $this->assertArrayHasKey($key, $valid, "'$key' is not an IANA timezone identifier");
            $this->assertNotSame('', trim($label));
        }
    }

    /**
     * The toolbar button and menu item are both registered under the plugin's own command name.
     */
    public function test_available_buttons_and_menuitems(): void {
        $this->assertSame(['tiny_timezone/tiny_timezone'], plugininfo::get_available_buttons());
        $this->assertSame(['tiny_timezone/tiny_timezone'], plugininfo::get_available_menuitems());
    }

    /**
     * The plugin is offered only to users who hold tiny/timezone:use in the editor's context.
     */
    public function test_is_enabled_follows_use_capability(): void {
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();
        $course = $generator->create_course();
        $context = \context_course::instance($course->id);
        $user = $generator->create_and_enrol($course, 'editingteacher');
        $this->setUser($user);
        $options = ['pluginname' => 'timezone'];

        $this->assertNotFalse(get_capability_info('tiny/timezone:use'));
        $this->assertTrue(plugininfo::is_enabled($context, $options, []));

        $roleid = $generator->create_role();
        role_assign($roleid, $user->id, $context->id);
        assign_capability('tiny/timezone:use', CAP_PROHIBIT, $roleid, $context->id);
        accesslib_clear_all_caches_for_unit_testing();

        $this->assertFalse(plugininfo::is_enabled($context, $options, []));
    }
}
