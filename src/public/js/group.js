

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

  // Add new Person.
  $('#accept_request').click(function(event) {
    console.log($('#request_group'));
    $.post('/group/joinGroup',
      {group: $('#request_group').val()},
      function(res) {
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });

  // Send request to join
  $('#add_person').click(function(event) {
    $.post('/group/sendRequest',
      { user: $('#user').val(),
        group: $('#group').val()
      },
      function(res) {
        console.log(res);
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });

  // Remove a member
  $('#remove_person').click(function(event) {
    $.post('/group/removeMember',
      { user: $('#user').val(),
        group: $('#group').val()
      },
      function(res) {
        console.log(res);
        if (typeof res == 'string') {
          $('#response').text(res);
        }
      }
    );
  });