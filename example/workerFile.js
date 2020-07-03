/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
// const workerFunction = () => {
// This code is excuted in worker
console.log("Worker instance " + hermes.config.threadInstance + " is started");

if (hermes.config.threadInstance === 0) console.log("testScript.test > ", test);

function fibo(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return fibo(n - 1) + fibo(n - 2);
}

function add(a, b) {
    return a + b;
}

hermes.on("add", add);

hermes.on("fibo", (number) => {
    console.log("Fibo in worker instance " + hermes.config.threadInstance);
    return fibo(number);
});

hermes.on("addVector2", (vectorA, vectorB) => vectorA.add(vectorB));

hermes.on("wait", number => new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            data: "your data async",
            message: "end",
        });
    }, number);
}), { type: "async" });

hermes.ready();
// };
