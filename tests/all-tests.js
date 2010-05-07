// -*- coding: utf-8 -*-
//all-tests.js ---
//
// Copyright (C) MIT License
// Tampere University of Technology
//
// Created: Fri May  7 10:43:00 2010 (+0300)
// Author: wuher
//


exports.testConsumer = require("./consumer-tests");
exports.testToken = require("./token-tests");


if (require.main == module.id) {
    require("test/runner").run(exports);
}

//
//all-tests.js ends here
