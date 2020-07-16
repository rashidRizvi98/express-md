'use strict';

var fs = require('fs');
var render = require('../lib/render.js');

var DOCS_DIR = './tests/docs';

function testRender(t, md, html, description) {
    render(md, DOCS_DIR, null, function(err, result) {
        expect(err).toBe(null);

        var data = fs.readFileSync(html);
        expect(data.toString()).toEqual(result.toString());
        done();
    });
}

describe('render', function () {

    it('Should render a file using a template from a parent dir', function(done) {

        var markdownFile = './tests/docs/goodbye/cruel/world/index.mdown';
        var htmlFile = './tests/docs/goodbye/cruel/world/index-rendered.html';

        render(markdownFile, DOCS_DIR, null, function(err, result) {
            expect(err).toBe(null);

            var data = fs.readFileSync(htmlFile);
            expect(data.toString()).toEqual(result.toString());
            done();
        });
    });

    it('Should render a file using a template from the same dir', function(done) {

        var markdownFile = './tests/docs/goodbye/404.md';
        var htmlFile = './tests/docs/goodbye/404-rendered.html';

        render(markdownFile, DOCS_DIR, null, function(err, result) {
            expect(err).toBe(null);

            var data = fs.readFileSync(htmlFile);
            expect(data.toString()).toEqual(result.toString());
            done();
        });
    });

    it('Should render a file that has no template', function(done) {

        var markdownFile = './tests/docs/hello.md';
        var htmlFile = './tests/docs/hello-rendered.html';

        render(markdownFile, DOCS_DIR, null, function(err, result) {
            expect(err).toBe(null);

            var data = fs.readFileSync(htmlFile);
            expect(data.toString()).toEqual(result.toString());
            done();
        });
    });

    it('Should render a non-existent file', function(done) {
        render('docs/foo.bar.baz', DOCS_DIR, null, function(err, result) {
            expect(err).toBeDefined();
            done();
        });
    });
});