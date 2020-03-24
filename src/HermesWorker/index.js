import HermesMessenger from "../HermesMessenger/index.worker";

import HermesSerializers from "../HermesSerializers";
import defautSerializer from "../HermesSerializers/defautSerializer"

export default class HermesWorker {
    constructor(workerFunction, params = {}) {
        this.hermesSerializers = new HermesSerializers();

        this._params = Object.assign({
            threadInstances: 1,
            scripts: [],
            serializers: [],
            config: {}
        }, params);

        if (this._params.threadInstances === "auto") this._params.threadInstances = navigator.hardwareConcurrency - 1;

        this._pendingsCalls = {};
        this._loadedPromise = [];
        this._importedScripts = [];
        this._serializers = [defautSerializer, ...this._params.serializers.reverse()];

        this._serializers.forEach(serializer => this.hermesSerializers.addSerializer(serializer));

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
            ...this._buildHermesSerializer(),
            HermesMessenger,
            "const worker_require = n => require(n);",
            ...this._serializers.map(serializerContent => `
                \nwindow['__serializers__'].addSerializer({serialize: ${serializerContent.serialize}, unserialize: ${serializerContent.unserialize}});\n
            `),
            ...this._importedScripts.map(scriptContent => `\n${scriptContent};\n `),
            "(" + workerFunction.toString() + ")()",
        ],
        {
            type: "application/javascript",
        });
    }

    _buildHermesSerializer() {
        return [
            `${HermesSerializers.toString()}\n`,
            "window['__serializers__'] = new HermesSerializers();\n",
        ];
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
                    threadInstance: i,
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

            this._pendingsCalls[anwser.id].resolve(this.hermesSerializers.unserializeArgs(anwser.result)[0]);
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
                arguments: this.hermesSerializers.serializeArgs(args),
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
