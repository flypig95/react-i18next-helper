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
  src = ["src"],
  excluded = [],
  outputPath = "locale",
  addonBefore = "",
  fnName = "t",
  fnWithZh = false,
  headless = false,
}) {
  if (!Array.isArray(src)) {
    console.error("src需传入array类型数据");
    return;
  } else if (!Array.isArray(excluded)) {
    console.error("src需传入array类型数据");
    return;
  } else if (typeof outputPath !== "string") {
    console.error("outputPath需传入string类型数据");
    return;
  } else if (typeof fnName !== "string") {
    console.error("fnName需传入string类型数据");
    return;
  } else if (typeof fnWithZh !== "boolean") {
    console.error("fnName需传入boolean类型数据");
    return;
  } else if (typeof headless !== "boolean") {
    console.error("headless需传入boolean类型数据");
    return;
  }

  language = ["en"];
  addonBefore = "";
  console.success("初始化...");

  const browser = await puppeteer.launch({
    headless,
    defaultViewport: {
      width: 1600,
      height: 800,
    },
  });
  const page = (await browser.pages())[0];
  const files = getFiles(src, excluded).filter((v) => /(.js|.ts|.tsx|.jsx)$/.test(v));

  const filesLength = files.length;
  let i = 0;
  let file = "";

  const bar = new ProgressBar(
    `国际化：:fileIndex/${filesLength}个文件 [:bar] :percent 耗时:elapsed秒`,
    {
      incomplete: " ",
      width: 20,
      total: filesLength + 1,
    }
  );

  bar.tick({
    fileIndex: 0,
  });

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

    translateData = translateData
      .concat(sameAstData)
      .sort((a, b) => a.start - b.start);
    changeFile({ translateData, addonBefore });

    i++;

    bar.tick({
      fileIndex: i,
    });
  } while (i < filesLength);

  // await outLanguageJSON({ page, language, outputPath });

  browser.close();
  global.untranslated
    ? console.warn("还有漏网之鱼，请稍后再试！")
    : console.success("转换完成！");
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

console.error = function (v) {
  console.log(chalk.red(v));
};

console.success = function (v) {
  console.log(chalk.green(v));
};

console.warn = function (v) {
  console.log(chalk.yellow(v));
};

module.exports = main;
