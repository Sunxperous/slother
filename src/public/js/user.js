(function() {
  'use strict';

  // $('#("cal:"+calendar.id)').click( function (event) {
  //   console.log("Click works.");
  // });

  $('.delete').click(function (event) {
    console.log(event);
    console.log($(this).siblings());
    alert("submited");
  });


})();