const fs = require("fs");
const path = require("path");

const getPath = (folder) => path.resolve(process.cwd(), folder);

const getFiles = (include = [], exclude = []) => {
  const excludePaths = exclude.map((v) => getPath(v));

  return include.reduce((files, folder) => {
    const folderPath = getPath(folder);
    const _files = fs.readdirSync(folderPath);

    _files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.lstatSync(filePath);

      if (!stat.isDirectory()) {
        const isExclude = excludePaths.some((v) => {
          const reg = new RegExp(`^${v}`, "g");
          return reg.test(filePath);
        });

        if (!isExclude) files.push(filePath);
      } else {
        files = files.concat(getFiles([filePath], exclude));
      }
    });
    return files;
  }, []);
};

module.exports = getFiles;
