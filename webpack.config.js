const webpack = require("webpack");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const env = process.env.NODE_ENV;
const publicPath = process.env.PUBLIC_PATH || "/";

module.exports = {
  mode: env || "development",
  devtool: env === "production" ? "source-map" : "inline-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath,
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)(s|sx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 10000,
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: { "react-dom": "@hot-loader/react-dom" },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html",
    }),
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify(publicPath),
    }),
  ],
  optimization: {
    usedExports: true,
    minimize: env === "production",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-hot-loader|react-router|react-router-dom|react-helmet|pouchdb-browser|@material-ui|notistack|@loadable|typeface-roboto|slugify|uuid|dayjs)[\\/]/,
          name: "vendor",
          chunks: "all",
        },
        ace: {
          test: /[\\/]node_modules[\\/](react-ace|ace-builds)[\\/]/,
          name: "ace",
          chunks: "all",
        },
        rjsf: {
          test: /[\\/]node_modules[\\/](@rjsf)[\\/]/,
          name: "rjsf",
          chunks: "all",
        },
      },
    },
  },
};
