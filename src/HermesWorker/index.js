import HermesMessenger from "../HermesMessenger/index.worker";

export default class HermesWorker {
    constructor(workerFunction, params = {}) {
        this._params = Object.assign({
            numberWorkers: 1
        }, params);

        if (this._params.numberWorkers === "max") this._params.numberWorkers = navigator.hardwareConcurrency;

        this._pendingsCalls = {};
        this._loadedPromise = [];

        this._workerBlob = this._buildWorker(workerFunction);
        this._workerURL = URL.createObjectURL(this._workerBlob);
        this._workerPool = [];
        this._lastWorkerCall = 0;

        this._startWorkers();
    }

    _buildWorker(workerFunction) {
        return new Blob([
            "var window=this;var global=this;",
            HermesMessenger,
            "(" + workerFunction.toString() + ")()",
        ],
        {
            type: "application/javascript",
        });
    }

    _startWorkers() {
        for(let i = 0; i < this._params.numberWorkers; i++) {

            this._workerPool[i] = {
                worker: new Worker(this._workerURL),
                load: false
            };

            this._workerPool[i].worker.onmessage = (anwser) => {
                this._onWorkerMessage(this._workerPool[i], anwser.data);
            }

            this._workerPool[i].worker.onerror = (error) => {
                this._onWorkerError(error);
            }

            this._workerPool[i].worker.postMessage({
                type: "config",
                data: {
                    workerInstance: i,
                }
            });
        }
    }

    _checkLoaded() {
        const fullLoad = this._workerPool.every(workerObject => workerObject.load);
        if (fullLoad) this._loadedPromise.forEach(resolve => resolve());
    }

    _onWorkerMessage(workerObject, anwser) {
        if (anwser.type === "loaded") {
            workerObject.load = true;
            this._checkLoaded();
        }
        else if (anwser.type === "anwser") {
            if (this._pendingsCalls[anwser.id]) {
                this._pendingsCalls[anwser.id].resolve(anwser.result);
                delete this._pendingsCalls[anwser.id];
            }
        }
    }

    _onWorkerError(error) {
        console.error(error);
    }

    _getNextWorker() {
        let nextWorkerIndex = this._lastWorkerCall + 1;
        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;

        this._lastWorkerCall = nextWorkerIndex;
        return this._workerPool[nextWorkerIndex].worker;
    }

    onload() {
        return new Promise(resolve => {
            this._loadedPromise.push(resolve);
        });
    }

    call(functionName, args = []) {
        return new Promise((resolve, reject) => {
            const worker = this._getNextWorker();
            if (worker) {
                const data = {
                    type: "call",
                    id: new Date().getTime() + Math.random() * Math.random(),
                    arguments: args,
                    name: functionName,
                };
                this._pendingsCalls[data.id] = {
                    resolve,
                    reject,
                };
                worker.postMessage(data);
            }
        });
    }
}
