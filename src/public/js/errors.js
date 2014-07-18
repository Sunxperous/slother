var errors = (function() {
  'use strict';

  var errorBoxes = [];
  var error = {
    parse: function() {
      $('.error_box').each(function(index, element) {
        var errorBox = new ErrorBox(element);
        errorBoxes.push(errorBox);
      });
    },
    add: function(type, message, source) {
      while (source.find('.error_box').first().length === 0 || $('body').is(source)) {
        source = source.parent();
      }
      var errorBox = source.find('.error_box').first();
      errorBoxes.forEach(function(savedBox) {
        if (errorBox.is(savedBox.errorBox)) {
          savedBox.add(type, message);
        }
      });
    },
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
    };
    ErrorBox.prototype.hide = function() {
      this.errorBox.addClass('hidden');
    };
    ErrorBox.prototype.dismissAll = function() {
      this.errorBox.find('.errors li').remove();
      this.errorMessages = [];
      this.hide();
    };
    ErrorBox.prototype.parse = function() {
      var _this = this;
      this.errorBox.find('.errors li').each(function(index, element) {
        var type = 'error'; 
        var li = $(element);
        if (li.hasClass('error')) { type = 'error'; }
        else if (li.hasClass('request')) { type = 'request'; }
        else if (li.hasClass('alert')) { type = 'alert'; }
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
    };

    return ErrorBox;
  })();

  $(document).ready(function() {
    error.parse();
  });

  return error;
})();