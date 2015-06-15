'use strict';

module.exports = function PlainCustomEvent(type, detail) {
  this.type = type;
  this.detail = detail;
};
