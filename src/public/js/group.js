

  // Add new Group.
  $('#create_group').click(function(event) {
    $.post('/group/createGroup',
      { groupName: $('#groupName').val() },
      function(res) {
        console.log(res);
      }
    );
  });

  // Add new Person.
  $('#add_person').click(function(event) {
    $.post('/group/addPerson',
      { user: $('#user').val(),
        group: $('#group').val()
      },
      function(res) {
        console.log(res);
      }
    );
  });

  $('#remove_person').click(function(event) {
    $.post('/group/removePerson',
      { user: $('#user').val(),
        group: $('#group').val()
      },
      function(res) {
        console.log(res);
      }
    );
  });