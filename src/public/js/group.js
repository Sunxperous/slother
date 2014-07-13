

  // Add new Group.
  $('#create_group').click(function(event) {
    $.post('/group/createGroup',
      {groupName: $('#groupName').val()},
      function(res) {
        console.log(res);
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });

  // Accept Request.
  $('#accept_request').click(function(event) {
    $.post('/group/acceptInvitation',
      {groupName: $('#request_group').val()},
      function(res) {
        console.log(res)
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });

  //Reject Request
  $('#reject_request').click(function(event) {
    $.post('/group/rejectInvitation',
      {groupName: $('#request_group').val()},
      function(res) {
        console.log(res)
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });

  // Send request to join
  $('#add_friend').submit(function(event) {
    event.preventDefault();
    $.post($('#add_friend').attr('action'),
      { username: $('#friend_name').val() },
      function(res) {
        console.log(res);
      }
    );
  });

  // Remove a member
  $('.delete').click(function(event) {
    var username = $(this).siblings('.member-name').text();
    console.log(username);
    // $.ajax('/group/removeMember',
    //   { user: $('#user').val(),
    //     groupName: $('#group').val()
    //   },
    //   function(res) {
    //     console.log(res);
    //     if (typeof res == 'string') {
    //       $('#response').text(res);
    //     }
    //   }
    // );
  });