(function() {

  'use strict';

  var CELL_WIDTH             = 76; // Cell width.
  var CELL_HEIGHT            = 14; // Cell height.
  var RIGHT_DIV_TRIM         = 2;  // Pixels to trim at the right of each item div.
  var DATEPICKER_DATE_FORMAT = "d/m/Y"; // Not in use at the moment.
  var MOMENT_DATE_FORMAT     = "DD/MM/YYYY"; // For input elements.
  var MOMENT_TIME_FORMAT     = "HH:mm"; // For input elements.
  var START_VIEWING_AT       = 7; // Scrolls to hour on page load.

  var now = moment();
  now = moment("2014-08-11").add(2, 'weeks'); // For testing purpose, set to 3rd week.

  var sunOfWeek = now.startOf('week');
  var satOfWeek = moment(sunOfWeek).add(7, 'days'); // Next Sunday 00:00.

  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var users = [];
  var displayType = { SOLO: 0, GROUP: 1 }
  var displayingFor;

  // Update week number.
  //   Probably divide between NUS-style or default-style.
  var updateDates = function(){
    var date = moment(sunOfWeek);
    $('#year_display').text(date.format("YYYY"));
    $('#sun_day').text(date.format("DD MMM"));
    $('#sat_day').text(satOfWeek.format("DD MMM"));

    date.subtract(1, 'day'); // For Sunday.
    $('.dayDate').each(function (index, day) {
      $(day).data('date', date.add(1, 'day').clone());
      $(day).text($(day).data('date').format("DD MMM"));
    });
  };

  // Switch weeks.
  $('#before').click(function(event) {
    now.add(-1, 'weeks');
    update();
  });

  $('#after').click(function(event) {
    now.add(1, 'weeks');
    update();
  });

  var update = function() {
    // Change the dates.
    sunOfWeek = now.subtract(now.day(), 'days');
    satOfWeek = moment(sunOfWeek).add(7, 'days');
    updateDates();

    // Reset <td> rows.
    var tds = $('td.slot');
    tds.each(function(i, td) {
      tds.eq(i).data('rows', []).height('auto');
    });

    // All users to refresh their calendar display.
    users.forEach(function(user, index) {
      user.clear();
    });

    users.forEach(function(user, index) {
      user.refresh();
    });
  };
  update();

  function toggleView(event) {
    var status = event.data.toggleView();
    $(this).text(status ? 'hide' : 'show');
  }

  // popupStatus status
  var popupStatuses = {
    HIDDEN: 0,
    READ_ONLY: 1,
    EDITED: 2
  }
  var popupStatus = popupStatuses.HIDDEN;
  // Close popup when outside is clicked.
  $('#popup_wrapper').click(function closePopup(event) {
    if (popupStatus !== popupStatuses.READ_ONLY) { return; }
    if ($(event.target).attr('id') !== 'popup_wrapper') { return; }
    $('#popup_wrapper').addClass('hidden');
    popupStatus = popupStatuses.HIDDEN;
  });
  // Close popup when X is clicked, or when cancel is clicked.
  function closePopup(event) {
    if (popupStatus === popupStatuses.HIDDEN) { return; }
    $('#popup_wrapper').addClass('hidden');
    popupStatus = popupStatuses.HIDDEN;
  };
  $('#popup_close').click(closePopup);
  $('#cancel').click(closePopup);
  // Disable clicking outside when fields are edited.
  $('#event_details :input').change(function(event) {
    popupStatus = popupStatuses.EDITED;
  });

  // Popup for existing event when clicked.
  function displayEventDetails(event) {
    if (popupStatus !== popupStatuses.HIDDEN) { return; }
    popupStatus = popupStatuses.READ_ONLY;

    var item = $(event.target).data('item');
    var calendar_id = $(event.target).data('calendar_id');
    var exactDateStart = $(event.target).data('exactDate');
    var duration = $(event.target).data('duration');

    $('#popup_title').text('Event details');

    $('#existing .summary').text(item.summary);
    $('#existing .description').text(item.description);
    $('#existing .location').text(item.location);

    $('#existing .exactDateStart').text(
      exactDateStart.format("dddd DD MMM 'YY, HH:mm"));
    var exactDateEnd = exactDateStart.clone().add(duration, 'milliseconds');
    $('#existing .exactDateEnd').text(
      exactDateEnd.format("dddd DD MMM 'YY, HH:mm"));

    if (item.rrule.freq === 'ONCE') {
      $('#existing .rruleFreq').text('');
      $('#existing .rruleInfo').addClass('hidden');
    }
    else {
      $('#existing .rruleInfo').removeClass('hidden');
      $('#existing .rruleFreq').text(item.rrule.freq);
      $('#existing .rruleCount').text(item.rrule.count);
      $('#existing .dateStart').text(
        moment(item.dateStart).format("dddd DD MMM 'YY, HH:mm"));
    }

    $('#existing .exclude').empty();
    if (item.exclude && item.exclude.length > 0) {
      item.exclude.forEach(function (exclude) {
        var li = $('<li>');
        li.text(moment(exclude).format("DD MMM 'YY, HH:mm"));
        $('#existing .exclude').append(li);
      });
    }

    $('#existing').removeClass('hidden');
    $('#new').addClass('hidden');
    $('#popup_wrapper').removeClass('hidden');

    if (displayingFor === displayType.SOLO) { // Only allow the group's calendar for edit.
      // Edit event.
      $('#edit_event').unbind('click');
      $('#edit_event').click(function editEvent(event) {
        displayEditablePopup({
          submit: 'Edit event',
          popup_title: 'Edit event',
          event_id: item._id,
          calendar_id: calendar_id,
          summary: item.summary,
          description: item.description,
          location: item.location,
          date_start: exactDateStart.format(MOMENT_DATE_FORMAT),
          date_end: exactDateEnd.format(MOMENT_DATE_FORMAT),
          time_start: exactDateStart.format(MOMENT_TIME_FORMAT),
          time_end: exactDateEnd.format(MOMENT_TIME_FORMAT),
          rrule_freq: item.rrule.freq,
          rrule_count: item.rrule.count ? item.rrule.count : 1,
          exclude: item.exclude,
        });
      });

      // Delete this event instance.
      $('#delete_this').unbind('click');
      $('#delete_this').click(function(event) {
        var excludes = item.exclude.map(function(exclude) { return exclude; }); // Cloning.
        excludes.push(exactDateStart);
        displayEditablePopup({
          submit: 'Edit event',
          popup_title: 'Edit event',
          event_id: item._id,
          calendar_id: calendar_id,
          summary: item.summary,
          description: item.description,
          location: item.location,
          date_start: exactDateStart.format(MOMENT_DATE_FORMAT),
          date_end: exactDateEnd.format(MOMENT_DATE_FORMAT),
          time_start: exactDateStart.format(MOMENT_TIME_FORMAT),
          time_end: exactDateEnd.format(MOMENT_TIME_FORMAT),
          rrule_freq: item.rrule.freq,
          rrule_count: item.rrule.count ? item.rrule.count : 1,
          exclude: excludes,
        });    
      });

      // $('#delete_all').click(function(event) {

      // });
    }
    else {
      $('#edit_event').attr('disabled', true).hide();
      $('#delete_this').attr('disabled', true).hide();
    }
  }

  // Display editable popup.
  //   Input: event object with the following parameters:
  function displayEditablePopup(item) {
    popupStatus = popupStatuses.READ_ONLY;
    Object.keys(item).forEach(function(key) {
      if (key !== 'exclude') {
        var element = $('#' + key);
        element.val(item[key]);
      }
      else { // key === 'exclude'
        $('#exclude').html('<label>Exclude</label>')
        var appending = '';
        item[key].forEach(function(excludeDate) {
          var excludeDateMoment = moment(excludeDate);
          var element = '<label class="exclude"><input type="checkbox" name="exclude" value="'
            + excludeDateMoment.format() + '" checked>'
            + excludeDateMoment.format("DD MMM 'YY, HH:mm") + '</input></label>';
          appending += element;
        });
        $('#exclude').append(appending);
      }
    });

    if ($('#rrule_freq').val() === 'ONCE') {
      $('#rrule_count').prop('disabled', true);
    }
    else { $('#rrule_count').removeAttr('disabled'); }

    $('#existing').addClass('hidden');
    $('#new').removeClass('hidden');
    $('#popup_wrapper').removeClass('hidden');
  }

  // Rrule count toggler.
  $('#rrule_freq').change(function(event) {
    if ($('#rrule_freq').val() === 'ONCE') {
      $('#rrule_count').prop('disabled', true);
    }
    else { $('#rrule_count').removeAttr('disabled'); }    
  });

  // Popup for new event when empty areas of calendar are clicked.
  $('#calendar').click(function createNewEvent(event) {
    if (popupStatus !== popupStatuses.HIDDEN) { return; }
    if (!$(event.target).hasClass('slot')) { return; }

    var td = $(event.target);
    var hour;
    for (var i = 0; i < 24; i++) {
      if (td.hasClass(i)) { hour = i; }
    }
    var tr = td.parent();
    var day;
    for (var i = 0; i < 7; i++) {
      if (tr.hasClass(days[i])) { day = i; }
    }

    var date = moment(now).clone().add(day, 'days');
    date.hours(hour);

    displayEditablePopup({
      submit: 'Add event',
      popup_title: 'Add event',
      event_id: '',
      summary: '',
      description: '',
      location: '',
      date_start: date.format(MOMENT_DATE_FORMAT),
      date_end: date.format(MOMENT_DATE_FORMAT),
      time_start: date.format(MOMENT_TIME_FORMAT),
      time_end: date.add(1, 'hour').format(MOMENT_TIME_FORMAT),
      rrule_freq: 'ONCE',
      rrule_count: 1,
    })
  });

  // Sending event to server.
  $('#event_details').submit(function(event) {
    event.preventDefault();
    var dateStart = moment(
      $('#date_start').val() + $('#time_start').val(),
      MOMENT_DATE_FORMAT + MOMENT_TIME_FORMAT);
    var dateEnd = moment(
      $('#date_end').val() + $('#time_end').val(),
      MOMENT_DATE_FORMAT + MOMENT_TIME_FORMAT);
    var sending = {};
    var directCopies = ['event_id', 'calendar_id', 'summary', 'description', 'location', 'rrule_freq', 'rrule_count'];
    directCopies.forEach(function(field) {
      var element = $('#' + field);
      sending[field] = element.val();
    });
    sending['date_start'] = dateStart.format();
    sending['date_end'] = dateEnd.format();
    var checkedExcludes = $('input[name="exclude"]:checked');
    sending['exclude'] = [];
    checkedExcludes.each(function(index) {
      sending['exclude'].push(checkedExcludes.eq(index).val());
    });

    $.post('/calendar/event', sending, function(response) {
      console.log(response);
      // Expecting response.data to contain event details and calendar_id.
      // Since only SOLO calendars can add/edit event for now, assume this is done in SOLO.
      if (displayingFor === displayType.SOLO) {
        users[0].calendars[response.calendar_id].replaceItem(response);
      }
    });
  });

  var Calendar = (function() {

    function Calendar(owner, calendar) {
      this._id = calendar._id;
      this.name = calendar.name || "NUSMods"; // Temporary.
      this.items = calendar.events;
      this.owner = owner;
      this.show = true;
      this.onDisplay = [];

      if (displayingFor === displayType.SOLO) {
        this.color = Please.make_color({
          golden: false,
          saturation: .2,
          value: 1
        });
        this.appendToLists(); // Append to popup select and calendars display.
      }
      else {
        this.color = this.owner.color;
      }
      this.display();
    }

    Calendar.prototype.appendToLists = function() {
      // Append to popup select#calendar.
      this.option = $('<option>');
      this.option.val(this._id).text(this.name);
      $('#calendar_id').append(this.option);

      this.li = $('#calendars .hidden').clone();
      this.li.removeClass('hidden')
        .children('.calendar-name')
          .text(this.name)
          .css('background-color', this.color);
      this.li.children('.toggle-view').click(this, toggleView);
      $('#calendars').append(this.li);
    };

    Calendar.prototype.toggleView = function() {
      var _this = this;
      this.onDisplay.forEach(function(item, index) {
        item.toggleClass('fade', _this.show); // If currently showing, then fade.
      });
      _this.show = !_this.show;
      return _this.show;
    };

    Calendar.prototype.replaceItems = function(items) {
      this.items = items;
    };

    Calendar.prototype.replaceItem = function(event) {
      this.items.forEach(function(item, index, items) {
        if (item._id === event._id) {
          items[index] = event;
        }
      });
      update();
    };

    Calendar.prototype.display = function() {
      var _this = this;
      if (this.items) {
        this.items.forEach(function(item, index) {
          var date = duringDisplayedWeek(item);
          if (date) {
            _this.onDisplay.push(insertEvent(item, _this, date));
          }
        });
      }
      if (!this.show) {
        this.onDisplay.forEach(function(item) {
          item.toggleClass('fade', !_this.show);
        });
      }
    };

    Calendar.prototype.clear = function() {
      var _this = this;
      this.onDisplay.forEach(function(item, index) {
        item.remove();
      });
      this.onDisplay = [];
    };

    Calendar.prototype.destroy = function() {
      this.clear();
      this.li.remove();
      this.option.remove();
    };

    var duringDisplayedWeek = function(item) {
      var date = moment(item.dateStart);

      switch (item.rrule.freq) {
        case 'ONCE':
          // Simple.
          if (date.isAfter(sunOfWeek) && date.isBefore(satOfWeek)) {
            return date;
          }
          break;
        case 'WEEKLY':
          // If start event date is after Saturday, it hasn't started.
          if (date.isAfter(satOfWeek)) {
            return null;
          }
          // If end event date is before Sunday, it is over.
          if (sunOfWeek.diff(date, 'week') >= item.rrule.count - 1) { return null;}

          // Assume day is valid, then check for exclusion.
          var day = date.day();
          var exactDate = sunOfWeek.clone().day(day);
          var excludeDate;
          if (item.exclude && item.exclude.length > 0) {
            for (var i = 0; i < item.exclude.length; i++) {
              excludeDate = moment(item.exclude[i]);
              if (exactDate.isSame(excludeDate, 'day')) {
                return null;
              }
            }
          }
          return exactDate;
          break;
        default: break;
      }
      return null;
    };

    // Adds an item to be shown on the timetable.
    var insertEvent = function(item, calendar, exactDate) {
      var dateStart = moment(item.dateStart);
      var day = dateStart.day();
      var durationInMilli = moment(item.dateEnd).diff(dateStart);
      var durationInHours = durationInMilli / 3600000;
      var dateStartMinutes = dateStart.minutes();

      var div = $('<div>');
      var width = durationInHours * CELL_WIDTH;
      div.width(width - RIGHT_DIV_TRIM)
        .css('background-color', calendar.color)
        .css('left', dateStartMinutes / 60 * CELL_WIDTH)
        .addClass('item')
        .text(item.summary)
        .data({
          calendar_id: calendar._id,
          item: item,
          duration: durationInMilli,
          exactDate: exactDate
        });

      var dayTr = $('tr.' + days[day]);
      var sourceTd = dayTr.children('td.' + (moment(dateStart).hour()));

      // Finding the next available height.
      var height = 0;
      var found = false;
      var td;
      while (!found) {
        found = true;
        td = sourceTd;
        for (var i = 0; i < durationInHours; i++) {
          td = td.next();
          if ($.inArray(height, td.data('rows')) != -1) {
            found = false;
            break;
          }
        }
        height++;
      }
      height--;
      td = sourceTd;
      // Found next available height:
      for (var i = 0; i < durationInHours; i++) {
        td = td.next();
        addToTdRows(td, height);
      }

      div.css('top', height * CELL_HEIGHT);
      sourceTd.append(div);
      div.click(displayEventDetails);
      return div;
    };

    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    };

    // <td> rows stores the slot taken up by each item.
    function addToTdRows(td, height) {
      var rowsArray = td.data('rows');
      rowsArray.push(height);
      td.data('rows', rowsArray);

      td.height((getMaxOfArray(rowsArray) + 1) * CELL_HEIGHT);
    };

    return Calendar;
  })();

  var User = (function() {
    // Currently only 1 calendar.
    function User(name, calendars, control) {
      var _this = this;
      this.name = name;
      this.calendars = {};
      this.color = Please.make_color({
        golden: false,
        saturation: .2,
        value: 1
      });
      this.show = true;

      calendars.forEach(function(calendar) {
        _this.calendars[calendar._id] = new Calendar(_this, calendar);
      });

      if (control) {
        this.applyFormTriggers();
      }
      
      if (displayingFor === displayType.GROUP) {
        this.appendToLists(); // Append to popup select and calendars display.
      }
    }

    User.prototype.appendToLists = function() {
      this.li = $('#members .hidden').clone();
      this.li.removeClass('hidden')
        .children('.member-name')
          .text(this.name)
          .css('background-color', this.color);
      this.li.children('.toggle-view').click(this, toggleView);

      // Move to group.js after modularization of timetable.js
      this.li.children('.delete').click(function deleteMember(event) {
        var username = $(this).siblings('.member-name').text();
        var url = window.location.pathname.match(/\/group\/.+\//g)[0] + 'member/' + username;
        $.ajax(url, { type: 'DELETE' }).done(function(response) {
          console.log(response);
        });
      });

      $('#members').append(this.li);      
    }

    User.prototype.toggleView = function() {
      var _this = this;
      Object.keys(this.calendars).forEach(function(key) {
        _this.calendars[key].toggleView();
      });
      _this.show = !_this.show;
      return _this.show;
    };

    User.prototype.getName = function() { return this.name; };

    User.prototype.clear = function() {
      var _this = this;
      Object.keys(this.calendars).forEach(function(id) {
        _this.calendars[id].clear();
      });
    };
    User.prototype.refresh = function() {
      var _this = this;
      Object.keys(this.calendars).forEach(function(id) {
        _this.calendars[id].display();
      });
    };

    User.prototype.applyFormTriggers = function() {
      function validateNUSModsLink(url) {
        var regexp = /http\:\/\/nusmods\.com\/timetable\/20[\d]{2}-20[\d]{2}\/sem(1|2)\?(.{6,8}?\[.{3,4}\]=.{2,5}?)+/g;
        return url.match(regexp);
      }

      var _this = this;
      // Add NUSMods address.
      $('#add_calendar').submit(function(event) {
        event.preventDefault();
        
        if ($('#type').val() === 'nusmods') {
          if (validateNUSModsLink($('#url').val())) {
            $.getJSON('/extract',
              { addr: encodeURIComponent($('#url').val()) },
              function(calendar) {
                if (_this.calendars.hasOwnProperty(calendar._id)) {
                  _this.calendars[calendar._id].destroy();
                }
                _this.calendars[calendar._id] = new Calendar(this, calendar); // Check if calendar._id already exists.
                update();
              }
            );
          }
          else {
          }
        }
        return false;
      });
    }

    return User;
  })();

  // Scrolls immediately to 7:00am.
  //   Limit the scrolling for screens with large width.
  $('.tableWrapper').scrollLeft(START_VIEWING_AT * CELL_WIDTH + 1);
  var pathname = window.location.pathname;
  if (pathname !== '/calendar/user') { // If group timetable...
    $.getJSON(pathname,
      function(response) {
        displayingFor = displayType.GROUP;
        response.members.forEach(function(member, index) {
          var genericCalendar = [{
            _id: '', name: member.username, events: member.events
          }];
          users.push(new User(member.username, genericCalendar, false));
        })
      }
    );
  }
  else { // If not group timetable...
    // Adds logged in user (via greeting message).
    $.getJSON('/calendar/user', function(calendars) {
      displayingFor = displayType.SOLO;
      users.push(new User($('#username').text(), calendars, true));
    });
  }

})();

/* Sample timetables:
http://nusmods.com/timetable/2014-2015/sem1?CS2103T[TUT]=T6&CS2101[SEC]=6&ST2334[LEC]=SL1&ST2334[TUT]=T2&CS3230[LEC]=1&CS3230[TUT]=4&CS2102[LEC]=1&CS2102[TUT]=10
http://nusmods.com/timetable/2014-2015/sem1?CS1020[SEC]=1&CS1020[TUT]=3&CS1020[LAB]=4&CS1231[SEC]=1&CS1231[TUT]=10&LSM1301[LEC]=SL2&LSM1301[LAB]=F04&MA1521[LEC]=SL1&MA1521[TUT]=T06
*/
