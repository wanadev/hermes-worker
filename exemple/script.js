window.onload = () => {
    const worker = new hermes.HermesWorker(workerFunction, { 
        threadInstances: "auto",
        config: {__pluginurl: "localhost:3066"},
        scripts: [
            "https://cdn.babylonjs.com/babylon.js",
            "./importedScript/testScript.js",
        ]
    });

    worker.onload().then(() => {
        console.log("Worker is ready");

        worker.call("wait", [50]).then(result => {
            console.log(result);
        });
        
        worker.call('add', [1, 2]).then(result => {
            console.log("add", result);
        });

        for(let i = 0; i < 4; i++) {
            worker.call('fibo', [12 + i]).then(result => {
                console.log("fibo", result);
            });
        }
    });
}

