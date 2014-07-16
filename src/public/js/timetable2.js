var timetable = (function() {
  'use strict';

  var CELL_WIDTH             = 76; // Cell width.
  var CELL_HEIGHT            = 14; // Cell height.
  var RIGHT_DIV_TRIM         = 2;  // Pixels to trim at the right of each item div.
  var DATEPICKER_DATE_FORMAT = "d/m/Y"; // Not in use at the moment.
  var MOMENT_DATE_FORMAT     = "DD/MM/YYYY"; // For input elements.
  var MOMENT_TIME_FORMAT     = "HH:mm"; // For input elements.
  var START_VIEWING_AT       = 7; // Scrolls to hour on page load.
  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  var calendars = {};
  var now = moment();
  now = moment("2014-08-11").add(2, 'weeks'); // For testing purposes, set to 3rd week.

  var sunOfWeek = now.startOf('week');
  var satOfWeek = moment(sunOfWeek).add(7, 'days'); // Next Sunday 00:00.

  var timetable = {};

  timetable.popup = (function() {
    var popup = {
      // popupStatus status
      statusTypes: {
        HIDDEN: 0,
        READ_ONLY: 1,
        EDITED: 2
      },
      close: function() {
        $('#popup_wrapper').addClass('hidden');
        this.status = this.statusTypes.HIDDEN;
      },
      show: function(type) {
        this.status = this.statusTypes.READ_ONLY; // Read-only until an input is edited.
        var otherType = (type === 'existing') ? 'new' : 'existing';
        $('#' + type).removeClass('hidden');
        $('#' + otherType).addClass('hidden');
        $('#popup_wrapper').removeClass('hidden');
      },
      displayItem: function(item) {
        Object.keys(item).forEach(function(key) {
          if (key !== 'exclude') { // Not 'exclude'...
            var element = $('#' + key);
            switch (element[0].tagName) {
              case 'INPUT':
              case 'TEXTAREA':
              case 'SELECT':
                element.val(item[key]);
                break;
              default:
                element.text(item[key]);
                break;
            }
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

        this.show('new');
      },
    };

    function internalClose(event) {
      if (popup.status === popup.statusTypes.HIDDEN) { return; }
      popup.close();
    };
    function externalClose(event) {
      if (popup.status !== popup.statusTypes.READ_ONLY) { return; }
      if ($(event.target).attr('id') !== 'popup_wrapper') { return; }
      popup.close();
    }
    function displayDetailsOnClick(event) {
      if (popup.status !== popup.statusTypes.HIDDEN) { return; }
      popup.status = popup.statusTypes.READ_ONLY;

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

      popup.show('existing');

      // Edit event.
      $('#edit_event').unbind('click');
      $('#edit_event').click(function editEvent(event) {
        popup.displayItem({
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
        popup.displayItem({
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

      // Delete all of this event's instances.
      $('#delete_all').unbind('click');
      $('#delete_all').click(function(event) {
        $.ajax('/calendar/' + calendar_id + '/event/' + item._id, {
          type: 'DELETE'
        })
        .done(function(response) {
          console.log(response);
        });
      });
    }

    popup.status = popup.statusTypes.HIDDEN;
    popup.displayDetailsOnClick = displayDetailsOnClick;

    // Bind handlers on initialization.
    $('#popup_close').click(internalClose);
    $('#cancel').click(internalClose);
    $('#popup_wrapper').click(externalClose);
    $('#event_details :input').change(function(event) { // Disable outside close popup on edit.
      popup.status = popup.statusTypes.EDITED;
    });
    $('#rrule_freq').change(function(event) { // Disable repeat on rrule.freq == 'ONCE'.
      if ($('#rrule_freq').val() === 'ONCE') {
        $('#rrule_count').prop('disabled', true);
      }
      else { $('#rrule_count').removeAttr('disabled'); }    
    });

    // Popup for new event when empty areas of calendar are clicked.
    $('#calendar').click(function createNewEvent(event) {
      if (popup.status !== popup.statusTypes.HIDDEN) { return; }
      if (!$(event.target).hasClass('slot')) { return; }

      var td = $(event.target);
      var hour, day;
      for (var i = 0; i < 24; i++) {
        if (td.hasClass(i)) { hour = i; }
      }
      var tr = td.parent();
      for (var i = 0; i < 7; i++) {
        if (tr.hasClass(days[i])) { day = i; }
      }

      var date = moment(now).clone().add(day, 'days');
      date.hours(hour);

      popup.displayItem({
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
        exclude: [],
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
      var directCopies = ['summary', 'description', 'location', 'rrule_freq', 'rrule_count'];
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

      var requestType = $('#popup_title').text() === 'Add event' ? 'POST' : 'PUT';

      $.ajax('/calendar/' + $('#calendar_id').val() + '/event/' + $('#event_id').val(),
        { data: sending, type: requestType })
        .done(function(response) {
          console.log(response);
          // Expecting response.data to contain event details and calendar_id.
          // Since only SOLO calendars can add/edit event for now, assume this is done in SOLO.
          calendars[response.calendar_id].replaceItem(response);
        });
    });

    return popup;
  })();


  var Calendar = (function() {
    function toggleView(event) {
      var status = event.data.toggleView();
      $(this).text(status ? 'hide' : 'show');
    }

    function Calendar(calendar) {
      this._id = calendar._id;
      this.name = calendar.name;
      this.items = calendar.events;
      this.show = true;
      this.onDisplay = [];
      this.color = Please.make_color({
        golden: false,
        saturation: .2,
        value: 1
      });
      this.appendToLists(); // Append to popup select and calendars display.
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

    Calendar.prototype.replaceItem = function(event) {
      this.items.forEach(function(item, index, items) {
        if (item._id === event._id) { items[index] = event; }
      });
      update();
    };

    Calendar.prototype.display = function() {
      var _this = this;
      if (this.items) {
        this.items.forEach(function(item, index) {
          var date = duringDisplayedWeek(item);
          if (date) { _this.onDisplay.push(insertEvent(item, _this, date)); }
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
          var exactDate = sunOfWeek.clone().day(date.day()).hour(date.hour()).minutes(date.minutes());
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
      div.click(timetable.popup.displayDetailsOnClick);
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

  timetable.replaceOrAddCalendar = function(calendar) {
    if (calendars.hasOwnProperty(calendar._id)) {
      calendars[calendar._id].destroy();
    }
    calendars[calendar._id] = new Calendar(calendar);
  }

  timetable.update = function(num, type) {
    // Change the dates and update date displays.
    if (num && type) { now.add(num, type); }
    sunOfWeek = now.subtract(now.day(), 'days');

    var date = moment(sunOfWeek);
    $('#year_display').text(date.format("YYYY"));
    date.subtract(1, 'day'); // For Sunday.
    $('.dayDate').each(function (index, day) {
      $(day).data('date', date.add(1, 'day').clone());
      $(day).text($(day).data('date').format("DD MMM"));
    });

    satOfWeek = date;
    $('#sun_day').text(sunOfWeek.format("DD MMM"));
    $('#sat_day').text(satOfWeek.format("DD MMM"));

    // Reset <td> rows.
    var tds = $('td.slot');
    tds.each(function(i, td) { tds.eq(i).data('rows', []).height('auto'); });

    // Reset the display of all calendars.
    Object.keys(calendars).forEach(function(_id) { calendars[_id].clear(); });
    Object.keys(calendars).forEach(function(_id) { calendars[_id].display(); });
  };
  timetable.update();

  // Switch weeks.
  $('#before').click(function(event) { timetable.update(-1, 'weeks'); });
  $('#after').click(function(event) { timetable.update(1, 'weeks'); });

  // Scrolls immediately to 7:00am. To limit the scrolling for screens with large width.
  $('.tableWrapper').scrollLeft(START_VIEWING_AT * CELL_WIDTH + 1);

  return timetable;
})();