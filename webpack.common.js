module.exports = {
    entry: "./src/index.js",
    devtool: "eval", // Please not remove this ! Is use for not uglify code (production mode)
    module: {
        rules: [
            {
                test: /\.worker.js$/i,
                use: "raw-loader",
            },
        ],
    },
};
