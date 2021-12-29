const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const helper = require("./helper");

const ast = ({ code, babelConfig = {}, file, fnName }) => {
  const ast = babelParser.parse(code, babelConfig);
  const data = [];

  traverse(ast, {
    JSXText(path) {
      const node = path.node;
      const { value } = node;

      if (helper.isChinease(value)) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value: value,
          replaceFn: (id) => `{${fnName}('${id}')}`,
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

      if (helper.isChinease(value)) {
        const obj = {
          file,
          start,
          end,
          offset: -2,
          value: value,
          replaceFn: (id) => `{${fnName}('${id}')}`,
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

      if (helper.isChinease(raw)) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value: raw,
          replaceFn: (id) => `\${${fnName}('${id}')}`,
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

      if (helper.isChinease(value)) {
        const obj = {
          file,
          start: node.start,
          end: node.end,
          value: value,
          offset: -2,
          replaceFn: (id) => `${fnName}('${id}')`,
        };
        data.push(obj);
      }
    },
  });
  return data;
};

module.exports = ast;
