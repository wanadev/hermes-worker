const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

console.log(merge);
module.exports = merge(common, {
    mode: "development",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "./bundle.js",
        library: "hermes",
        libraryTarget: "umd",
        umdNamedDefine: true,
    },
});
