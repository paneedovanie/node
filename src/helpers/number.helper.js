module.exports.precisionRoundMod = function (number, precision) {
  // var factor = Math.pow(10, precision);
  // var n = precision < 0 ? number : 0.01 / factor + number;
  // return Math.round(n * factor) / factor;
  return Math.round((number + Number.EPSILON) * 10000) / 10000
}