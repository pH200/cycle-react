'use strict';

module.exports = function PlainCustomEvent(type, detail, target) {
  this.type = type;
  this.detail = detail;
  this.target = target;
};
