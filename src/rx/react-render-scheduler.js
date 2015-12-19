var Rx = require('rx');
function __extends(d, b) {
  for (var p in b) {
    if (b.hasOwnProperty(p)) {
      d[p] = b[p];
    }
  }
  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

module.exports = (function MakeReactRenderScheduler(__super__) {
  function ReactRenderScheduler() {
    __super__.call(this);
    this.scheduled = {};
    this._lastId = -1;
    this.scheduledReadySubject = new Rx.Subject();
  }

  __extends(ReactRenderScheduler, __super__);

  function ScheduledIdDisposable(scheduled, id) {
    this.scheduled = scheduled;
    this.id = id;
    this.isDisposed = false;
    this.actionDisposable = null;
    this.hasNew = false;
  }

  ScheduledIdDisposable.prototype.dispose = function dispose() {
    if (!this.isDisposed) {
      this.isDiposed = true;
      delete this.scheduled[this.id];
    }
  };

  ReactRenderScheduler.prototype.runScheduled = function runScheduled() {
    if (!this.hasNew) {
      return;
    }
    this.hasNew = false;
    var scheduled = this.scheduled;
    this.scheduled = {};

    // Keep in mind that scheduled actions can be disposed of while processing
    // in this loop
    var keys = Object.keys(scheduled);
    var length = keys.length;
    for (var i = 0; i < length; ++i) {
      var work = scheduled[keys[i]];
      if (work) {
        try {
          work();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  ReactRenderScheduler.prototype.scheduleAction =
    function scheduleAction(disposable, action, scheduler, state, id) {
      this.scheduled[id] = function schedule() {
        if (!disposable.isDiposed) {
          disposable.setDisposable(Rx.Disposable._fixup(action(scheduler, state)));
        }
      };

      this.hasNew = true;
      this.scheduledReadySubject.onNext(id);
    };

  ReactRenderScheduler.prototype.schedule = function schedule(state, action) {
    var id = ++this._lastId;
    var disposable = new Rx.SingleAssignmentDisposable();
    this.scheduleAction(disposable, action, this, state, id);
    var scheduledIdDisposable = new ScheduledIdDisposable(this.scheduled, id);

    return Rx.Disposable.create(function dispose() {
      disposable.dispose();
      scheduledIdDisposable.dispose();
    });
  };

  ReactRenderScheduler.prototype._scheduleFuture = function _scheduleFuture(state, dueTime, action) {
    if (dueTime === 0) {
      return this.schedule(state, action);
    }

    var id = ++this._lastId;
    var disposable = new Rx.SingleAssignmentDisposable();

    var self = this;
    var timeoutHandle = setTimeout(function delayedSchedule() {
      self.scheduleAction(disposable, action, this, state, id);
    }, dueTime);
    var scheduledIdDisposable = new ScheduledIdDisposable(this.scheduled, id);

    return Rx.Disposable.create(function dispose() {
      disposable.dispose();
      scheduledIdDisposable.dispose();
      clearTimeout(timeoutHandle);
    });
  };

  return ReactRenderScheduler;
}(Rx.Scheduler));
