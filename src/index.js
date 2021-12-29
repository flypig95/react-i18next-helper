const progress = require("progress");
const fs = require("fs");
const path = require("path");
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
//   fnName,
//   headless: false,
// });

async function main({
  language = ["en"],
  src = [],
  excluded = [],
  outputPath = "locale",
  fnName = "t",
  fnWithZh = false,
  headless = true,
}) {
  const browser = await puppeteer.launch({ headless });
  const page = (await browser.pages())[0];
  const files = getFiles(src, excluded);
  let i = 0;
  let file = "";

  do {
    file = files[i];
    const code = fs.readFileSync(file, "utf8");
    const astData = ast({ code, babelConfig, file, fnName });

    if (astData.length) {
      const translateData = await translate({
        page,
        astData,
        from: "zh",
        to: "en",
      });

      outJSON({ translateData, lang: "zh", outputPath });
      if (language.indexOf("en") > -1) {
        outJSON({ translateData, lang: "en", outputPath });
      }
      changeFile(translateData);
    }
    i++;
  } while (i < files.length);

  const otherLanguage = language.filter((v) => v !== "en");
  outLanguageJSON({ page, language: otherLanguage, outputPath });
}

const outLanguageJSON = async ({ page, language, outputPath }) => {
  let i = 0;
  const zhJSON = require(path.resolve(process.cwd(), outputPath, "zh.json"));
  const astData = Object.keys(zhJSON).map((k) => ({
    id: k,
    value: zhJSON[k],
  }));

  do {
    const lang = language[i];
    const translateData = await translate({
      page,
      astData,
      from: "zh",
      to: lang,
    });
    outJSON({ translateData, lang, outputPath });
    i++;
  } while (i < language.length);
};

module.exports = main;
