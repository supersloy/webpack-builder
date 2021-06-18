const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getClientEnvironment = require("./env");
const paths = require("./paths");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const InterpolateHtmlPlugin = require('./InterpolateHtmlPlugin');


// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv, publicPath = paths.output) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  const env = getClientEnvironment(publicPath);

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvDevelopment
      ? 'source-map'
      : false,
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry:
      isEnvDevelopment
        ? [
          'react-hot-loader/patch',
          paths.entryPoint,
        ]
        : [paths.entryPoint],

    output: {
      path: paths.output,
      publicPath,
      filename: isEnvDevelopment ? '[name].[fullhash].js' : '[name].[contenthash].js'
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              [
                'babel-plugin-named-asset-import',
                {
                  loaderMap: {
                    svg: {
                      ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                    },
                  },
                },
              ],
              isEnvDevelopment && require.resolve('react-hot-loader/babel'),
            ].filter(Boolean),
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            // See #6846 for context on why cacheCompression is disabled
            cacheCompression: false,
            compact: isEnvProduction,
          },
        },
        {
          test: /\.css$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader'
          ].filter(Boolean),
          exclude: /\.module\.css$/
        },
        {
          test: /\.css$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true
              }
            },
            'postcss-loader'
          ].filter(Boolean),
          include: /\.module\.css$/
        },
        {
          test: /\.scss$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            //'style-loader',
            'css-loader',
            'sass-loader'
          ].filter(Boolean),
          exclude: /\.module\.css$/
        },
        {
          test: /\.scss$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            //'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true
              }
            },
            'sass-loader'
          ].filter(Boolean),
          include: /\.module\.css$/
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                mimetype: 'image/png'
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ]
    },
    resolve: {
      extensions: [
        '.js',
        '.jsx',
        '.tsx',
        '.ts'
      ],
      alias: {
        'react-dom': isEnvProduction ? 'react-dom' : '@hot-loader/react-dom'
      }
    },
    devServer: {
      contentBase: paths.output
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.indexHTML,
          },
          isEnvProduction
            ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
            : undefined
        )
      ),
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      new webpack.DefinePlugin(env.stringified),
      isEnvProduction && new MiniCssExtractPlugin(),
      new CleanWebpackPlugin()
    ].filter(Boolean),
    optimization: {
      minimize: isEnvProduction,
      runtimeChunk: 'single',
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    }
  };
};
