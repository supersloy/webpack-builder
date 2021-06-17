const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  packageJSON: resolveApp('package.json'),
  dotenv: resolveApp('.env'),
  entryPoint: resolveApp('src/index.tsx'),
  indexHTML: resolveApp('src/index.html'),
  output: resolveApp('dist'),
  resolveApp,
};
