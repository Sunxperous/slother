datepicker = (function() {
  'use strict';

  var firstDayOfDatePicker; // Will always be the last Sunday the month before.
  var currentMonth;

  var execute;
  var selectedDate;
  var onDisplay = false;

  var datepicker = $('#datepicker_wrapper');

  var methods = {
    show: function(target, dateMoment) {
      datepicker.removeClass('hidden').detach().appendTo(target);
      datepicker.css('left', '0')
        .css('bottom', target.height());
      replaceDates(selectedDate.clone());
    },
    register: function(clicked, target, callForDate, callback) {
      var id = clicked.attr('id');
      if (!id) { return false; }

      clicked.click(function(event) {
        event.stopPropagation(); // Prevents the document click event from hiding datepicker.
        selectedDate = callForDate();
        attachTo(target);
        execute = callback;
      });
    },
    hide: hideDatepicker,
  };

  function hideDatepicker(event) {
    datepicker.addClass('hidden');
    $(document).unbind('click', hideDatepicker);
  }

  function attachTo(target) {
    if (onDisplay) {
      datepicker.addClass('hidden').detach();
      onDisplay = false;
      $(document).unbind('click', hideDatepicker);
    }
    if (!onDisplay) {
      methods.show(target);
      onDisplay = true;
      $(document).click(hideDatepicker);
    }
  }

  function replaceDates(dateValue) {
    if (typeof dateValue === 'undefined') { dateValue = moment(); }

    var firstDayOfMonth = dateValue.date(1); // Set to first date.
    $('#datepicker_month').text(firstDayOfMonth.format("MMMM"));
    currentMonth = firstDayOfMonth.month();
    currentMonth = (currentMonth > 11) ? 0 : currentMonth;

    $('#datepicker_year').text(firstDayOfMonth.format("YYYY"));

    firstDayOfDatePicker = firstDayOfMonth.subtract(firstDayOfMonth.day(), 'days');
    if (firstDayOfDatePicker.date() === 1) {
      firstDayOfDatePicker.subtract(7, 'days');
    }

    var counter = firstDayOfDatePicker.clone();
    datepicker.find('.datepicker-day').each(function(index, element) {
      $(element).text(counter.format("D"));
      if (counter.isSame(selectedDate)) {
        $(element).removeClass('datepicker-fade');
        $(element).addClass('datepicker-selected');
      }
      else {
        $(element).removeClass('datepicker-selected');
      }
      if (counter.month() !== currentMonth) {
        $(element).addClass('datepicker-fade');
      }
      else { $(element).removeClass('datepicker-fade'); }
      counter.add(1, 'day');
    });
  }

  datepicker.find('.datepicker-day').each(function(index, element) {
    $(element).data('add', index);
  });

  $('#datepicker_month_before').click(function(event) {
    return replaceDates(firstDayOfDatePicker);    
  });
  $('#datepicker_month_after').click(function(event) {
    return replaceDates(firstDayOfDatePicker.add(2, 'month'));    
  });

  $('#datepicker_year_before').click(function(event) {
    return replaceDates(firstDayOfDatePicker.subtract(1, 'year').add(1, 'month'));    
  });
  $('#datepicker_year_after').click(function(event) {
    return replaceDates(firstDayOfDatePicker.add(1, 'year').add(1, 'month'));    
  });

  $('.datepicker-day').click(function(event) {
    if (typeof execute === 'undefined') { return false; }

    var date = firstDayOfDatePicker.clone().add($(this).data('add'), 'days');
    execute(date);
  });

  datepicker.click(function(event) {
    event.stopPropagation();
  });

  return methods;

})();