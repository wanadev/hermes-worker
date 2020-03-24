const webpack = require("webpack");
const path = require("path");

let config = {
    entry: "./src/index.js",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "./bundle.js",
        library: 'hermes',
        libraryTarget:'var',
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /\.worker.js$/i,
                use: 'raw-loader',
            },
        ],
    },
};
module.exports = config;