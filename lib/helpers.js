'use strict';

var logger = require('./logger.js').get(),
    exec = require('child_process').exec;


/* INSTRUMENTS STREAM MANIPULATION*/

module.exports.clearBufferChars = function (output) {
  // Instruments output is buffered, so for each log output we also output
  // a stream of very many ****. This function strips those out so all we
  // get is the log output we care about
  var re = /(\n|^)\*+\n?/g;
  output = output.toString();
  output = output.replace(re, "");
  return output;
};

module.exports.lookForTraceDir = function (output) {
  var re = /Instruments Trace Complete.+Output : ([^\)]+)\)/;
  var match = re.exec(output);
  if (match) {
    return match[1];
  }
};

module.exports.info = function (msg) {
  var log = "[INSTSERVER] " + msg;
  log = log.grey;
  logger.info(log);
};

module.exports.getInstrumentsPath = function (cb) {
  var instrumentsPath;
  exec('xcrun -find instruments', function (err, stdout) {
    if (typeof stdout === "undefined") stdout = "";
    instrumentsPath = stdout.trim();
    if (err || !instrumentsPath) {
      logger.error("Could not find instruments binary");
      if (err) logger.error(err.message);
      return cb(new Error("Could not find the instruments " +
          "binary. Please ensure `xcrun -find instruments` can locate it."));
    }
    logger.info("Instruments is at: " + instrumentsPath);
    cb(null, instrumentsPath);
  });
};

module.exports.killProc = function () {
  logger.info("Killall instruments");
  var cmd = 'killall -9 "instruments"';
  exec(cmd, { maxBuffer: 524288 }, function (err) {
    if (err && err.message.indexOf('matching processes') === -1) {
      logger.warn("Problem killing instruments: " + err.message);
    }
  });
};

