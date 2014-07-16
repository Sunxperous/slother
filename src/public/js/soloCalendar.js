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
        if (validateNUSModsLink($('#url').val())) {
          $.getJSON('/extract',
            { addr: encodeURIComponent($('#url').val()) },
            function(calendar) {
              timetable.replaceOrAddCalendar(calendar, true);
              timetable.update();
            }
          );
        }
        else {
        }
      }
      return false;
    });
})();