'use strict';

var findMatch = require('../lib/find-match.js');

describe('findMatch', function () {

    it('Should resolve a target that has no extension', function (done) {
        findMatch('./tests/docs/hello', function (err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/hello.md')).toEqual(true);
            done();
        });
    });

    it('Should resolve a target that has a known extension', function (done) {
        findMatch('./tests/docs/goodbye/cruel/world/index.mdown', function (err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/cruel/world/index.mdown')).toEqual(true);
            done();
        });
    });

    it('Should resolve a target that is a directory', function (done) {
        findMatch('./tests/docs/goodbye/cruel/world', function (err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/goodbye/cruel/world/index.mdown')).toEqual(true);
            done();
        });
    });

    it('Should resolve a target that does not exist', function (done) {
        findMatch('./tests/docs/foo', function (err, result) {
            expect(err).toBe(null);
            expect(result).toBeUndefined();
            done();
        });
    });

    it('Should resolve a target with a leading dot', function (done) {
        findMatch('./tests/docs/hello', function (err, result) {
            expect(err).toBe(null);
            expect(result.endsWith('docs/hello.md')).toEqual(true);
            done();
        });
    });

    it('Should resolve a non-existing target with an unknown extension', function (done) {
        findMatch('./tests/docs/hello.getdown', function (err, result) {
            expect(err).toBe(null);
            expect(result).toBeUndefined();
            done();
        });
    });

    it('Should resolve an existing target with an unknown extension', function (done) {
        findMatch('./tests/docs/goodbye/template.html', function (err, result) {
            expect(err).toBe(null);
            expect(result).toBeUndefined();
            done();
        });
    });
});
