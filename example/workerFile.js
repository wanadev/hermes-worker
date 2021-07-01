/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
const workerFunction = () => {
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

    hermes.on("log", (...args) => console.log(args));

    hermes.on("transferable", obj => null);
    hermes.on("logTypeArray", (typedArray) => {
        console.log(typedArray);
    });

    hermes.on("time-transfer", (date, bigFile) => {
        console.log(`${new Date().getTime() - date.getTime()}ms`);
    });

    hermes.on("canvas2D", (canvas) => {
        const ctx = canvas.getContext("2d");
        ctx.font = "36px serif";
        let x = 0;
        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            x++;
            ctx.fillText("Hermes Worker !", (x + 50) % canvas.width, 50);
            ctx.fillText("I'm draw in worker !", (x - 100) % canvas.width, 100);
        }, 20);
    });

    hermes.ready();
};
