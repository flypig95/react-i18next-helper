const i18n = require("./index");

i18n({
  // language: ["en", "de"],
  // outputPath: "locale",
  src: ["src/react"],
  excluded: [],
  // addonBefore: 'import { useTranslation, Trans } from "react-i18next"',
  // fnName,
  // fnWithZh: false,
  headless: false,
});
