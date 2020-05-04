import HermesMessenger from "../HermesMessenger/index.worker";

import HermesSerializers from "../HermesSerializers";
import defautSerializer from "../HermesSerializers/defautSerializer"

export default class HermesWorker {
    /**
     * 
     * @param {Function} workerFunction is the function instancied in worker
     * @param {Object} params
     * @param {Number | String} params.threadInstances is the number of thread instances (the value `auto` is equal to the number of client cores available)
     * @param {String[]} params.scripts is the urls of scripts when inject on worker (ex: vendor), if multiThread script is downloaded just once
     * @param {{serialize: Function, unserialize: Function}[]} params.serializers is used to serialize the data sent and received from the worker  
     * @param {Object} params.config is the config sent to worker
     */
    constructor(workerFunction, params = {}) {
        this.hermesSerializers = new HermesSerializers();
        this.isLoaded = false;

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

    /**
     * A queue to import scripts
     */
    _importScripts() {
        return new Promise(resolve => {
            if (this._params.scripts.length === 0) return resolve();
            this._importScript(0, resolve);
        });
    }

    /**
     * 
     * @param {number} scriptIndex
     * @param {Promise.Resolve} resolver 
     */
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

    /**
     * Create the blob of the worker
     * 
     * @param {Function} workerFunction 
     */
    _buildWorker(workerFunction) {
        return new Blob([
            ...this._buildHermesSerializer(),
            HermesMessenger,
            "const worker_require = n => require(n);",
            ...this._serializers.map(serializerContent => `
                \nself['__serializers__'].addSerializer({serialize: ${serializerContent.serialize}, unserialize: ${serializerContent.unserialize}});\n
            `),
            ...this._importedScripts.map(scriptContent => `\n${scriptContent};\n `),
            "(" + workerFunction.toString() + ")()",
        ],
        {
            type: "application/javascript",
        });
    }

    /**
     * Build part of script containing Hermes serializers
     */
    _buildHermesSerializer() {
        return [
            `${HermesSerializers.toString()}\n`,
            "self['__serializers__'] = new HermesSerializers();\n",
        ];
    }

    /**
     * Start workers
     */
    _startWorkers() {
        for(let i = 0; i < this._params.threadInstances; i++) {

            this._workerPool[i] = {
                worker: new Worker(this._workerURL),
                load: false
            };

            this._workerPool[i].worker.onmessage = (answer) => {
                this._onWorkerMessage(this._workerPool[i], answer.data);
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

    /**
     * Check if all workers are loaded, if is true resolve loaded promise
     */
    _checkWorkersLoad() {
        const fullLoaded = this._workerPool.every(workerObject => workerObject.load);
        if (fullLoaded) {
            this.isLoaded = true;
            this._loadedPromise.forEach(resolve => resolve());
        }
    }

    /**
     * Is called by worker for talking to page
     *
     * @param {{load: boolean, worker: Worker}} workerObject 
     * @param {Object} answer 
     */
    _onWorkerMessage(workerObject, answer) {
        if (answer.type === "ready") {
            workerObject.load = true;
            this._checkWorkersLoad();
        }
        else if (answer.type === "answer") {
            if (!this._pendingsCalls[answer.id]) return;

            this._pendingsCalls[answer.id].resolve(this.hermesSerializers.unserializeArgs(answer.result)[0]);
            delete this._pendingsCalls[answer.id];
        }
    }

    /**
     * Is called from worker in case of thrown error
     * 
     * TODO: Improve error handling
     * 
     * @param {any} error 
     */
    _onWorkerError(error) {
        console.error(error);
    }

    /**
     * Find the next worker free for computing
     */
    _getNextWorker() {
        let nextWorkerIndex = this._lastWorkerCall + 1;
        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;

        this._lastWorkerCall = nextWorkerIndex;
        return this._workerPool[nextWorkerIndex].worker;
    }

    /**
     * Return promise, resolved when workers are completely loaded
     */
    onload() {
        if (this.isLoaded) return Promise.resolve();
        return new Promise(resolve => {
            this._loadedPromise.push(resolve);
        });
    }
    
    /**
     * Call function to worker
     * 
     * @param {String} functionName the name of the function in worker
     * @param {any[]} args arguments applied to the function
     */
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
