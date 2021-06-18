#!/usr/bin/env node
const { Command } = require('commander');
const webpack = require('webpack');
const program = new Command();
const chalk = require('react-dev-utils/chalk');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

program
  .option('-d, --dev', 'Start a development server')
  .option('-b, --build', 'Build a production bundle')
  .option('--public', 'Prefix for public assets', '')
  .option('-m, --mode <type>', 'Mode (development / production)', 'development');

program.parse(process.argv);

const options = program.opts();

if (options.mode === 'development') {
  process.env.NODE_ENV = 'development';
} else {
  process.env.NODE_ENV = 'production';
}


const configGenerator = require('../scripts/configGenerator');

const config = configGenerator(process.env.NODE_ENV, options.public);
if (options.build) {
  console.log('Creating an optimized production build...');

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        reject(formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        }));
      }

      return resolve();
    });
  })
    .then(() => console.log('Compiled successfully'))
    .catch((err) => console.error(err));

}
