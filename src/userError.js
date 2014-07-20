function UserError(message) {
  this.message = message || "What went wrong...?";
  this.stack = (new Error()).stack;
}
UserError.prototype = new Error;
UserError.prototype.name = "UserError";
UserError.prototype.constructor = UserError;

module.exports = UserError;