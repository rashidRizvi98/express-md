'use strict';

var path = require('path');
var fs = require('fs');
var marked = require('marked');
var findUp = require('./findUp.js');

var BASIC_TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.html')).toString();

var TAGS = {
    title: /\{\{\{\ *title\ *\}\}\}/,
    markdown: /\{\{\{\ *markdown\ *\}\}\}/
};

var FIRST_TAG_CONTENT = /\>\s*(\w[^<]+)<\//;

// Replace special {{{ tags }}} found in the HTML template with the
// corresponding replacement text.

function replaceTags(html, replacements) {
    for (var key in TAGS) {
        if (TAGS.hasOwnProperty(key) && key in replacements) {
            html = html.replace(TAGS[key], replacements[key]);
        }
    }
    return new Buffer(html);
}

/**
 * Render the specified target from Markdown to HTML
 * @param {string} target - path to the Markdown document to be rendered
 * @param {string} baseDir - docs dir (options.dir from the middleware)
 * @param {object} params - key value variables to use in rendering
 * @param {function} callback - function to call once complete
 * @returns {void}
 */
function render(target, baseDir, params, callback) {

    params = params || {};

    findUp('template.html', path.dirname(target), baseDir, function (err, template) {
        if (err) return callback(err);

        fs.readFile(target, function (err, data) {
            if (err) return callback(err);

            data = String(data || '');

            Object.keys(params).forEach(function(key) {

                var reg = new RegExp('\{\{\{\ *' + key + '\ *\}\}\}');

                data = data.replace(reg, params[key]);
            });

            var replacements = {};
            replacements.markdown = marked(data);

            // for the title, get the contents of the first HTML tag
            replacements.title = 'Untitled';
            var match = replacements.markdown.match(FIRST_TAG_CONTENT);
            if (match) {
                replacements.title = match[1].trim();
            }

            if (template) {
                fs.readFile(template, function (err, data) {
                    if (err) return callback(err);
                    callback(null, replaceTags(data.toString(), replacements));
                });
            }
            else {
                callback(null, replaceTags(BASIC_TEMPLATE, replacements));
            }
        });
    });
}

module.exports = render;
