const HtmlWebPackPlugin = require("html-webpack-plugin");

const env = process.env.NODE_ENV;

module.exports = {
  mode: env || "development",
  devtool: env === "production" ? "source-map" : "inline-source-map",
  output: {
    publicPath: process.env.PUBLIC_PATH || "/",
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
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html",
    }),
  ],
  /*
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        react: {
          // sync + async chunks
          chunks: "all",
          // import file path containing node_modules
          test: /node_modules\/react/,
        },
      },
    },
  },
  */
};
