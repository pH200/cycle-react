const Cycle = require('../../src/rxjs');

describe('Cycle', function () {
  describe('API', function () {
    it('should have `component`', () =>
      expect(typeof Cycle.component).toBe('function')
    );

    it('should have `viewComponent`', () =>
      expect(typeof Cycle.viewComponent).toBe('function')
    );
  });
});
