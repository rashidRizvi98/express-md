'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var async = require('async');

/**
 * Given a requested filespec, find it in the specified directory. 
 * If it isn't there, walk up to each parent directory looking for
 * it. The search stops when a matching file is found, or after the
 * stop directory is reached.
 *
 * In other words, this looks for a file analogous to how Apache
 * locates .htaccess files.
 * @param {Array<string>|string} filespec - file name(s) to look for
 * @param {string} startDir - directory from which to start searching
 * @param {string} stopDir - stop if we reach this parent directory
 * @param {function} callback - receives path of file, or null if no match was found
 * @returns {void}
 */
function findUp(filespec, startDir, stopDir, callback) {

    startDir = path.normalize(startDir);
    stopDir = path.normalize(stopDir);

    if (startDir.slice(0, stopDir.length) !== stopDir) {
        return callback(new Error('startDir must be a subdirectory of stopDir'));
    }

    if (!util.isArray(filespec)) {
        filespec = [filespec];
    }

    var potentials = [];
    var dir = startDir;

    while (dir.slice(0, stopDir.length) === stopDir) {
        for (var index = 0; index < filespec.length; ++index) {
            potentials.push(path.join(dir, filespec[index]));
        }
        dir = path.normalize(path.join(dir, '..'));
    }

    async.detectSeries(potentials, fs.exists, function(result) {
        callback(null, result);
    });
}

module.exports = findUp;
