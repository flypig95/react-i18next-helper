const fs = require("fs");

const changeFile = ({ translateData, addonBefore }) => {
  if (!translateData.length) {
    return;
  }
  translateData.reduce(function (diffIndex, current, index, arr) {
    const { file, start, end, id, value, replaceFn, offset = 0 } = current;
    if (!id) return diffIndex;
    let code = fs.readFileSync(file, "utf-8");
    const replacement = replaceFn(id);

    code =
      code.slice(0, start + diffIndex) +
      replacement +
      code.slice(end + diffIndex);

    if (index === arr.length - 1 && addonBefore) {
      code = addonBefore + "\n" + code;
    }
    fs.writeFileSync(file, code);

    const _diffIndex = replacement.toString().length - value.length + offset;
    return _diffIndex + diffIndex;
  }, 0);
};

module.exports = changeFile;
