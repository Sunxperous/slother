(function() {
  'use strict';

  $('.req-reject').click(function (event) {
    console.log($(this).siblings());
    
  });

  $('.req-accept').click(function (event) {
    console.log($(this).siblings()[1].id);
    
  });

  $('.cal-delete').click(function (event) {
    console.log($(this).siblings()[0].id);
    $.ajax('/calendar/'+$(this).siblings()[0].id, {
      type: 'DELETE'
    }).done( function (res) {
      location.reload();
      console.log(res.success);
    });
  });
  
  $('.cal-change-name').click(function (event) {
    console.log(event);
    console.log( $(this).siblings().val());
    // $.ajax('calendar/'+$(this).siblings()[0].id+'/name',{
    //   type: 'PUT', data: $(this).siblings()[1].val() 
    // }).done( function (res) {
    //   location.reload();
    //   console.log(res.success);
    // });
  });
  
  $('.cal-privacy').click(function (event) {
    console.log(event);
    console.log($(this).siblings("")[3]);
    console.log($('.cal-privacy-type').val());
  });

  $('.group-leave').click(function (event) {
    console.log('/group/'+$(this).siblings()[1].id+'/member/');
    console.log($(this).siblings()[1].id);

    $.ajax('/group/'+$(this).siblings()[1].id+'/member/', {
      type: 'DELETE', data: {user:$('#user').val()}
    }).done( function (res) {
      console.log(res.success);
    });
  });


})();