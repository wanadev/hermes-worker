/* eslint-disable no-undef */

window.onload = async () => {
    const worker = new HermesWorker(workerFunction, {
        threadInstances: "auto",
        config: { api_url: "localhost" },
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

    console.log("Send Transferable");
    let buffer = new ArrayBuffer(16);
    result = await worker.call("transferable", [buffer]);

    if (buffer.byteLength) {
        console.log("Transferables are not supported in your browser!");
    } else {
        console.log("Transferables are supported in your browser!");
    }

    buffer = new ArrayBuffer(16);
    const typed = new Uint16Array(buffer);
    typed.set([1, 2, 3], 0);
    await worker.call("logTypeArray", [typed]);

    console.log("Transfer 128MB");
    const transferUInt = new Uint8Array(1024 * 1024 * 128);
    for (let i = 0; i < transferUInt.length; ++i) {
        transferUInt[i] = i;
    }

    await worker.call("time-transfer", [new Date(), transferUInt]);

    console.log("Copy 128MB");
    const copyUInt = new Uint8Array(1024 * 1024 * 128);
    for (let i = 0; i < copyUInt.length; ++i) {
        copyUInt[i] = i;
    }
    await worker.call("time-transfer", [new Date(), { complexObject: copyUInt }]);
};
