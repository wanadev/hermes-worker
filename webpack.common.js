module.exports = {
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.worker.js$/i,
                use: "raw-loader",
            },
        ],
    },
};
