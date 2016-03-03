"use strict";

const moment = require('moment');

module.exports = (rawDate) => {
  return moment(+rawDate).format('MMM Do YY');
};
