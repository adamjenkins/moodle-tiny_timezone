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

namespace tiny_timezone\privacy;

use core_privacy\tests\provider_testcase;

/**
 * Privacy provider tests for tiny_timezone.
 *
 * The plugin stores no data of its own (no tables, user preferences or files), so it declares a
 * null provider; these tests pin that declaration and its explanation string.
 *
 * @package    tiny_timezone
 * @copyright  2026 Adam Jenkins <adam@wisecat.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[\PHPUnit\Framework\Attributes\CoversClass(provider::class)]
final class provider_test extends provider_testcase {
    /**
     * The provider is a null provider whose reason is a defined language string.
     */
    public function test_null_provider_reason(): void {
        $this->assertInstanceOf(\core_privacy\local\metadata\null_provider::class, new provider());
        $this->assertSame('privacy:metadata', provider::get_reason());
        $this->assertTrue(get_string_manager()->string_exists(provider::get_reason(), 'tiny_timezone'));
        $this->assertSame(
            'The Timezone date/time plugin for TinyMCE does not store any personal data.',
            get_string(provider::get_reason(), 'tiny_timezone')
        );
    }

    /**
     * The privacy manager resolves the component to this null provider and its reason.
     */
    public function test_manager_reports_null_provider(): void {
        $manager = new \core_privacy\manager();
        $this->assertTrue($manager->component_is_compliant('tiny_timezone'));
        $this->assertSame('privacy:metadata', $manager->get_null_provider_reason('tiny_timezone'));
    }
}
