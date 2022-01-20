# react-i18next-helper

react-i18next-helper 是一个解放双手的国际化辅助工具，自动将代码里的中文替换成 t('id'),id 是自动生成的唯一标识符，同时生成 en.josn、zh.json 文件。配合 react-i18next 使用，事半功倍。

### 安装

- yarn add -D react-i18next-helper
- npm install -D react-i18next-helper

### 特性

1. 支持 jsx、tsx
2. 支持与 react-i18next、umi 等国际化工具一起使用
3. 可以将中文替换成形如: t('hello', {zh: '你好'}) 辅助代码阅读

### 用法

项目中新建 locale/i18n.js，执行 node ./locale/i18n.js

```js
const i18n = require("react-i18next-helper");

i18n({
  src: ["src/react"],
  excluded: [],
  // outputPath: "locale",
  // fnName: "formatMessage",
  // fnWithZh: false,
  // headless: false,
});
```

### 代码自动替换

**替换前:**

```jsx
...
function Hello() {
    const world = '世界';
    return (
      <div>
        <Input placeholder="请输入" />
        你好，{world}
      </div>
    );
}
...
```

**替换后:**

```jsx
...
function Hello() {
  const world = t('world');
  return (
    <div>
      <Input placeholder={t('please-enter')} />{t('hello')}{world}
    </div>
  );
}
...
```

### 选项

- src: 需要替换中文的文件夹。例如: ['src/page','src/component']，默认值 ['src']
- excluded: 需要替换中文的文件夹。例如: ['src/service','src/store']，默认值 []
- outputPath: en.json、zh.json 的输出文件夹，默认 locale
- fnName: 中文替换后的方法名。例如: t()、formatMessage()，默认值 't'
- fnWithZh: 中文替换后的方法中是否需要中文用于辅助代码阅读。例如: t('hello',{zh: '你好'})，react-i18next-helper 会忽略 t('hello',{zh: '你好'})里的中文，默认值 false
- headless: 同[puppeteer](http://puppeteerjs.com/#?product=Puppeteer&version=v11.0.0&show=api-puppeteerlaunchoptions)中的参数 headless。headless 为 false 时会开启有界面模式，经测试有界面模式发送翻译请求更加稳定，建议保持默认值，默认值 false

### 案例

1. 配合 react-i18next 使用

```jsx
import React from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import enJson from "./locale/en.json";
import zhJson from "./locale/zh.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enJson,
    },
    zh: {
      translation: zhJson,
    },
  },
  lng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

const App = () => {
  const { t } = useTranslation();
  window.t = t;

  return <div className="App">...</div>;
};

export default App;
```
