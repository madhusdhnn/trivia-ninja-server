const fs = require('fs');

const enableLogging = (logger) => {
   logger.level = 'all';
   return logger;
}

const withFile = (filePath, callbackfn) => {
   const contents = fs.readFileSync(filePath, 'utf8');
   callbackfn(contents);
};

module.exports = {
   domain: 'https://opentdb.com/',
   categoriesFilePath: 'data/categories.json',
   enableLogging: enableLogging,
   withFile: withFile,
   shuffle: (array = []) => array.sort(() => Math.random() - 0.5),
};
