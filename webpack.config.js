const path = require("path");

module.exports = (env) => {
  return {
    mode: env.mode || "development",
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(css|s[ac]ss)$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.graphql$/,
          use: "graphql-tag/loader",
        },
        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          use: [
            {
              loader: "file-loader",
            },
          ],
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader",
        },
      ],
    },
    devServer: {
      static: path.join(__dirname, "dist"),
      compress: true,
      port: 5678,
    },
  };
};
