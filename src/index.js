const ProgressBar = require("progress");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const getFiles = require("./utils/getFiles");
const ast = require("./utils/ast");
const translate = require("./utils/translate");
const changeFile = require("./utils/changeFile");
const outJSON = require("./utils/outJSON");
const babelConfig = require("./babelConfig");

async function main({
  language = [],
  src = [],
  excluded = [],
  outputPath = "locale",
  addonBefore = "",
  fnName = "t",
  fnWithZh = false,
  headless = true,
}) {
  language = ["en"];
  addonBefore = "";
  console.log(chalk.green("初始化..."));

  const browser = await puppeteer.launch({ headless });
  const page = (await browser.pages())[0];
  const files = getFiles(src, excluded);
  const filesLength = files.length;
  let i = 0;
  let file = "";

  const bar = new ProgressBar(
    `国际化：:fileIndex/${filesLength}个文件 [:bar] :percent 耗时:elapsed秒`,
    {
      complete: "=",
      incomplete: " ",
      width: 20,
      total: filesLength,
    }
  );

  do {
    file = files[i];
    const code = fs.readFileSync(file, "utf8");
    const zhJSON = getJSON({ outputPath, lang: "zh" });
    let translateData = [];
    const astData = ast({ code, babelConfig, file, fnName, fnWithZh });
    const diffAstData = getDiffAstData({ astData, outputPath, lang: "zh" });
    const sameAstData = astData.filter((item) => {
      Object.keys(zhJSON).forEach((k) => {
        if (zhJSON[k].trim() === item.value.trim()) {
          item.id = k;
        }
      });
      return !diffAstData.find((v) => item.value.trim() === v.value.trim());
    });

    if (diffAstData.length) {
      translateData = await translate({
        page,
        astData: diffAstData,
        from: "zh",
        to: "en",
      });
      outJSON({ translateData, lang: "zh", outputPath });
      if (language.indexOf("en") > -1) {
        outJSON({ translateData, lang: "en", outputPath });
      }
    }

    translateData = translateData.concat(sameAstData);
    changeFile({ translateData, addonBefore });

    bar.tick({
      fileIndex: i + 1,
    });

    i++;
  } while (i < filesLength);

  // await outLanguageJSON({ page, language, outputPath });

  browser.close();
  console.log(chalk.green("执行完成！"));
}

const outLanguageJSON = async ({ page, language, outputPath }) => {
  const otherLanguage = language.filter((v) => v !== "en");
  const zhJSON = getJSON({ outputPath, lang: "zh" });
  const astData = Object.keys(zhJSON).map((k) => ({
    id: k,
    value: zhJSON[k],
  }));

  if (otherLanguage.length) {
    let i = 0;
    do {
      const lang = otherLanguage[i];
      const diffAstData = getDiffAstData({ astData, outputPath, lang });

      if (diffAstData.length) {
        const translateData = await translate({
          page,
          astData: diffAstData,
          from: "zh",
          to: lang,
        });
        outJSON({ translateData, lang, outputPath });
      }

      i++;
    } while (i < otherLanguage.length);
  }
};

const getJSON = ({ outputPath, lang }) => {
  try {
    return require(path.resolve(process.cwd(), outputPath, `${lang}.json`));
  } catch (err) {
    return {};
  }
};

const getDiffAstData = ({ astData, outputPath, lang }) => {
  const langJSON = getJSON({ outputPath, lang });
  return astData.filter(
    (item) =>
      !Object.keys(langJSON).find((k) =>
        lang === "zh"
          ? langJSON[k].trim() === item.value?.trim()
          : k === item.id
      )
  );
};

module.exports = main;
