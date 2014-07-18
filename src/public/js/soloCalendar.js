(function() {
  'use strict';

    $.getJSON('/calendar/user', function(calendars) {
      calendars.forEach(function (calendar) {
        timetable.replaceOrAddCalendar(calendar, true);
      });
    });

    function validateNUSModsLink(url) {
      var regexp = /http\:\/\/nusmods\.com\/timetable\/20[\d]{2}-20[\d]{2}\/sem(1|2)\?(.{6,8}?\[.{3,4}\]=.{2,5}?)+/g;
      return url.match(regexp);
    }

    // Add NUSMods address.
    $('#add_calendar').submit(function(event) {
      event.preventDefault();
      
      if ($('#type').val() === 'nusmods') {
        if (validateNUSModsLink($('#nusmods_string').val())) {
          $.post('/extract',
            { addr: encodeURIComponent($('#nusmods_string').val()) },
            function(calendar) {
              timetable.replaceOrAddCalendar(calendar, true);
              timetable.update();
            }
          );
        }
        else { // Display error.
        }
      }
      else if ($('#type').val() === 'generic') {
        $.post('/calendar',
          { name: $('#generic_string').val() },
          function(calendar) {
            timetable.replaceOrAddCalendar(calendar, true);
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