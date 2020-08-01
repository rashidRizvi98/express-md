'use strict';

var findUp = require('../lib/find-up.js');

describe('findUp', function () {

    it('Should find a file in startDir', function(done) {
        findUp('404.md', './tests/docs/goodbye', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/404.md')).toEqual(true);
            done();
        });
    });

    it('Should find a file in a parent dir', function(done) {
        findUp('template.html', './tests/docs/goodbye/cruel/world', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/cruel/template.html')).toEqual(true);
            done();
        });
    });

    it('Should look for a file that exists above our stop dir', function(done) {
        findUp('findUp.js', './tests/docs/goodbye', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result).toBeUndefined();
            done();
        });
    });

    it('Should look for a file that does not exist at all', function(done) {
        findUp('foo.bar.baz', './tests/docs/goodbye/cruel/world', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result).toBeUndefined();
            done();
        });
    });

    it('Should look for a file that occurs multiple times in the tree', function(done) {
        findUp('template.html', './tests/docs/goodbye/cruel/world', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/cruel/template.html')).toEqual(true);
            done();
        });
    });

    it('Should look for multiple filenames, only one of which exists', function(done) {
        findUp(['findUp.js', 'foo', 'template.html', 'bar'], './tests/docs/goodbye', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/template.html')).toEqual(true);
            done();
        });
    });

    it('Should look for multiple filenames, which exist in different dirs', function(done) {
        findUp(['404.md', 'hello.md'], './tests/docs/goodbye', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/404.md')).toEqual(true);
            done();
        });
    });

    it('Should look for multiple filenames, which exist in the same dir', function(done) {
        findUp(['404.md', 'template.html'], './tests/docs/goodbye', './tests/docs', function(err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/404.md')).toEqual(true);
            done();
        });
    });

    it('Should startDir not a subdir of stopDir should be an error', function(done) {
        findUp('hello.md', 'docs/goodbye', '/tmp', function(err, result) {
            expect(err).toBeDefined();
            done();
        });
    });

    it('Should parent dir shenanigans should not break out of stopDir', function(done) {
        var startDir = './tests/docs/../../test';
        var stopDir = './tests/docs';

        findUp('findUp.js', startDir, stopDir, function(err, result) {
            expect(err).toBeDefined();
            done();
        });
    });
});
