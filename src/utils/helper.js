module.exports.isChinease = function (value) {
  return value && /[\u4e00-\u9fa5]/.test(value);
};

module.exports.trim = function (value) {
  return value.replace("\n", "").trim();
};
