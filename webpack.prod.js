const path = require("path");
const { execSync } = require("child_process");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const buildInfo = require("./package.json");

const folderPath = path.resolve(__dirname, "./builds");

module.exports = merge(common, {
    mode: "development",
    output: {
        path: folderPath,
        filename: `./hermes-${buildInfo.version}.js`,
        library: "hermes",
        libraryTarget: "umd",
        umdNamedDefine: true,
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
                    execSync(`cp ${path.resolve(folderPath, `./hermes-${buildInfo.version}.js`)} ${folderPath}/latest.js`);
                });
            },
        },
    ],
});
