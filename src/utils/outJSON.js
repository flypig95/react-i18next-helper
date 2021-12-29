const fs = require("fs");
const path = require("path");

const writeContent = ({ data, lang, outputPath }) => {
  const { id, dst, value } = data;
  let isExistFile = true;
  outputPath = path.resolve(process.cwd(), outputPath);
  const filePath = (_lang = "zh") => path.resolve(outputPath, `${_lang}.json`);

  // try {
  //   fs.accessSync(path.resolve(process.cwd(), `${lang}.json`));
  // } catch (err) {
  //   isExistFile = false;
  // }

  // const langData = isExistFile
  //   ? JSON.parse(fs.readFileSync(`${lang}.json`))
  //   : {};
  // if (!langData[id]) langData[id] = dst;
  // fs.writeFileSync(`${lang}.json`, JSON.stringify(langData, "", "\t"));

  // if (lang === "en") {
  //   const zhData = isExistFile ? JSON.parse(fs.readFileSync("zh.json")) : {};
  //   if (!zhData[id]) zhData[id] = value.replace("\n", "").trim();
  //   fs.writeFileSync("zh.json", JSON.stringify(zhData, "", "\t"));
  // }
  try {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    if (!fs.existsSync(filePath(lang))) {
      isExistFile = false;
    }
  } catch (err) {
    console.log(err);
  }
  // try {
  //   fs.accessSync(filePath(lang));
  // } catch (err) {
  //   isExistFile = false;
  // }

  const langData = isExistFile
    ? JSON.parse(fs.readFileSync(filePath(lang)))
    : {};
  if (!langData[id]) langData[id] = dst;
  fs.writeFileSync(filePath(lang), JSON.stringify(langData, "", "\t"));

  if (lang === "en") {
    const zhData = isExistFile
      ? JSON.parse(fs.readFileSync(filePath("zh")))
      : {};
    if (!zhData[id]) zhData[id] = value.replace("\n", "").trim();
    fs.writeFileSync(filePath("zh"), JSON.stringify(zhData, "", "\t"));
  }
};

const outJSON = ({ translateData, lang, outputPath }) => {
  translateData.forEach((item) =>
    writeContent({ data: item, lang, outputPath })
  );
};

module.exports = outJSON;
