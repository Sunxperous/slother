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

  $('.req-reject').click(function(event) {
    $.post($(this).siblings('.req-url').val() + 'reject', [], 
      function(response) {
        console.log(response);
      }
    );
  });

  $('.req-accept').click(function(event) {
    $.post($(this).siblings('.req-url').val() + 'accept', [],
      function(response) {
        console.log(response);
      }
    );
  });

  $('.cal-delete').click(function (event) {
    var temp = $(this);
    $.ajax('/calendar/'+$(this).parents('.cal-func').children()[0].id, {
      type: 'DELETE'
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('.cal-delete'));
      console.log(res.success);
      temp.parents()[2].remove();
    });
  });
  
  $('#change_name').click(function (event) {
    $.ajax('/user/displayName', {
      type: 'PUT', data: {disName: $('#display_name').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('#change_name'));
      console.log(res.success);
      $('#display_name').parents().children('#displayname').
        children('#profile_value').text($('#display_name').val());
      $('#change_display_name').hide(function(){});  
    });
  });

  $('.cal-change-name').click(function (event) {
    var temp=$(this);
    $.ajax('calendar/'+$(this).parents('.cal-func').children()[0].id+'/name',{
      type: 'PUT', data: {name:$(this).siblings('.cal-name-input').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('.cal-change-name'));
      console.log(res.success);
      console.log(temp.siblings('.cal-name-input'));
      temp.parents('.cal-block').children('li.cal-name').children('.cal-each-name').
            text(temp.siblings('.cal-name-input').val());
    });
  });
  
  $('.cal-privacy').click(function (event) {
    if($(this).siblings('.cal-privacy-type').val() == 'Open')
      var temp = false;
    else
      var temp = true;
    console.log(temp);
    $.ajax('calendar/'+$(this).parents('.cal-func').children()[0].id+'/privacy',{
      type: 'PUT', data: {privacy: temp}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('.cal-privacy'));
      console.log(res.success);
      $('#privacy_state').text((temp)?("Private"):(""));
    });
  });

  $('.group-leave').click(function (event) {
    
    $.ajax('/group/'+$(this).siblings()[1].id+'/member/', {
      type: 'DELETE', data: {user:$('#user').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('.group-leave'));
      console.log(res.success);
    });
  });


})();