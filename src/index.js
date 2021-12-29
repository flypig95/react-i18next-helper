const progress = require("progress");
const fs = require("fs");
const puppeteer = require("puppeteer");
const getFiles = require("./utils/getFiles");
const ast = require("./utils/ast");
const translate = require("./utils/translate");
const changeFile = require("./utils/changeFile");
const outJSON = require("./utils/outJSON");
const babelConfig = require("./babelConfig");

// i18n({
//   language: ["en", "de"],
//   outputPath: "",
//   src: [],
//   excluded: [],
//   fn,
//   headless: false,
// });

async function main({
  language = ["en"],
  src,
  excluded = [],
  outputPath = "locale",
  fn = "t",
  fnWithZh = false,
  headless = true,
}) {
  const browser = await puppeteer.launch({ headless });
  const page = (await browser.pages())[0];
  const files = getFiles(src, excluded);
  let i = 0;
  let file = "";

  language = language.indexOf("en") > -1 ? language : ["en"].concat(language);

  do {
    file = files[i];
    const code = fs.readFileSync(file, "utf8");
    const astData = ast({ code, babelConfig, file, fn });

    let translateDataEn = [];
    let j = 0;

    do {
      const isEn = j === 0;
      const lang = language[j];
      const translateData = await translate({
        page,
        astData,
        from: "zh",
        to: lang,
      });

      if (isEn) {
        changeFile(translateData);
        translateDataEn = translateData;
      }

      if (!isEn && translateDataEn.length > 0) {
        translateData.forEach((item) => {
          const _item = translateDataEn.find(
            (v) => item.start === v.start && item.end === v.end
          );
          item.id = _item.id;
        });
      }
      outJSON({ translateData, lang, outputPath });

      j++;
    } while (j < language.length);

    i++;
  } while (i < files.length);
}

module.exports = main;
