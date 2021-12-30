const i18n = require("./index");

i18n({
  // language: ["en", "de"],
  // outputPath: "locale",
  src: ["src/react"],
  excluded: [],
  // fnName,
  fnWithZh: false,
  headless: false,
});
