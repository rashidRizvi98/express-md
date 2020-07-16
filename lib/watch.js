'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Watches dir and all its subdirectories. Flushes the cache if any
 * changes are detected
 * @param {string} dir - directory to watch
 * @param {object} cache - cache object
 * @returns {void}
 */
function watch(dir, cache) {
    fs.lstat(dir, function(err, stats) {
        if (err || !stats.isDirectory()) return;

        fs.readdir(dir, function(err, files) {
            if (!err && files) {
                files.forEach(function(possibleDir) {
                    watch(path.join(dir, possibleDir), cache);
                });
            }
        });

        fs.watch(dir, function(event, filename) {
            cache.flushAll();
        });
    });
}

module.exports = watch;
