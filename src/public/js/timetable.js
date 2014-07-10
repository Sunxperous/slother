(function() {

  'use strict';

  var CELL_WIDTH      = 76; // Cell width.
  var CELL_HEIGHT     = 14; // Cell height.
  var RIGHT_DIV_TRIM  = 2;  // Pixels to trim at the right of each item div.
  var DATEPICKER_DATE_FORMAT = "d/m/Y"; 
  var MOMENT_DATE_FORMAT = "DD/MM/YYYY";

  var mock = JSON.parse('[{"summary":"CS2100 (LAB)","description":"Computer Organisation - ClassNo: 14","location":"COM1-0114","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T08:00:00.000Z","2014-01-16T08:00:00.000Z","2014-01-23T08:00:00.000Z"],"dateStart":"2014-01-16T08:00:00.000Z","dateEnd":"2014-01-16T09:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T04:00:00.000Z"],"dateStart":"2014-01-15T04:00:00.000Z","dateEnd":"2014-01-15T06:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T06:00:00.000Z"],"dateStart":"2014-01-16T06:00:00.000Z","dateEnd":"2014-01-16T07:00:00.000Z"},{"summary":"CS2100 (TUT)","description":"Computer Organisation - ClassNo: 13","location":"COM1-0208","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T05:00:00.000Z","2014-01-14T05:00:00.000Z","2014-01-21T05:00:00.000Z"],"dateStart":"2014-01-14T05:00:00.000Z","dateEnd":"2014-01-14T06:00:00.000Z"},{"summary":"CS2100 (EXAM)","description":"Computer Organisation","rrule":{"freq":"ONCE"},"dateStart":"2014-04-29T01:00:00.000Z","dateEnd":"2014-04-29T04:00:00.000Z"},{"summary":"HY2242 (LECT)","description":"Singapore\'s Military History - ClassNo: 1","location":"AS4-0206","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T02:00:00.000Z"],"dateStart":"2014-01-13T02:00:00.000Z","dateEnd":"2014-01-13T04:00:00.000Z"},{"summary":"HY2242 (LECT)","description":"Singapore\'s Military History - ClassNo: 1","location":"AS4-0206","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T04:00:00.000Z"],"dateStart":"2014-01-16T04:00:00.000Z","dateEnd":"2014-01-16T06:00:00.000Z"},{"summary":"HY2242 (TUT)","description":"Singapore\'s Military History - ClassNo: W1","location":"AS1-0204","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T02:00:00.000Z","2014-01-13T02:00:00.000Z","2014-01-20T02:00:00.000Z"],"dateStart":"2014-01-13T02:00:00.000Z","dateEnd":"2014-01-13T04:00:00.000Z"},{"summary":"HY2242 (EXAM)","description":"Singapore\'s Military History","rrule":{"freq":"ONCE"},"dateStart":"2014-05-07T01:00:00.000Z","dateEnd":"2014-05-07T04:00:00.000Z"},{"summary":"GEK1008 (LECT)","description":"Southeast Asia: A Changing Region - ClassNo: 1","location":"UT-AUD1","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-28T06:00:00.000Z"],"dateStart":"2014-01-17T06:00:00.000Z","dateEnd":"2014-01-17T08:00:00.000Z"},{"summary":"GEK1008 (TUT)","description":"Southeast Asia: A Changing Region - ClassNo: D18","location":"ERC-SR11","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-04-11T08:00:00.000Z","2014-02-07T08:00:00.000Z","2014-02-21T08:00:00.000Z","2014-02-28T08:00:00.000Z","2014-01-17T08:00:00.000Z","2014-01-24T08:00:00.000Z","2014-03-14T08:00:00.000Z","2014-03-28T08:00:00.000Z"],"dateStart":"2014-01-17T08:00:00.000Z","dateEnd":"2014-01-17T10:00:00.000Z"},{"summary":"GEK1008 (EXAM)","description":"Southeast Asia: A Changing Region","rrule":{"freq":"ONCE"},"dateStart":"2014-04-28T05:00:00.000Z","dateEnd":"2014-04-28T08:00:00.000Z"},{"summary":"SSA1201 (LECT)","description":"Singapore Society - ClassNo: 1","location":"LT11","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T08:00:00.000Z"],"dateStart":"2014-01-13T08:00:00.000Z","dateEnd":"2014-01-13T10:00:00.000Z"},{"summary":"SSA1201 (TUT)","description":"Singapore Society - ClassNo: E1","location":"AS1-0204","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-04-02T08:00:00.000Z","2014-04-16T08:00:00.000Z","2014-02-12T08:00:00.000Z","2014-02-26T08:00:00.000Z","2014-01-15T08:00:00.000Z","2014-01-22T08:00:00.000Z","2014-01-29T08:00:00.000Z","2014-03-05T08:00:00.000Z","2014-03-19T08:00:00.000Z"],"dateStart":"2014-01-15T08:00:00.000Z","dateEnd":"2014-01-15T10:00:00.000Z"},{"summary":"SSA1201 (EXAM)","description":"Singapore Society","rrule":{"freq":"ONCE"},"dateStart":"2014-04-30T01:00:00.000Z","dateEnd":"2014-04-30T04:00:00.000Z"},{"summary":"CS1010 (SEC)","description":"Programming Methodology - ClassNo: 1","location":"i3-0345","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T02:00:00.000Z"],"dateStart":"2014-01-14T02:00:00.000Z","dateEnd":"2014-01-14T05:00:00.000Z"},{"summary":"CS1010 (TUT)","description":"Programming Methodology - ClassNo: 2","location":"COM1-B108","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-28T04:00:00.000Z","2014-01-17T04:00:00.000Z","2014-01-24T04:00:00.000Z"],"dateStart":"2014-01-17T04:00:00.000Z","dateEnd":"2014-01-17T06:00:00.000Z"},{"summary":"CS1010 (EXAM)","description":"Programming Methodology","rrule":{"freq":"ONCE"},"dateStart":"2014-04-30T09:00:00.000Z","dateEnd":"2014-04-30T12:00:00.000Z"}]');
  var mock2 = JSON.parse('[{"summary":"MA1101R (LECT)","description":"Linear Algebra I - ClassNo: SL1","location":"LT25","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T08:00:00.000Z"],"dateStart":"2014-01-13T08:00:00.000Z","dateEnd":"2014-01-13T10:00:00.000Z"},{"summary":"MA1101R (LECT)","description":"Linear Algebra I - ClassNo: SL1","location":"LT25","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T08:00:00.000Z"],"dateStart":"2014-01-16T08:00:00.000Z","dateEnd":"2014-01-16T10:00:00.000Z"},{"summary":"MA1101R (TUT)","description":"Linear Algebra I - ClassNo: T03","location":"S16-0433","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T01:00:00.000Z","2014-01-15T01:00:00.000Z","2014-01-22T01:00:00.000Z"],"dateStart":"2014-01-15T01:00:00.000Z","dateEnd":"2014-01-15T02:00:00.000Z"},{"summary":"MA1101R (EXAM)","description":"Linear Algebra I","rrule":{"freq":"ONCE"},"dateStart":"2014-05-05T05:00:00.000Z","dateEnd":"2014-05-05T08:00:00.000Z"},{"summary":"IS1103 (SEC)","description":"Computing and Society - ClassNo: 3","location":"COM1-B103","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T01:00:00.000Z"],"dateStart":"2014-01-13T01:00:00.000Z","dateEnd":"2014-01-13T04:00:00.000Z"},{"summary":"IS1103 (EXAM)","description":"Computing and Society","rrule":{"freq":"ONCE"},"dateStart":"2014-05-02T06:00:00.000Z","dateEnd":"2014-05-02T09:00:00.000Z"},{"summary":"CS2105 (LECT)","description":"Introduction to Computer Networks - ClassNo: 1","location":"LT15","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T06:00:00.000Z"],"dateStart":"2014-01-13T06:00:00.000Z","dateEnd":"2014-01-13T08:00:00.000Z"},{"summary":"CS2105 (TUT)","description":"Introduction to Computer Networks - ClassNo: 4","location":"COM1-0207","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T05:00:00.000Z","2014-01-14T05:00:00.000Z","2014-01-21T05:00:00.000Z"],"dateStart":"2014-01-14T05:00:00.000Z","dateEnd":"2014-01-14T06:00:00.000Z"},{"summary":"CS2105 (EXAM)","description":"Introduction to Computer Networks","rrule":{"freq":"ONCE"},"dateStart":"2014-04-30T01:00:00.000Z","dateEnd":"2014-04-30T04:00:00.000Z"},{"summary":"CS2100 (LAB)","description":"Computer Organisation - ClassNo: 13","location":"COM1-0114","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T04:00:00.000Z","2014-01-16T04:00:00.000Z","2014-01-23T04:00:00.000Z"],"dateStart":"2014-01-16T04:00:00.000Z","dateEnd":"2014-01-16T05:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T04:00:00.000Z"],"dateStart":"2014-01-15T04:00:00.000Z","dateEnd":"2014-01-15T06:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T06:00:00.000Z"],"dateStart":"2014-01-16T06:00:00.000Z","dateEnd":"2014-01-16T07:00:00.000Z"},{"summary":"CS2100 (TUT)","description":"Computer Organisation - ClassNo: 14","location":"COM1-0203","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T04:00:00.000Z","2014-01-14T04:00:00.000Z","2014-01-21T04:00:00.000Z"],"dateStart":"2014-01-14T04:00:00.000Z","dateEnd":"2014-01-14T05:00:00.000Z"},{"summary":"CS2100 (EXAM)","description":"Computer Organisation","rrule":{"freq":"ONCE"},"dateStart":"2014-04-29T01:00:00.000Z","dateEnd":"2014-04-29T04:00:00.000Z"},{"summary":"CS2010 (LAB)","description":"Data Structures and Algorithms II - ClassNo: 2","location":"COM1-B109","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T07:00:00.000Z","2014-01-14T07:00:00.000Z","2014-01-21T07:00:00.000Z"],"dateStart":"2014-01-14T07:00:00.000Z","dateEnd":"2014-01-14T08:00:00.000Z"},{"summary":"CS2010 (LECT)","description":"Data Structures and Algorithms II - ClassNo: 1","location":"LT19","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T02:00:00.000Z"],"dateStart":"2014-01-16T02:00:00.000Z","dateEnd":"2014-01-16T04:00:00.000Z"},{"summary":"CS2010 (TUT)","description":"Data Structures and Algorithms II - ClassNo: 3","location":"COM1-0208","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T03:00:00.000Z","2014-01-15T03:00:00.000Z","2014-01-22T03:00:00.000Z"],"dateStart":"2014-01-15T03:00:00.000Z","dateEnd":"2014-01-15T04:00:00.000Z"},{"summary":"CS2010 (EXAM)","description":"Data Structures and Algorithms II","rrule":{"freq":"ONCE"},"dateStart":"2014-04-28T09:00:00.000Z","dateEnd":"2014-04-28T12:00:00.000Z"}]');
  var mock3 = JSON.parse('[{"summary":"IS2101 (LECT)","description":"Business and Technical Communication - ClassNo: 1","location":"VCRm","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T06:00:00.000Z"],"dateStart":"2014-01-14T06:00:00.000Z","dateEnd":"2014-01-14T07:00:00.000Z"},{"summary":"IS2101 (TUT)","description":"Business and Technical Communication - ClassNo: 5","location":"COM1-0201","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T01:00:00.000Z","2014-01-15T01:00:00.000Z","2014-01-22T01:00:00.000Z"],"dateStart":"2014-01-15T01:00:00.000Z","dateEnd":"2014-01-15T04:00:00.000Z"},{"summary":"IS2104 (LECT)","description":"Software Team Dynamics - ClassNo: 1","location":"COM1-0204","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T04:00:00.000Z"],"dateStart":"2014-01-13T04:00:00.000Z","dateEnd":"2014-01-13T07:00:00.000Z"},{"summary":"IS2104 (EXAM)","description":"Software Team Dynamics","rrule":{"freq":"ONCE"},"dateStart":"2014-05-06T09:00:00.000Z","dateEnd":"2014-05-06T12:00:00.000Z"},{"summary":"MA1312 (LECT)","description":"Calculus with Applications - ClassNo: SL1","location":"UT-AUD2","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T02:00:00.000Z"],"dateStart":"2014-01-13T02:00:00.000Z","dateEnd":"2014-01-13T04:00:00.000Z"},{"summary":"MA1312 (LECT)","description":"Calculus with Applications - ClassNo: SL1","location":"UT-AUD2","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T02:00:00.000Z"],"dateStart":"2014-01-16T02:00:00.000Z","dateEnd":"2014-01-16T04:00:00.000Z"},{"summary":"MA1312 (TUT)","description":"Calculus with Applications - ClassNo: T01","location":"ERC-SR3","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T01:00:00.000Z","2014-01-13T01:00:00.000Z","2014-01-20T01:00:00.000Z"],"dateStart":"2014-01-13T01:00:00.000Z","dateEnd":"2014-01-13T02:00:00.000Z"},{"summary":"MA1312 (EXAM)","description":"Calculus with Applications","rrule":{"freq":"ONCE"},"dateStart":"2014-04-30T05:00:00.000Z","dateEnd":"2014-04-30T08:00:00.000Z"},{"summary":"CS2100 (LAB)","description":"Computer Organisation - ClassNo: 7","location":"COM1-0114","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T07:00:00.000Z","2014-01-13T07:00:00.000Z","2014-01-20T07:00:00.000Z"],"dateStart":"2014-01-13T07:00:00.000Z","dateEnd":"2014-01-13T08:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T04:00:00.000Z"],"dateStart":"2014-01-15T04:00:00.000Z","dateEnd":"2014-01-15T06:00:00.000Z"},{"summary":"CS2100 (LECT)","description":"Computer Organisation - ClassNo: 1","location":"i3-Aud","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T06:00:00.000Z"],"dateStart":"2014-01-16T06:00:00.000Z","dateEnd":"2014-01-16T07:00:00.000Z"},{"summary":"CS2100 (TUT)","description":"Computer Organisation - ClassNo: 14","location":"COM1-0203","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T04:00:00.000Z","2014-01-14T04:00:00.000Z","2014-01-21T04:00:00.000Z"],"dateStart":"2014-01-14T04:00:00.000Z","dateEnd":"2014-01-14T05:00:00.000Z"},{"summary":"CS2100 (EXAM)","description":"Computer Organisation","rrule":{"freq":"ONCE"},"dateStart":"2014-04-29T01:00:00.000Z","dateEnd":"2014-04-29T04:00:00.000Z"}]');
  var mock4 = JSON.parse('[{"summary":"PC1432 (LAB)","description":"Physics IIE - ClassNo: A01","location":"S11-0302","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T01:00:00.000Z","2014-01-15T01:00:00.000Z","2014-01-22T01:00:00.000Z"],"dateStart":"2014-01-15T01:00:00.000Z","dateEnd":"2014-01-15T04:00:00.000Z"},{"summary":"PC1432 (LECT)","description":"Physics IIE - ClassNo: 1","location":"LT6","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T06:00:00.000Z"],"dateStart":"2014-01-15T06:00:00.000Z","dateEnd":"2014-01-15T08:00:00.000Z"},{"summary":"PC1432 (LECT)","description":"Physics IIE - ClassNo: 1","location":"LT7","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-28T01:00:00.000Z"],"dateStart":"2014-01-17T01:00:00.000Z","dateEnd":"2014-01-17T02:00:00.000Z"},{"summary":"PC1432 (TUT)","description":"Physics IIE - ClassNo: A06","location":"E1-06-06","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T08:00:00.000Z","2014-01-13T08:00:00.000Z","2014-01-20T08:00:00.000Z"],"dateStart":"2014-01-13T08:00:00.000Z","dateEnd":"2014-01-13T09:00:00.000Z"},{"summary":"PC1432 (EXAM)","description":"Physics IIE","rrule":{"freq":"ONCE"},"dateStart":"2014-05-02T01:00:00.000Z","dateEnd":"2014-05-02T04:00:00.000Z"},{"summary":"MA1506 (LAB)","description":"Mathematics II - ClassNo: LC1","location":"S17-0302","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T06:00:00.000Z","2014-01-13T06:00:00.000Z","2014-01-20T06:00:00.000Z"],"dateStart":"2014-01-13T06:00:00.000Z","dateEnd":"2014-01-13T07:00:00.000Z"},{"summary":"MA1506 (LECT)","description":"Mathematics II - ClassNo: A","location":"UT-AUD1","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T00:00:00.000Z"],"dateStart":"2014-01-13T00:00:00.000Z","dateEnd":"2014-01-13T02:00:00.000Z"},{"summary":"MA1506 (LECT)","description":"Mathematics II - ClassNo: A","location":"UT-AUD1","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-26T08:00:00.000Z"],"dateStart":"2014-01-15T08:00:00.000Z","dateEnd":"2014-01-15T09:00:00.000Z"},{"summary":"MA1506 (TUT)","description":"Mathematics II - ClassNo: A06","location":"ERC-SR10","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T01:00:00.000Z","2014-01-14T01:00:00.000Z","2014-01-21T01:00:00.000Z"],"dateStart":"2014-01-14T01:00:00.000Z","dateEnd":"2014-01-14T02:00:00.000Z"},{"summary":"MA1506 (EXAM)","description":"Mathematics II","rrule":{"freq":"ONCE"},"dateStart":"2014-04-26T01:00:00.000Z","dateEnd":"2014-04-26T04:00:00.000Z"},{"summary":"LAK1201 (LECT)","description":"Korean 1 - ClassNo: 5","location":"ERC-SR2","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T08:00:00.000Z"],"dateStart":"2014-01-14T08:00:00.000Z","dateEnd":"2014-01-14T10:00:00.000Z"},{"summary":"LAK1201 (LECT)","description":"Korean 1 - ClassNo: 5","location":"ERC-SR3","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-28T08:00:00.000Z"],"dateStart":"2014-01-17T08:00:00.000Z","dateEnd":"2014-01-17T10:00:00.000Z"},{"summary":"LAK1201 (TUT)","description":"Korean 1 - ClassNo: T9","location":"AS1-0207","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-28T06:00:00.000Z","2014-01-17T06:00:00.000Z","2014-01-24T06:00:00.000Z"],"dateStart":"2014-01-17T06:00:00.000Z","dateEnd":"2014-01-17T08:00:00.000Z"},{"summary":"ES2331 (SEC)","description":"Communicating Engineering - ClassNo: G21","location":"E1-06-16","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-24T04:00:00.000Z"],"dateStart":"2014-01-13T04:00:00.000Z","dateEnd":"2014-01-13T06:00:00.000Z"},{"summary":"ES2331 (SEC)","description":"Communicating Engineering - ClassNo: G21","location":"E3-06-11","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T05:00:00.000Z"],"dateStart":"2014-01-16T05:00:00.000Z","dateEnd":"2014-01-16T07:00:00.000Z"},{"summary":"EG1109 (LECT)","description":"Statics And Mechanics Of Materials - ClassNo: 1","location":"LT7","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T06:00:00.000Z"],"dateStart":"2014-01-14T06:00:00.000Z","dateEnd":"2014-01-14T08:00:00.000Z"},{"summary":"EG1109 (LECT)","description":"Statics And Mechanics Of Materials - ClassNo: 1","location":"LT7","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-27T02:00:00.000Z"],"dateStart":"2014-01-16T02:00:00.000Z","dateEnd":"2014-01-16T03:00:00.000Z"},{"summary":"EG1109 (TUT)","description":"Statics And Mechanics Of Materials - ClassNo: A06","location":"E2-03-02","rrule":{"freq":"WEEKLY","count":14},"exclude":["2014-02-25T03:00:00.000Z","2014-01-14T03:00:00.000Z","2014-01-21T03:00:00.000Z"],"dateStart":"2014-01-14T03:00:00.000Z","dateEnd":"2014-01-14T04:00:00.000Z"},{"summary":"EG1109 (EXAM)","description":"Statics And Mechanics Of Materials","rrule":{"freq":"ONCE"},"dateStart":"2014-05-05T01:00:00.000Z","dateEnd":"2014-05-05T04:00:00.000Z"}]');

  var now = moment();
  now = moment("2014-01-13").add(2, 'weeks'); // For testing purpose, set to 3rd week of 2013-14Sem2.

  var sunOfWeek = now.subtract(now.day(), 'days');
  var satOfWeek = moment(sunOfWeek).add(6, 'days');

  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var users = [];

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
    satOfWeek = moment(sunOfWeek).add(6, 'days');
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

  // popupStatus status
  var popupStatuses = {
    HIDDEN: 0,
    READ_ONLY: 1,
    EDITABLE: 2
  }
  var popupStatus = popupStatuses.HIDDEN;
  // Close popup when outside is clicked.
  $('#popup_wrapper').click(function closePopup(event) {
    if (popupStatus !== popupStatuses.READ_ONLY) { return; }
    if ($(event.target).attr('id') !== 'popup_wrapper') { return; }
    $('#popup_wrapper').addClass('hidden');
    popupStatus = popupStatuses.HIDDEN;
  });
  // Close popup when X is clicked.
  $('#popup_close').click(function closePopup(event) {
    if (popupStatus === popupStatuses.HIDDEN) { return; }
    $('#popup_wrapper').addClass('hidden');
    popupStatus = popupStatuses.HIDDEN;
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
      $('#existing .rruleFreq').text(item.rrule.freq.toLowerCase());
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

    $('#edit_event').unbind('click');
    $('#edit_event').click(function editEvent(event) {
      displayEditablePopup({
        popup_title: 'Edit event',
        event_id: item._id,
        calendar_id: calendar_id,
        summary: item.summary,
        description: item.description,
        location: item.location,
        date_start: exactDateStart.format(MOMENT_DATE_FORMAT),
        date_end: exactDateEnd.format(MOMENT_DATE_FORMAT),
        time_start: exactDateStart.format("HH:mm"),
        time_end: exactDateEnd.add(1, 'hour').format("HH:mm"),
        rrule_freq: item.rrule.freq.toLowerCase(),
        rrule_count: item.rrule.count ? item.rrule.count : 1
      })
    });
  }

  // Display editable popup.
  //   Input: event object with the following parameters:
  function displayEditablePopup(item) {
    popupStatus = popupStatuses.EDITABLE;
    Object.keys(item).forEach(function(key) {
      var element = $('#' + key);
      if (element[0].tagName === 'INPUT') {
        element.val(item[key]);
      }
      else if (element[0].tagName === 'SELECT') {
        element.val(item[key]);
      }
      else {
        element.text(item[key]);
      }
    });

    if ($('#rrule_freq').val() === 'once') {
      $('#rrule_count').prop('disabled', true);
    }
    else { $('#rrule_count').removeAttr('disabled'); }

    $('#existing').addClass('hidden');
    $('#new').removeClass('hidden');
    $('#popup_wrapper').removeClass('hidden');
  }

  // Rrule count toggler.
  $('#rrule_freq').change(function(event) {
    if ($('#rrule_freq').val() === 'once') {
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
      popup_title: 'Add event',
      event_id: '',
      summary: '',
      description: '',
      location: '',
      date_start: date.format(MOMENT_DATE_FORMAT),
      date_end: date.format(MOMENT_DATE_FORMAT),
      time_start: date.format("HH:mm"),
      time_end: date.add(1, 'hour').format("HH:mm"),
      rrule_freq: 'once',
      rrule_count: 1
    })
  });

  // Sending event to server.
  $('#event_details').submit(function(event) {
    event.preventDefault();
    var dateStart = moment(
      $('#date_start').val() + $('#time_start').val(),
      MOMENT_DATE_FORMAT + "HH:mm");
    var dateEnd = moment(
      $('#date_end').val() + $('#time_end').val(),
      MOMENT_DATE_FORMAT + "HH:mm");
    var sending = {};
    var directCopies = ['event_id', 'calendar_id', 'summary', 'description', 'location', 'rrule_freq', 'rrule_count'];
    directCopies.forEach(function(field) {
      var element = $('#' + field);
      if (element[0].tagName !== 'TEXTAREA' && element.val()) {
        sending[field] = element.val();
      }
      else { // TEXTAREA: just send description even if empty.
        sending[field] = element.text();
      }
    });
    sending['date_start'] = dateStart.format();
    sending['date_end'] = dateEnd.format();

    // Validate here.
    
    $.post('/calendar/event', sending, function(response) {
      console.log(repsonse);
    });
  });


  var Calendar = (function() {

    function Calendar(owner, calendar) {
      this._id = calendar._id;
      this.name = calendar.name || "NUSMods"; // Temporary.
      this.items = calendar.events;
      this.owner = owner;
      this.show = true;
      this.color = Please.make_color({
        golden: true,
        saturation: .2,
        value: 1
      });
      this.onDisplay = [];
      this.display();
      this.appendToLists(); // Append to popup select and calendars display.
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
          .css('color', this.color);
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

    function toggleView(event) {
      var status = event.data.toggleView();
      $(this).text(status ? 'hide' : 'show');
    }

    Calendar.prototype.replaceItems = function(items) {
      this.items = items;
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

      // If start event date is after Saturday, it hasn't started.
      if (date.isAfter(satOfWeek)) {
        return null;
      }

      switch (item.rrule.freq) {
        case 'ONCE':
          // Simple.
          if (date.isAfter(sunOfWeek) && date.isBefore(satOfWeek)) {
            return date;
          }
          break;
        case 'WEEKLY':
          // If end event date is before Sunday, it is over.
          // var endDate = date.clone().add(item.rrule.count - 1, 'weeks');
          // if (endDate.isBefore(sunOfWeek)) { return null; }
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
          return date;
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
      //var durationInHours = dateEnd.diff(dateStart, 'h');

      var div = $('<div>');
      var width = durationInHours * CELL_WIDTH;
      div.width(width - RIGHT_DIV_TRIM)
        .css('background-color', calendar.color)
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

      calendars.forEach(function(calendar) {
        _this.calendars[calendar._id] = new Calendar(this, calendar);
      });

      if (control) {
        this.applyFormTriggers();
      }
    }

    User.prototype.getName = function() { return this.name; };

    User.prototype.clear = function() {
      Object.keys(this.calendars).foreach(function(calendar) {
        calendar.clear();
      });
    };
    User.prototype.refresh = function() {
      Object.keys(this.calendars).foreach(function(calendar) {
        calendar.display();
      });
    };

    User.prototype.applyFormTriggers = function() {
      var _this = this;
      // Add NUSMods address.
      $('#add_calendar').submit(function(event) {
        event.preventDefault();
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
      });
    }

    return User;
  })();

  // Scrolls immediately to 7:00am.
  //   Limit the scrolling for screens with large width.
  $('.tableWrapper').scrollLeft(7 * CELL_WIDTH + 1);

  // Temporary solution for different colours.
  var colors = ['#f99', '#9f9', '#99f', '#61a0a0', '#f2eda7', '#a6d4e0', '#3ea1bb', '#ff8700', '#b6965c', '#bfc0c0'];
  
  var pathname = window.location.pathname;
  if (pathname !== '/calendar') { // If group timetable...
    var groupName = pathname.substr(pathname.lastIndexOf('/') + 1, pathname.length);
    $.getJSON('/group/calendar',
      { groupName: groupName },
      function(res) {
        // Array of objects { username, events }. 
        var rand = Math.floor(Math.random() * 7);
        res.forEach(function(user, index) {
          users.push(new User(user.username, user.events, colors[index + rand], false));
        })
      }
    );
  }
  else { // If not group timetable...
    // Adds logged in user (via greeting message).
    $.getJSON('/user/calendar', function(calendars) {
      users.push(new User($('#username').text(), calendars, true));
    });
  }

  // Temporary.
  // users.push(new User('Mock2', mock2, '#ccccff'));
  // users.push(new User('Mock3', mock3, '#cccc99'));
  // users.push(new User('Mock', mock, '#ccffcc'));
  // users.push(new User('Mock4', mock4, '#99cccc'));

})();

/*
HY2242,SSA1201,CS2100,GEK1008,CS1010
http://nusmods.com/2013-2014/sem2/v1/#HY2242=21&SSA1201=21&HY2242=8W1&CS1010=61&CS2100=813&CS2100=21&SSA1201=8E1&HY2242=21&CS2100=21&CS2100=114&CS1010=82&GEK1008=21&GEK1008=8D18

CS2010,CS2105,MA1101R,CS2100,IS1103
http://nusmods.com/2013-2014/sem2/v1/#IS1103=63&CS2105=21&MA1101R=2SL1&CS2100=814&CS2105=84&CS2010=12&MA1101R=8T03&CS2010=83&CS2100=21&CS2010=21&CS2100=113&CS2100=21&MA1101R=2SL1

NM1101E,SSA1207,MA1101R,CS2020,CS2100
http://nusmods.com/2013-2014/sem2/v1/#NM1101E=21&MA1101R=8T09&MA1101R=2SL1&CS2020=82&CS2100=813&SSA1207=21&SSA1207=8E1&CS2020=21&CS2100=21&NM1101E=8W10&CS2100=112&CS2100=21&MA1101R=2SL1&CS2020=21&CS2020=52

PR1102,PY1106,SSS1207,LAJ3201,LSM1401
http://nusmods.com/2013-2014/sem2/v1/#PY1106=2SL1&PR1102=2SL1&SSS1207=2SL1&PR1102=1SB1&LAJ3201=8A1&LSM1401=2SL1&LSM1401=1WP1&PY1106=2SL1&PR1102=2SL1&LAJ3201=9B3&SSS1207=2SL1&LAJ3201=21&PY1106=8ST1&LSM1401=2SL1&LAJ3201=AC3

http://nusmods.com/2013-2014/sem2/v1/#MA1506=2A&ES2331=6G21&MA1506=1LC1&PC1432=8A06&MA1506=8A06&EG1109=8A06&EG1109=21&LAK1201=25&PC1432=1A01&PC1432=21&MA1506=2A&EG1109=21&ES2331=6G21&PC1432=21&LAK1201=8T9&LAK1201=25
*/
