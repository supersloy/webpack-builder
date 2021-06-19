#!/usr/bin/env node
const { Command } = require("commander");
const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const paths = require("../scripts/paths");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const openBrowser = require("react-dev-utils/openBrowser");

const program = new Command();

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

program
  .option("-d, --dev", "Start a development server")
  .option("-b, --build", "Build a production bundle")
  .option("--public", "Prefix for public assets", "")
  .option(
    "-m, --mode <type>",
    "Mode (development / production)",
    "development"
  );

program.parse(process.argv);

const options = program.opts();

if (options.mode !== "production") {
  process.env.NODE_ENV = "development";
} else {
  process.env.NODE_ENV = "production";
}

const configGenerator = require("../scripts/configGenerator");

if (options.build) {
  console.log("Creating an optimized production build...");
  const config = configGenerator(
    process.env.NODE_ENV,
    options.public || paths.output
  );

  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        if (!err.message) {
          console.log("There is an error without a message.");
          return reject(err);
        }

        let errMessage = err.message;

        reject(
          formatWebpackMessages({
            errors: [errMessage],
            warnings: [],
          })
        );
      }

      return resolve();
    });
  })
    .then(() => console.log("Compiled successfully"))
    .catch((err) => console.error(err));
}
if (options.dev) {
  console.log("Starting development server...");

  const options = {
    contentBase: paths.output,
    hot: true,
    host: "localhost",
  };
  const server = new webpackDevServer(compiler, options);
  server.listen(5000, "localhost", () => {
    console.log("dev server listening on port 5000");
  });
}
