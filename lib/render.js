'use strict';

var path = require('path');
var fs = require('fs');
var marked = require('marked');
var findUp = require('./find-up.js');
var yaml = require('js-yaml');

var DEFAULT_TEMPLATE = fs.readFileSync(path.join(__dirname, '../templates/github.html')).toString();

/**
 * Render the specified target from Markdown to HTML
 * @param {string} target - path to the Markdown document to be rendered
 * @param {string} baseDir - docs dir (options.dir from the middleware)
 * @param {object} serverVariables - key value variables to use in rendering
 * @param {function} callback - function to call once complete
 * @returns {void}
 */
function render(target, baseDir, serverVariables, callback) {

    serverVariables = serverVariables || {};

    findUp('template.html', path.dirname(target), baseDir, function (err, template) {
        if (err) return callback(err);

        fs.readFile(target, function (err, data) {
            if (err) return callback(err);

            data = String(data || '');

            var markdownVariables = getMarkdownVariables(data);
            var replacements = Object.assign({}, markdownVariables, serverVariables);

            // remove them from raw md content, so it's not rendered
            data = removeMarkdownVariables(data);

            // overwrite markdown var if it exists
            replacements.markdown = marked(data);

            if (template) {
                fs.readFile(template, function (err, data) {
                    if (err) return callback(err);
                    callback(null, replaceHtmlPlaceholders(data.toString(), replacements));
                });
            }
            else {
                callback(null, replaceHtmlPlaceholders(DEFAULT_TEMPLATE, replacements));
            }
        });
    });
}

/**
 * Extracts (front-matter) variables from markdown files 
 * @param {string} str - raw markdown content
 * @returns {object} key/value variables
 */
function getMarkdownVariables(str) {

    // get front-matter variables from markdown file
    var frontMatterVars = String(str).match(/---(.|\n|\r)*?---/);
    var result = {};

    if (frontMatterVars) {
        frontMatterVars = frontMatterVars[0];
        frontMatterVars = frontMatterVars.replace(/---/g, '').trim();
        frontMatterVars = yaml.safeLoad(frontMatterVars) || {};

        result = Object.assign({}, result, frontMatterVars);

        // remove front-matter variables from markdown
        str = str.replace(/---(.|\n|\r)*?---/, '');
    }

    return result;
}

/**
 * Removes front-matter vaiables from markdown content
 * @param {string} str - raw markdown string
 * @returns {string} markdown without front-matter
 */
function removeMarkdownVariables(str) {
    return str.replace(/---(.|\n|\r)*?---/, '');
}

/**
 * Replaces HTML {{{ key }}} placeholders
 * @param {string} html - html containing placeholders
 * @param {object} replacements - key/value pair of valiables to place
 * @returns {Buffer} modified HTML content
 */
function replaceHtmlPlaceholders(html, replacements) {

    replacements = replacements || {};

    Object.keys(replacements).forEach(function(key) {
        html = html.replace(new RegExp('\{\{\{\ *' + key + '\ *\}\}\}', 'g'), replacements[key]);
    });

    return new Buffer(html);
}

module.exports = render;
