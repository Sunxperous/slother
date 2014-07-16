(function() {
  'use strict';
  
  $.getJSON(window.location.pathname,
    function(response) {
      response.members.forEach(function(member, index) {
        var genericCalendar = {
          _id: member._id, name: member.username, events: member.events
        };
<<<<<<< HEAD
        timetable.replaceOrAddCalendar(genericCalendar, false);
=======
        timetable.replaceOrAddCalendar(genericCalendar);
>>>>>>> further modularize timetable.js
      })
    }
  );

})();