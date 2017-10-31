var pkg = require('./package.json')
var fs = require('fs');
var shell = require('shelljs');
shell.cp('*', 'build/');

delete pkg.scripts;
pkg.main = 'index.js';
fs.writeFileSync('build/package.json', JSON.stringify(pkg, null, 2));
