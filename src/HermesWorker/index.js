import HermesMessenger from "../HermesMessenger/index.worker";

export default class HermesWorker {
    constructor(workerFunction, params = {}) {
        this._params = Object.assign({
            threadInstances: 1,
            scripts: [],
            config: {}
        }, params);

        if (this._params.threadInstances === "auto") this._params.threadInstances = navigator.hardwareConcurrency - 1;

        this._pendingsCalls = {};
        this._loadedPromise = [];
        this._importedScripts = [];

        this._importScripts().then(() => {
            this._workerBlob = this._buildWorker(workerFunction);
            this._workerURL = URL.createObjectURL(this._workerBlob);
            this._workerPool = [];
            this._lastWorkerCall = 0;
    
            this._startWorkers();
        });
    }

    _importScripts() {
        return new Promise(resolve => {
            if (this._params.scripts.length === 0) return resolve();
            this._importScript(0, resolve);
        });
    }

    _importScript(scriptIndex, resolver) {
        const scriptLink = this._params.scripts[scriptIndex];
        return fetch(scriptLink, {
            mode: "cors",
        })
            .then((response) => {
                return response.text();
            })
            .then((contentScript) => {
                this._importedScripts.push(contentScript)

                if (scriptIndex === this._params.scripts.length -1) return resolver();
                return this._importScript(scriptIndex + 1, resolver);
            });
    }

    _buildWorker(workerFunction) {
        return new Blob([
            "var window=this;var global=this;",
            HermesMessenger,
            "const worker_require = n => require(n);",
            ...this._importedScripts.map(scriptContent => `\n${scriptContent};\n `),
            "(" + workerFunction.toString() + ")()",
        ],
        {
            type: "application/javascript",
        });
    }

    _startWorkers() {
        for(let i = 0; i < this._params.threadInstances; i++) {

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
                    threadInstances: i,
                    ... this._params.config
                }
            });
        }
    }

    _checkWorkersLoad() {
        const fullLoaded = this._workerPool.every(workerObject => workerObject.load);
        if (fullLoaded) this._loadedPromise.forEach(resolve => resolve());
    }

    _onWorkerMessage(workerObject, anwser) {
        if (anwser.type === "loaded") {
            workerObject.load = true;
            this._checkWorkersLoad();
        }
        else if (anwser.type === "anwser") {
            if (!this._pendingsCalls[anwser.id]) return;

            this._pendingsCalls[anwser.id].resolve(anwser.result);
            delete this._pendingsCalls[anwser.id];
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
        const worker = this._getNextWorker();
        return new Promise((resolve, reject) => {
            if (!worker) return reject({err: "worker not found"});

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
        });
    }
}
