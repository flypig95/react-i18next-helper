const i18n = require("../src/index");

i18n({
  src: ["src/react"],
  excluded: [],
  // outputPath: "locale",
  // fnName: "t",
  fnWithZh: true,
  // headless: false,
  // language: ["en", "de"],
  // addonBefore: 'import { useTranslation, Trans } from "react-i18next"',
  keyPrefix: true,
});
