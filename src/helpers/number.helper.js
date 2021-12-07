module.exports.precisionRoundMod = function (number, precision) {
  var factor = Math.pow(10, precision);
  var n = precision < 0 ? number : 0.01 / factor + number;
  n = parseFloat(n.toPrecision(precision))
  return Math.round(n * factor) / factor;
}