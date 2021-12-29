const fs = require("fs");

const replace = function (diffIndex, current) {
  const { file, start, end, id, value, replaceFn, offset = 0 } = current;
  let code = fs.readFileSync(file, "utf-8");
  const replacement = replaceFn(id);

  code =
    code.slice(0, start + diffIndex) +
    replacement +
    code.slice(end + diffIndex);

  fs.writeFileSync(file, code);

  const _diffIndex = replacement.toString().length - value.length + offset;
  return _diffIndex + diffIndex;
};

const changeFile = (translateData) => {
  translateData.reduce(replace, 0);
};

module.exports = changeFile;
