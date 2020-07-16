'use strict';

var findUp = require('./findUp.js');
var render = require('./render.js');

/**
 * Look for an error template Markdown file (for example, 404.md) and render it.
 * @param {number} errCode - the error code
 * @param {string} targetDir - directory where the error occurred (used to select the proper template.html file and error Markdown file)
 * @param {string} baseDir - docs dir (options.dir from the middleware)
 * @param {Array} extensions - options.extensions from the middleware
 * @param {function} callback - receives headers array and body to be sent
 * back to the client. Calling function is responsible for sending the response
 * @returns {void}
 */
function renderError(errCode, targetDir, baseDir, extensions, callback) {
    var candidates = extensions.map(function(extension) {
        return errCode.toString() + extension;
    });

    findUp(candidates, targetDir, baseDir, function(err, result) {
        if (err || !result) {
            return genericError(errCode, callback);
        }

        render(result, baseDir, null, function(err, html) {
            if (err) {
                return genericError(errCode, callback);
            }
            var headers = { 'Content-Type': 'text/html; charset=UTF-8' };
            if (callback) {
                callback(null, headers, html);
            }
        });
    });
}

/**
 * Returns an error to the callback consistently
 * @param {number} errCode - error code
 * @param {function} callback - function to call once complete
 * @returns {void}
 */
function genericError(errCode, callback) {
    var headers = { 'Content-Type': 'text/plain' };
    var text = errCode.toString();
    callback(null, headers, text);
}

module.exports = renderError;
