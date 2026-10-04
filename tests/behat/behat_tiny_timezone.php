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

// NOTE: no MOODLE_INTERNAL test here, this file may be required by behat before including /config.php.

require_once(__DIR__ . '/../../../../../../behat/behat_base.php');

use Behat\Mink\Exception\ExpectationException;

/**
 * Behat steps for the tiny_timezone dialogue.
 *
 * A datetime-local input cannot be filled reliably by typing into it through WebDriver (the
 * browser splits it into locale-dependent segments), so these steps set and read the dialogue's
 * fields directly.
 *
 * @package    tiny_timezone
 * @category   test
 * @copyright  2026 Adam Jenkins <adam@wisecat.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class behat_tiny_timezone extends behat_base {
    /**
     * Fill the open timezone dialogue with a wall-clock date/time and an IANA timezone.
     *
     * @When /^I set the timezone dialogue to "(?P<datetime_string>[0-9T:-]+)" in "(?P<timezone_string>[A-Za-z0-9_\/+-]+)"$/
     * @param string $datetime value for the datetime-local input, "YYYY-MM-DDTHH:MM"
     * @param string $timezone IANA timezone identifier, the value of a timezone option
     */
    public function i_set_the_timezone_dialogue_to(string $datetime, string $timezone): void {
        $this->ensure_element_exists('.modal.show .tiny_timezone_datetime', 'css_element');
        $this->ensure_element_exists(
            ".modal.show .tiny_timezone_timezone option[value=" . json_encode($timezone) . "]",
            'css_element'
        );

        $script = '(function() {
            var modal = document.querySelector(".modal.show");
            modal.querySelector(".tiny_timezone_datetime").value = ' . json_encode($datetime) . ';
            modal.querySelector(".tiny_timezone_timezone").value = ' . json_encode($timezone) . ';
        })();';
        $this->execute_script($script);
    }

    /**
     * Check the date/time and timezone the open timezone dialogue was pre-filled with.
     *
     * @Then /^the timezone dialogue should show "(?P<datetime_string>[0-9T:-]+)" in "(?P<timezone_string>[A-Za-z0-9_\/+-]+)"$/
     * @param string $datetime expected value of the datetime-local input, "YYYY-MM-DDTHH:MM"
     * @param string $timezone expected selected IANA timezone identifier
     */
    public function the_timezone_dialogue_should_show(string $datetime, string $timezone): void {
        $this->ensure_element_exists('.modal.show .tiny_timezone_datetime', 'css_element');

        $actualdatetime = $this->evaluate_script(
            'return document.querySelector(".modal.show .tiny_timezone_datetime").value;'
        );
        $actualtimezone = $this->evaluate_script(
            'return document.querySelector(".modal.show .tiny_timezone_timezone").value;'
        );

        if ($actualdatetime !== $datetime || $actualtimezone !== $timezone) {
            throw new ExpectationException(
                "The timezone dialogue shows '{$actualdatetime}' in '{$actualtimezone}', "
                    . "expected '{$datetime}' in '{$timezone}'",
                $this->getSession()
            );
        }
    }
}
