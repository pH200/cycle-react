class CompositeDisposableRx4 {
  constructor() {
    this.disposables = [];
  }
  add(subscription) {
    this.disposables.push(subscription);
  }
  unsubscribe() {
    if (this.disposables === null) {
      throw new Error('Already disposed');
    }
    for (let i = 0; i < this.disposables.length; i++) {
      const sub = this.disposables[i];
      if (sub.unsubscribe) {
        sub.unsubscribe();
      } else if (sub.dispose) {
        sub.dispose();
      } else if (typeof sub === 'function') {
        sub();
      }
    }
    this.disposables = null;
  }
}
module.exports = CompositeDisposableRx4;
