const workerFunction = () => {
    // This code is excuted in worker
    const hermes = new HermesMessenger();
    hermes.onload().then(() => {
        console.log("Worker instance " + hermes.config.threadInstances + " is started");

        console.log("testScript.test > ", test)

        function fibo(n) {
            if (n === 0 || n === 1) {
                return 1;
            }
            return fibo(n - 1) + fibo(n - 2);
        }

        function add(a,b) {
            return a + b;
        }

        hermes.addMethod("add", add);

        hermes.addMethod("fibo", (number) => {
            console.log("Fibo in worker instance " + hermes.config.threadInstances);
            return fibo(number);
        });

        hermes.addMethod("addVector2", (vectorA, vectorB) => {
            return vectorA.add(vectorB);
        });

        hermes.addAsyncMethod("wait", (number) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        data: "your data async",
                        message: "end"
                    });
                }, number);
            });
        });

        hermes.ready();
    });
}