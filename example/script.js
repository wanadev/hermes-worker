/* eslint-disable no-undef */

window.onload = async () => {
    const worker = new HermesWorker(workerFunction, {
        threadInstances: "auto",
        config: { __pluginurl: "localhost:3066" },
        scripts: [
            "https://cdn.babylonjs.com/babylon.js",
            "./importedScript/testScript.js",
        ],
        serializers: [
            BABYLON_VECTOR_SERIALIZER,
        ],
    });

    let result = await worker.call("wait", [50]);
    console.log("wait", result);

    result = await worker.call("add", [1, 2]);
    console.log("add", result);

    for (let i = 0; i < worker.numberOfThreadInstances; i++) {
        worker.call("fibo", [12 + i]).then((result) => {
            console.log("fibo", result);
        });
    }

    result = await worker.call("addVector2", [new BABYLON.Vector2(10, 20), new BABYLON.Vector2(90, 80)]);
    console.log("addVector2", result);
};
