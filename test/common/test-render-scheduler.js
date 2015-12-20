'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let ReactRenderScheduler = require('../../src/rx/react-render-scheduler');

describe('ReactRenderScheduler', function () {
  describe('#scheduleFuture', function () {
    it('when the delay is 0, it is synchronous', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      scheduler.scheduleFuture(null, 0, function () {
        invoked.push(1);
      });
      scheduler.scheduleFuture(null, 0, function () {
        invoked.push(2);
      });

      assert.deepEqual(invoked, []);
      scheduler.runScheduled();
      assert.deepEqual(invoked, [1, 2]);
    });

    it('when the delay is > 0, it will wait that given time, then schedule the item', function (done) {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      scheduler.scheduleFuture(null, 10, function () {
        invoked.push(1);
      });
      scheduler.scheduleFuture(null, 20, function () {
        invoked.push(2);
      });

      assert.deepEqual(invoked, []);
      scheduler.runScheduled();
      assert.deepEqual(invoked, []);

      setTimeout(function () {
        scheduler.runScheduled();
        assert.deepEqual(invoked, [1]);
      }, 10);

      setTimeout(function () {
        scheduler.runScheduled();
        assert.deepEqual(invoked, [1, 2]);
        done();
      }, 20);
    });

    it('scheduleFuture can be disposed before the timeout, or during a render loop', function (done) {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      let disposable1;
      let disposable2;

      scheduler.scheduleFuture(null, 10, function () {
        invoked.push(1);
        disposable1.dispose();
      });
      disposable1 = scheduler.scheduleFuture(null, 10, function () {
        invoked.push(2);
      });
      disposable2 = scheduler.scheduleFuture(null, 20, function () {
        invoked.push(3);
      });
      disposable2.dispose();

      assert.deepEqual(invoked, []);
      scheduler.runScheduled();
      assert.deepEqual(invoked, []);

      setTimeout(function () {
        scheduler.runScheduled();
        assert.deepEqual(invoked, [1]);
      }, 10);

      setTimeout(function () {
        scheduler.runScheduled();
        assert.deepEqual(invoked, [1]);
        done();
      }, 20);
    });
  });

  describe('#schedule', function () {
    it('will send an ever increasing id to scheduledReadySubject when scheduled', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];

      scheduler.scheduledReadySubject.toArray().subscribe(function (scheduledIds) {
        assert.deepEqual(scheduledIds, [0, 1]);
      });
      scheduler.schedule(null, function () {
        invoked.push(1);
      });
      scheduler.schedule(null, function () {
        invoked.push(2);
      });

      assert.deepEqual(invoked, []);
      scheduler.scheduledReadySubject.onCompleted();
      scheduler.runScheduled();
      assert.deepEqual(invoked, [1, 2]);
    });

    it('will wait to invoke each scheduled until runScheduled is invoked', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      scheduler.schedule(null, function () {
        invoked.push(1);
      });
      scheduler.schedule(null, function () {
        invoked.push(2);
      });

      assert.deepEqual(invoked, []);
      scheduler.runScheduled();
      assert.deepEqual(invoked, [1, 2]);
    });

    it('will invoke scheduled tasks recursively, bredth first', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      scheduler.schedule(null, function () {
        invoked.push(1);

        scheduler.schedule(null, function () {
          invoked.push(3);

          scheduler.schedule(null, function () {
            invoked.push(4);
          });
        });
      });
      scheduler.schedule(null, function () {
        invoked.push(2);
      });

      assert.deepEqual(invoked, []);
      scheduler.runScheduled();
      assert.deepEqual(invoked, [1, 2, 3, 4]);
    });

    it('isProcessing = true while runScheduled is looping', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      scheduler.schedule(null, function () {
        invoked.push(1);
        assert.equal(scheduler.isProcessing, true);
      });
      scheduler.schedule(null, function () {
        invoked.push(2);
        assert.equal(scheduler.isProcessing, true);
      });

      assert.equal(scheduler.isProcessing, false);
      scheduler.runScheduled();
      assert.equal(scheduler.isProcessing, false);
      assert.deepEqual(invoked, [1, 2]);
    });

    it('synchronous scheduled actions can be disposed', function () {
      let scheduler = new ReactRenderScheduler();
      let invoked = [];
      let disposable;

      scheduler.schedule(null, function () {
        invoked.push(1);
        disposable.dispose();
      });
      disposable = scheduler.schedule(null, function () {
        invoked.push(2);
      });

      scheduler.runScheduled();
      assert.deepEqual(invoked, [1]);
    });
  });
});
