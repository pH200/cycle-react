class CompositeDisposable {
  constructor() {
    this.disposables = [];
  }
  add(subscription) {
    this.disposables.push(subscription);
  }
  remove(subscription) {
    const index = this.disposables.indexOf(subscription);
    if (index >= 0) {
      this.disposables.splice(index, 1);
    }
  }
  unsubscribe() {
    if (this.disposables === null) {
      throw new Error('Already disposed');
    }
    for (let i = 0; i < this.disposables.length; i++) {
      const sub = this.disposables[i];
      if (sub.unsubscribe) {
        sub.unsubscribe();
      } else if (typeof sub === 'function') {
        sub();
      }
    }
    this.disposables = null;
  }
}
module.exports = CompositeDisposable;
