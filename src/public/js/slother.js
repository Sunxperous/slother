'use strict';

var errors = (function() {
  var errorBoxes = [];
  var error = {
    parse: function() {
      $('.error_box').each(function(index, element) {
        var errorBox = new ErrorBox(element);
        errorBoxes.push(errorBox);
      });
    },
    add: function(type, message, source) {
      var stop = 10;
      while (source.find('.error_box').first().length === 0
        && !$('body').is(source)
        && typeof source !== 'undefined'
        && stop > 0
      ) {
        stop--;
        source = source.parent();
      }
      var errorBox = source.find('.error_box').first();
      errorBoxes.forEach(function(savedBox) {
        if (errorBox.is(savedBox.errorBox)) {
          savedBox.add(type, message);
        }
      });
      return this;
    },
    clear: function(source) {
      var stop = 10;
      while (source.find('.error_box').first().length === 0
        && !$('body').is(source)
        && typeof source !== 'undefined'
        && stop > 0
      ) {
        stop--;
        source = source.parent();
      }
      var errorBox = source.find('.error_box').first();
      errorBoxes.forEach(function(savedBox) {
        if (errorBox.is(savedBox.errorBox)) {
          savedBox.dismissAll().hide();
        }
      });
      return this;
    }
  };

  var ErrorMessage = (function() {
    function ErrorMessage(type, message, li) {
      this.type = type;
      this.message = message;
      if (li) { this.li = li; }
    }

    return ErrorMessage;
  })();

  var ErrorBox = (function() {
    function ErrorBox(element) {
      this.errorBox = $(element);
      this.errorMessages = [];

      this.parse();
    }

    function dismissErrorBox(event) {
      event.data.dismissAll();
    }

    ErrorBox.prototype.show = function() {
      this.errorBox.removeClass('hidden');
      return this;
    };
    ErrorBox.prototype.hide = function() {
      this.errorBox.addClass('hidden');
      return this;
    };
    ErrorBox.prototype.dismissAll = function() {
      this.errorBox.find('.errors li').remove();
      this.errorMessages = [];
      this.hide();
      return this;
    };
    ErrorBox.prototype.parse = function() {
      var _this = this;
      this.errorBox.find('.errors li').each(function(index, element) {
        var type = 'error'; 
        var li = $(element);
        if (li.hasClass('error')) { type = 'error'; }
        else if (li.hasClass('request')) { type = 'request'; }
        else if (li.hasClass('alert')) { type = 'alert'; }
        else if (li.hasClass('success')) { type = 'success'; }
        var newError = new ErrorMessage(type, li.text(), li);
        _this.errorMessages.push(newError);
      });
      if (this.errorMessages.length > 0) { this.show(); }

      this.errorBox.children('.dismiss').click(this, dismissErrorBox);
    };
    ErrorBox.prototype.add = function(type, message) {
      var newError = new ErrorMessage(type, message);
      this.errorMessages.push(newError);
      var li = '<li class="' + type + '">' + message + '</li>';
      this.errorBox.children('.errors').append(li);
      if (this.errorMessages.length > 0) { this.show(); }
      return this;
    };

    return ErrorBox;
  })();

  $(document).ready(function() {
    error.parse();
  });

  return error;
})();

var alerts = errors, success = errors, requests = errors;

$(document).ready(function() {
  $('.confirm').each(function(index, element) {
    var value = $(element).val();
    var id = $(element).attr('id');

    var replacement = '<input type="button" value="' + value + '" class="red replaced">';
    $(element).wrap('<div class="confirm-block hidden"></div>');
    var cancel = '<input type="button" value="Cancel" class="grey cancel">';
    $(element).after(cancel);
    $(element).parent().before(replacement);

    $(element).val('Confirm');

    var replacementElement = $(element).parent().siblings('.replaced').eq(0);
    replacementElement.click(function() {
      $(element).parent().toggleClass('hidden');
      $(this).attr('disabled', true);
    });
    $(element).siblings('.cancel').click(function() {
      $(element).parent().addClass('hidden');
      replacementElement.removeAttr('disabled');
    })
  });

  $('#logout_link').click(function(event) {
    event.preventDefault();
    $('#logout_post').submit();
  });
});
