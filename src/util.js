module.exports = {
  safeWarn(warn) {
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
      console.warn(warn);
    }
  }
};
