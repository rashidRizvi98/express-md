'use strict';

var fs = require('fs');
var renderError = require('../lib/render-error.js');

var BASE_DIR = './tests/docs';
var EXTENSIONS = ['.md', '.mdown'];

describe('renderError', function () {

    it('Should throw a 404 using a template', function(done) {

        renderError(404, './tests/docs/goodbye/cruel', BASE_DIR, EXTENSIONS, function(err, headers, body) {
            expect(err).toBe(null);
            expect('Content-Type' in headers).toBe(true);
            expect(headers['Content-Type']).toEqual('text/html; charset=UTF-8');

            var content = fs.readFileSync('./tests/docs/goodbye/404-rendered.html').toString().trim();
            body = body.toString().trim();

            expect(body).toEqual(content);

            done();
        });
    });

    it('Should throw a 404 not using a template', function(done) {

        renderError(404, 'docs', BASE_DIR, EXTENSIONS, function(err, headers, body) {
            expect(err).toBe(null);
            expect('Content-Type' in headers).toBe(true);
            expect(headers['Content-Type']).toEqual('text/plain');
            expect(body).toEqual('404');
            done();
        });
    });
});
