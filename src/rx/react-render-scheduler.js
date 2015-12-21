var Rx = require('rx');
var inherits = require('inherits');

module.exports = (function MakeReactRenderScheduler(__super__) {
  function ReactRenderScheduler() {
    __super__.call(this);
    this.scheduled = [];
    this._lastId = -1;
    this.isProcessing = false;
    this.scheduledReadySubject = new Rx.Subject();
  }

  inherits(ReactRenderScheduler, __super__);

  function ScheduledDisposable(scheduled, handler) {
    this.scheduled = scheduled;
    this.handler = handler;
    this.isDisposed = false;
    this.hasNew = false;
  }

  ScheduledDisposable.prototype.dispose = function dispose() {
    if (!this.isDisposed) {
      this.isDiposed = true;
      var idx = this.scheduled.indexOf(this.handler);
      if (idx === -1) {
        return;
      }
      this.scheduled.splice(idx, 1);
    }
  };

  ReactRenderScheduler.prototype.runScheduled = function runScheduled() {
    this.isProcessing = true;

    try {
      if (!this.hasNew) {
        return;
      }
      this.hasNew = false;

      var scheduled = this.scheduled;

      // Keep in mind that scheduled actions can be disposed of, or added to while processing
      // in this loop, so we can't use a traditional for loop or rely on stable length.
      while (scheduled.length > 0) {
        var next = scheduled.shift();
        try {
          next();
        } catch (e) {
          console.error(e);
        }
      }

      this.scheduled = [];
    } finally {
      this.isProcessing = false;
    }
  };

  ReactRenderScheduler.prototype.scheduleAction =
    function scheduleAction(disposable, action, scheduler, state) {
      var handler = function schedule() {
        if (!disposable.isDiposed) {
          disposable.setDisposable(Rx.Disposable._fixup(action(scheduler, state)));
        }
      };

      this.scheduled.push(handler);

      this.hasNew = true;
      this.scheduledReadySubject.onNext(++this._lastId);
      return handler;
    };

  ReactRenderScheduler.prototype.schedule = function schedule(state, action) {
    var disposable = new Rx.SingleAssignmentDisposable();
    var handler = this.scheduleAction(disposable, action, this, state);
    var scheduledIdDisposable = new ScheduledDisposable(this.scheduled, handler);

    return Rx.Disposable.create(function dispose() {
      disposable.dispose();
      scheduledIdDisposable.dispose();
    });
  };

  ReactRenderScheduler.prototype._scheduleFuture = function _scheduleFuture(state, dueTime, action) {
    if (dueTime === 0) {
      return this.schedule(state, action);
    }

    var innerDisposable = new Rx.SingleAssignmentDisposable();
    var outerDisposable = new Rx.SingleAssignmentDisposable();

    var self = this;
    var timeoutHandle = setTimeout(function delayedSchedule() {
      var handler = self.scheduleAction(innerDisposable, action, self, state);
      outerDisposable.setDisposable(new ScheduledDisposable(self.scheduled, handler));
    }, dueTime);

    return Rx.Disposable.create(function dispose() {
      innerDisposable.dispose();
      outerDisposable.dispose();
      clearTimeout(timeoutHandle);
    });
  };

  return ReactRenderScheduler;
}(Rx.Scheduler));
