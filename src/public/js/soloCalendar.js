(function() {
  'use strict';

    $.getJSON('/calendar/user', function(calendars) {
      calendars.forEach(function (calendar) {
        var appendTarget = calendar.user ? '#calendars' : '#group_calendars';
        calendar = timetable.replaceOrAddCalendar(calendar, true);
        calendar.appendToLists($(appendTarget));
      });
    });

    function validateNUSModsLink(url) {
      var regexp = /http\:\/\/nusmods\.com\/timetable\/20[\d]{2}-20[\d]{2}\/sem(1|2|3|4)\?(.{6,8}?\[.{3,4}\]=.{2,5}?)+/g;
      return url.match(regexp);
    }

    // Add NUSMods address.
    $('#add_calendar').submit(function(event) {
      event.preventDefault();
      var newCalendar;
      if ($('#type').val() === 'nusmods') {
        if (validateNUSModsLink($('#nusmods_string').val())) {
          $.post('/extract',
            { addr: encodeURIComponent($('#nusmods_string').val()) },
            function (response) {
              if (response.error) {
                return errors.add('error', response.error, $('#add_calendar'));
              }
              newCalendar = timetable.replaceOrAddCalendar(response.calendar, true);
              newCalendar.appendToLists($('#calendars'));
              timetable.update();
              errors.add('success', response.success, $('#add_calendar'));
            }
          );
        }
        else {
          errors.add('error', 'Invalid URL.', $('#add_calendar'));
        }
      }
      else if ($('#type').val() === 'generic') {
        $.post('/calendar',
          { name: $('#generic_string').val() },
          function(response) {
            if (response.error) {
              return errors.add('error', response.error, $('#add_calendar'));
            }
            errors.add('success', response.success, $('#add_calendar'));
            newCalendar = timetable.replaceOrAddCalendar(response.calendar, true);
            newCalendar.appendToLists($('#calendars'));
            timetable.update();
          }
        );
      }
      return false;
    });

    $('#type').change(function(event) {
      $('#nusmods').hide();
      $('#generic').hide();
      $('#' + $(this).val()).show();
    });
})();