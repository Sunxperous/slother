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
    var _this = this;
    $.post($(this).siblings('.req-url').val() + 'reject', [], 
      function(response) {
        if (response.error) {
          return errors.add('error', response.error, $(_this));
        }
        $(_this).parent().remove();
      }
    );
  });

  $('.req-accept').click(function(event) {
    var _this = this;
    $.post($(this).siblings('.req-url').val() + 'accept', [],
      function(response) {
        if (response.error) {
          return errors.add('error', response.error, $(_this));
        }

        // Clones the first .hidden li.
        var li = $('#group_info li.hidden').first().clone();

        // Replaces the values.
        li.children('a').text(response.data.groupName).attr('href', response.data.groupUrl);
        li.children('.group-hash').val(response.data.groupHash);

        // Appends to ul.
        li.removeClass('hidden').appendTo($('#group_info ul'));

        // Flashes alert.
        success.add('success', 'You have joined the group.', $(_this));

        // Needs a click event for leave.

        // Remove buttons.
        $(_this).parent().remove();
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
      temp.parents('.cal-block').children('li.cal-name').children('.cal-each-name').
            text(temp.siblings('.cal-name-input').val());
    });
  });
  
  $('.cal-privacy').click(function (event) {
    if($(this).siblings('.cal-privacy-type').val() == 'Open')
      var temp = false;
    else
      var temp = true;
    $.ajax('calendar/'+$(this).parents('.cal-func').children()[0].id+'/privacy',{
      type: 'PUT', data: {privacy: temp}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, $('.cal-privacy'));
      $('#privacy_state').text((temp)?("Private"):(""));
    });
  });

  $('.group-leave').click(function (event) {
    var clicked = $(this);
    $.ajax('/group/'+$(this).siblings('.group-hash').val()+'/leave/', {
      type: 'POST', data: {user:$('#user').val()}
    }).done( function (res) {
      if (res.error) 
        return errors.add('error', res.error, clicked);
      success.add('success', 'You have left the group.', clicked);
      clicked.parent().remove();
    });
  });


})();