window.onload = () => {
    const worker = new hermes.HermesWorker(workerFunction, { 
        threadInstances: "auto",
        config: {__pluginurl: "localhost:3066"},
        scripts: [
            "https://cdn.babylonjs.com/babylon.js",
            "./importedScript/testScript.js",
        ],
        serializers: [
            BABYLON_VECTOR_SERIALIZER
        ]
    });

    worker.onload().then(() => {
        console.info("Worker is ready");

        worker.call("wait", [50]).then(result => {
            console.log(result);
        });
        
        worker.call('add', [1, 2]).then(result => {
            console.log("add", result);
        });

        for(let i = 0; i < 3; i++) {
            worker.call('fibo', [12 + i]).then(result => {
                console.log("fibo", result);
            });
        }

        worker.call("addVector2", [new BABYLON.Vector2(10,20), new BABYLON.Vector2(90,80)]).then(result => {
            console.log("addVector2", result);
        });
    });
}

