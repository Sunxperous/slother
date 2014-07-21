(function() {
  'use strict';

  $('#displayname').click(function (event) {
    $('#change_display_name').toggle(function(){}); 
  });

  $('.cal-name').click(function (event) {
    $(this).siblings('.cal-func').toggle(function(){}, function () {
      $(this).css('background-color','#FFF7FF');
      if($(this).is(":hidden"))
        $(this).parents().children('.cal-name').css('background-color','');   
    });
    $('.cal-func').not($(this).siblings('.cal-func')).hide();
      $('.cal-name').not($(this)).css('background-color','');
    $(this).css('background-color','#FFFF00');

  });
  $('.req-reject').click(function (event) {
  });

  $('.req-accept').click(function (event) {
  });

  $('.cal-delete').click(function (event) {
    var temp = $(this);
    $.ajax('/calendar/'+$(this).parents('.cal-func').children()[0].id, {
      type: 'DELETE'
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', calendar.error, $('.cal-delete'));
      console.log(res.success);
      temp.parents()[2].remove();
    });
  });
  
  $('#change_name').click(function (event) {
    $.ajax('/user/displayName', {
      type: 'PUT', data: {disName: $('#display_name').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', calendar.error, $('#change_name'));
      console.log(res.success);
      $('#display_name').parents().children('#displayname').
        children('#profile_value').text($('#display_name').val());
      $('#change_display_name').hide(function(){});  
    });
  });

  $('.cal-change-name').click(function (event) {
    var temp=$(this);
    console.log(temp.parents('.cal-block').children('li.cal-name'));
    // console.log($(this).siblings('.cal-name-input').val());
    $.ajax('calendar/'+$(this).parents('.cal-func').children()[0].id+'/name',{
      type: 'PUT', data: {name:$(this).siblings('.cal-name-input').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', calendar.error, $('.cal-change-name'));
      console.log(res.success);
      temp.parents('.cal-block').children('li.cal-name').
            text(temp.siblings('.cal-name-input').val());
    });
  });
  
  $('.cal-privacy').click(function (event) {
    console.log($(this).siblings('.cal-privacy-type').val());
    if($(this).siblings('.cal-privacy-type').val() == 'Open')
      var temp = false;
    else
      var temp = true;
    console.log(temp);
    $.ajax('calendar/'+$(this).parents('.cal-func').children()[0].id+'/privacy',{
      type: 'PUT', data: {privacy: temp}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', calendar.error, $('.cal-privacy'));
      console.log(res.success);
    });
  });

  $('.group-leave').click(function (event) {
    console.log('/group/'+$(this).siblings()[1].id+'/member/');
    console.log($(this).siblings()[1].id);

    $.ajax('/group/'+$(this).siblings()[1].id+'/member/', {
      type: 'DELETE', data: {user:$('#user').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', calendar.error, $('.group-leave'));
      console.log(res.success);
    });
  });


})();