(function() {
  'use strict';
  
  $.getJSON(window.location.pathname,
    function(response) {
      var calendar;
      response.members.forEach(function(member, index) {
        var genericCalendar = {
          _id: member._id,
          name: member.display_name,
          events: member.events,
          color: member.color,
          colorUrl: window.location.pathname.match(/\/group\/.+\//g) + 'member/' + member.username + '/color',
        };
        calendar = timetable.replaceOrAddCalendar(genericCalendar, false); // Member calendar.
        calendar.appendToLists(function liForAppend(li) {
          $('#calendars').append(li);
        });
      });
      calendar = timetable.replaceOrAddCalendar(response.calendar, true); // Group calendar.
      calendar.appendToLists(function liForAppend(li) {
        $('#group_calendar').append(li);
      });
    }
  );

  // Send request to join
  $('#add_friend').submit(function(event) {
    event.preventDefault();
    $.post($('#add_friend').attr('action'),
      { username: $('#friend_name').val() },
      function(response) {
        if (response.error) {
          return errors.add('error', response.error, $('#add_friend'));
        }
        return errors.add('success', response.success, $('#add_friend'));
      }
    );
  });

})();