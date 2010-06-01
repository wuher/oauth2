// -*- coding: utf-8 -*-
//mock2.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Sun May 30 14:34:23 2010 (+0300)
// Author: jedi
//


/*
 * simple object mocking for tests
 *
 * mock is created by saying:
 *
 *    var mymock = test.mymock(objctToBeMocked);
 *
 * if 'true' is given as optional parameter, mocking is done recursively.
 * an example use case might be:
 *
 *    // create mock
 *    var mock = require("mock");
 *    var mymock = mock.mock({foo: function () {}, bar: function () {}});
 *
 *    // lay out the contract before executing tests
 *    mymock.expect.foo().times(1).withParameters('hello').returns(true);
 *    mymock.expect.bar().returns("retval");
 *    mymock.expect.bar().returns("lavter");
 *
 *    // execute tests
 *    func_to_be_tested(foo, bar);
 *    another_func_to_be_tested(bar);
 *
 *    // verify the contract
 *    mock.releaseMocks();
 *
 * the releaseMocks() function permorms the checks that all the right
 * functions were called as many times as they were supposed to. note that
 * the number of times to be called may either be set explicitly using
 * times() or the mock module may determine it by counting the
 * withParameters() and returns() calls.
 *
 * mock.expect has following functions:
 *
 * - times()            // 0 means that mocked function can't be invoked
 * - withParameters()   // the code under test should invoke the mocked
 *                      // function with these parameters
 * - returns()          // define what the mocked function returns back
 *                      // to the code under test
 */


var assert = require("test/assert");
var log = require("logger");
var util = require("util");
var sprintf = require("printf").sprintf;


var expectations = [];


/**
 * @param name name of the function
 * @param expectation the expectation object
 * @return 'normal' stub function
 */
var functionStub = function (name, expectation) {
    return function () {
        expectation.__funcCalled(util.array.coerce(arguments));
        return expectation.__returnValue();
    };
};


/**
 * @param name name of the function
 * @return 'expectation' stub function
 */
var expectationFunctionStub = function (name) {
    var expFuncStub, gettimes, times_ = -1, numberOfCalls = 0, returns_ = [],
    parameters_ = [], withParametersTimes_, returnsTimes_;

    // number of times the "withParameters()" has been invoked for this mock func
    withParametersTimes_ = 0;
    // number of times the "returns()" has been invoked for this mock func
    returnsTimes_ = 0;
    // if the user wants to explicitly say how many times this mock func will
    // be called
    times_ = -1;

    gettimes = function () {
        var t;
        if (times_ !== -1) {
            return times_;
        } else {
            t = Math.max(withParametersTimes_, returnsTimes_);
            return t !== 0 ? t : -1;
        }
    };

    // todo: figure out how to make __xxx functions protected.
    // i.e. private for the test application but visible for the mock
    expFuncStub = {

        /// mock object calls this
        __verify: function () {
            if (gettimes() !== -1) {
                assert.isEqual(
                    gettimes(), numberOfCalls,
                    sprintf("function %s() called %d times", name, numberOfCalls));
            }
        },

        __funcCalled: function (args) {
            var i, expectedArgs = parameters_.shift();

            numberOfCalls += 1;

            // check that the function hasn't been called too many times
            if (gettimes() !== -1) {
                assert.isTrue(numberOfCalls <= gettimes(),
                              sprintf("function %s() called too many times", name));
            }

            // if parameters have been defined, check that they are what
            // was expected
            if (expectedArgs !== undefined) {
                assert.isSame(expectedArgs, args, name + " called with wrong parameters");
            }
        },

        __returnValue: function () {
            return returns_.shift();
        },

        times: function (n) {
            times_ = n;
            return this;
        },

        returns: function (obj) {
            returns_.push(obj);
            returnsTimes_ += 1;
            return this;
        },

        withParameters: function () {
            parameters_.push(util.array.coerce(arguments));
            withParametersTimes_ += 1;
            return this;
        }
    };

    return function () {
        return expFuncStub;
    };
};


/**
 * @param obj object to be mocked
 * @param recurse optional parameter. if you set it to true,
 * mocking is done recursively until all child objects have been
 * mocked too
 * @return a mock object generated based on the given object
 */
var objectStub = function (obj, recurse) {
    var o, x, that = {};

    that.expect = {};

    for (o in obj) {
        try {
            // i know, this is amazing, but it seems that when
            // mocking java objects you run into situations where
            // a property is part of an object, yet it is not
            // accessible
            // todo: find out more about this
            x = obj[o];
        } catch(e) {
            log.warn("couldn't mock property '" + o + "'");
            continue;
        }

        if (o === "expect") {
            assert.fail("given object isn't mockable because it " +
                        "already has a property called 'expect'");
        } else if (typeof obj[o] === "function") {
            // create stub functions for the mock an for the expectation
            that.expect[o] = expectationFunctionStub(o);
            that[o] = functionStub(o, that.expect[o]());
            expectations.push(that.expect[o]());
        } else if (typeof obj[o] === "object") {
            if (recurse) {
                // call 'objectStub()' recursively on objects
                that[o] = objectStub(obj[o], true);
            }
        } else {
            // just copy primitive types (no need to put these into
            // expectation
            that[o] = obj[o];
        }
    }

    return that;
};


/// @return a mock object generated from the given object
exports.mock = function (obj, recurse) {
    return objectStub(obj, recurse);
};


exports.releaseMocks = function () {
    var i;

    for (i = 0; i < expectations.length; i += 1) {
        expectations[i].__verify();
    }

    expectations = [];
};


//
//mock2.js ends here
