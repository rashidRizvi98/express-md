var path = require('path');
var url = require('url');
var fs = require('fs');
var mime = require('mime');

var MemoryCache = require('./lib/memoryCache.js');
var NoCache = require('./lib/noCache.js');
var memoize = require('./lib/memoize.js');
var watch = require('./lib/watch.js');

/**
 * Express middleware used to serve markdown files
 * @param {object} options - config options
 * @returns {function} express middleware
 */
function expressMd(options) {

    // get our version number
    var packageJsonPath = path.join(__dirname, 'package.json');
    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    var version = packageJson.name + ' ' + packageJson.version;

    // process options
    options = options || {};
    options.dir = options.dir || 'docs';
    options.url = options.url || '/docs/';
    options.ignore = options.ignore || [];
    options.vars = options.vars || {};
    options.extensions = options.extensions || ['.md', '.mdown'];
    options.passthrough = options.passthrough || ['.css', '.png', '.jpg', '.jpeg', '.js'];
    options.watch = options.watch || false;

    if (options.url.substr(-1) !== '/') {
        options.url += '/';
    }

    // create the cache and start fresh
    var cache;
    if (options.cache === false) {
        cache = new NoCache();
    }
    else if (!options.cache) {
        cache = new MemoryCache();
    }
    else {
        cache = new options.cache();
    }
    cache.flushAll();

    // load memo-ized versions of functions that we need
    var findMatch = memoize(require('./lib/findMatch.js'), cache, 'findMatch');
    var render = memoize(require('./lib/render.js'), cache, 'render');
    var renderError = memoize(require('./lib/renderError.js'), cache, 'renderError');
    var cachedReadFile = memoize(fs.readFile, cache, 'cachedReadFile');

    // invalidate cache on filesystem changes
    if (options.watch) {
        watch(options.dir, cache);
    }

    // default headers
    var defaultHeaders = { 'X-Powered-By': version };
    defaultHeaders = Object.assign({}, defaultHeaders, options.headers);

    // return the middleware
    return function(req, res, next) {

        // check if req.url is one that we are supposed to handle
        var pathname = decodeURI(url.parse(req.url).pathname);
        if (pathname.slice(0, options.url.length) !== options.url) {
            // request is outside our URL base
            return next();
        }

        // ignore can be string or regex
        var shouldIgnore = options.ignore.filter(function(item) {

            if (item instanceof RegExp) {
                return item.test(pathname);
            }

            return pathname.endsWith(item);
        }).length > 0;

        // skip this request?
        if (shouldIgnore) return next();

        // only GET and HEAD requests are allowed
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, Object.assign({}, defaultHeaders, { Allow: 'GET, HEAD' }));
            return res.end();
        }

        // make querystring vars available to markdown
        var markdownVars = Object.assign({}, options.vars, req.query || {});

        // map the URL to a filesystem path
        var target = path.join(options.dir, pathname.slice(options.url.length));

        fs.exists(target, function (exists) {

            // is it a pass-through file?
            var ext = path.extname(target);

            if (exists && options.passthrough.indexOf(ext) !== -1) {
                // yes, pass-through
                return cachedReadFile(target, function (err, buffer) {

                    if (err) return next(err);

                    var headers = { 'Content-Type': mime.lookup(ext) };
                    res.writeHead(200, Object.assign({}, defaultHeaders, headers));
                    res.end(buffer);
                });
            }

            // no, not a pass-through file: resolve the actual filename
            findMatch(target, options.extensions, function (err, filename) {

                if (err) return next(err);

                if (filename) {
                    render(filename, options.dir, markdownVars, function (err, html) {

                        if (err) return next(err);

                        res.writeHead(200, Object.assign({}, defaultHeaders, { 'Content-Type': 'text/html; charset=UTF-8' }));
                        res.end(html);
                    });
                }
                else {
                    renderError(404, target, options.dir, options.extensions, function (err, headers, body) {

                        if (err) return next(err);

                        res.writeHead(404, Object.assign({}, defaultHeaders, headers));
                        res.end(body);
                    });
                }
            });
        });
    };
}

module.exports = expressMd;
