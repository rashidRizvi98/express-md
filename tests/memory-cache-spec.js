'use strict';

var asyncLib = require('async');
var MemoryCache = require('../lib/memory-cache.js');

describe('MemoryCache', function () {

    it('Should save and retrieve a cache value', function(done) {
        var mc = new MemoryCache();
        mc.set('age', 42);
        mc.get('age', function(err, value) {
            expect(err).toBe(null);
            expect(value).toEqual(42);
            done();
        });
    });

    it('Should flush (delete) all cache values', function(done) {
        var mc = new MemoryCache();
        mc.set('age', 42);
        mc.set('country', 'USA');
        mc.set('school', 'Hard Knocks');

        mc.flushAll();

        mc.get('age', function(err, value) {
            expect(err).toBe(null);
            expect(value).toBeUndefined();

            mc.get('country', function(err, value) {
                expect(err).toBe(null);
                expect(value).toBeUndefined();

                mc.get('school', function(err, value) {
                    expect(err).toBe(null);
                    expect(value).toBeUndefined();

                    done();
                });
            });
        });
    });

    it('Should set many values', function(done) {
        var mc = new MemoryCache();

        var iterations = 10000;
        var index = 0;

        for (index = 0; index < iterations; ++index) {
            mc.set(index, 'hello ' + index.toString());
        }

        index = 0;
        asyncLib.whilst(
            function() {
                return index < iterations;
            },
            function(callback) {
                mc.get(index, function(err, value) {
                    // don't use t.* because we don't want thousands of "OK"
                    // status messages
                    if (err) {
                        t.ok(false, 'should complete without error');
                    }
                    if (value !== 'hello ' + index.toString()) {
                        t.ok(false, 'value should remain as set');
                    }
                    ++index;
                    callback();
                });
            },
            function(err) {
                expect(err).toBe(undefined);
                done();
            }
        );
    });
});
