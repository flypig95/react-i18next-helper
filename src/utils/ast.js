const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const helper = require("./helper");

const ast = ({ code, babelConfig = {}, file, fnName, fnWithZh }) => {
  const ast = babelParser.parse(code, babelConfig);
  const data = [];

  traverse(ast, {
    JSXText(path) {
      const node = path.node;
      const { value } = node;

      if (isPushData({ value, path, fnWithZh, fnName })) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value,
          replaceFn: (id) =>
            fnWithZh
              ? `{${fnName}({id: '${id}', zh: '${helper.trim(value)}'})}`
              : `{${fnName}({id: '${id}'})}`,
        };
        data.push(obj);
      }
    },
    JSXAttribute(path) {
      const node = path.node;
      if (!node.value) return;
      const {
        value: { value, start, end },
      } = node;

      if (isPushData({ value, path, fnWithZh, fnName })) {
        const obj = {
          file,
          start,
          end,
          offset: -2,
          value,
          replaceFn: (id) =>
            fnWithZh
              ? `{${fnName}({id: '${id}', zh: '${helper.trim(value)}'})}`
              : `{${fnName}({id: '${id}'})}`,
        };
        data.push(obj);
      }
    },
    TemplateElement(path) {
      const node = path.node;
      if (!node.value) return;
      const {
        value: { raw },
      } = node;

      if (isPushData({ value: raw, path, fnWithZh, fnName })) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value: raw,
          replaceFn: (id) =>
            fnWithZh
              ? `\${${fnName}({id: '${id}', zh: '${helper.trim(raw)}'})}`
              : `\${${fnName}({id: '${id}'})}`,
        };
        data.push(obj);
      }
    },
    StringLiteral(path) {
      const node = path.node;
      const { value } = node;

      if (
        [
          "JSXText",
          "JSXAttribute",
          "TemplateElement",
          "ImportDeclaration",
        ].includes(path.parent.type)
      ) {
        return;
      }

      if (isPushData({ value, path, fnWithZh, fnName })) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value,
          offset: -2,
          replaceFn: (id) =>
            fnWithZh
              ? `${fnName}({id: '${id}', zh: '${helper.trim(value)}'})`
              : `${fnName}({id: '${id}'})`,
        };
        data.push(obj);
      }
    },
  });
  return data;
};

const isPushData = ({ value, path, fnWithZh, fnName }) => {
  if (fnWithZh) {
    const parentNode = path.findParent((x) => x.isCallExpression())?.node || {};
    return helper.isChinease(value) && parentNode.callee?.name !== fnName;
  } else {
    return helper.isChinease(value);
  }
};

module.exports = ast;
