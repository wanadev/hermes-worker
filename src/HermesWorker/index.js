const HermesMessenger = require("../HermesMessenger/index.worker").default;
const initFunction = require("./initFunction.worker").default;

const HermesSerializers = require("../HermesSerializers");
const defautSerializer = require("../HermesSerializers/defautSerializer");

class HermesWorker {
    /**
     * @param {Function | String} workerFunction is the function instancied in worker
     * @param {Object} params
     * @param {Number | String} params.threadInstances is the number of thread instances (the value `auto` is equal to the number of client cores available)
     * @param {String[]} params.scripts is the urls of scripts when inject on worker (ex: vendor), if multiThread script is downloaded just once
     * @param {{serialize: Function, unserialize: Function}[]} params.serializers is used to serialize the data sent and received from the worker
     * @param {Boolean} params.safe if is true Hermes lock the maximum numbers a the recomended by navigator
     * @param {Object} params.config is the config sent to worker
     */
    constructor(workerFunction, params = {}) {
        this._workerIsUrl = false;
        this._hermesSerializers = new HermesSerializers();
        this._hermesMessengerUrl = URL.createObjectURL(this._createBlobWithArray([HermesMessenger]));

        if (typeof workerFunction === "string") {
            this._fileWorkerUrl = workerFunction;
            this._workerIsUrl = true;
        } else {
            this._workerFunctionUrl = URL.createObjectURL(this._createBlobWithArray([`(${workerFunction.toString()})()`]));
        }

        this._params = Object.assign({
            threadInstances: 1,
            safe: true,
            scripts: [],
            serializers: [],
            config: {},
        }, params);

        this._MAX_THREAD = navigator.hardwareConcurrency - 1;

        if (this._params.threadInstances === "auto"
            || this._params.safe && this._params.threadInstances > this._MAX_THREAD) {
            this._params.threadInstances = this._MAX_THREAD;
        }

        this._requestQueue = [];
        this._pendingsCalls = {};
        this._loadedPromises = [];
        this._importedScripts = [];
        this._serializers = [defautSerializer, ...this._params.serializers.reverse()];

        this.numberOfThreadInstances = this._params.threadInstances;
        this.isLoaded = false;
        this._loadError = null;

        this._serializers.forEach(serializer => this._hermesSerializers.addSerializer(serializer));

        this._buildHermesSerializerUrl();
        this._buildSerializersUrl();
        this._computeScriptsAndStartWorkers();
    }

    async _computeScriptsAndStartWorkers() {
        await this._buildInitWorkerFunction();
        await this._importScripts();
        this._workerBlob = this._buildWorker();
        this._workerURL = URL.createObjectURL(this._workerBlob);
        this._workerPool = [];
        this._lastWorkerCall = 0;

        this._startWorkers();
    }

    /**
     * A queue to import scripts
     */
    _importScripts() {
        return new Promise((resolve) => {
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
        return fetch(scriptLink)
            .then(response => response.text())
            .then((contentScript) => {
                this._importedScripts.push(URL.createObjectURL(this._createBlobWithArray([contentScript])));
                if (scriptIndex === this._params.scripts.length - 1) return resolver();
                return this._importScript(scriptIndex + 1, resolver);
            });
    }

    _cleanBlobUrls() {
        URL.revokeObjectURL(this._workerFunctionUrl);
        URL.revokeObjectURL(this._hermesMessengerUrl);
        URL.revokeObjectURL(this._hermesSerializerUrl);
        URL.revokeObjectURL(this._initFunctionUrl);
        URL.revokeObjectURL(this._serializersUrl);
        this._importedScripts.forEach(url => URL.revokeObjectURL(url));
        this._importedScripts = [];
    }

    /**
     * Create the blob of the worker
     */
    _buildWorker() {
        return this._createBlobWithArray([
            "window=self;global=self;\n", // window or global is currently used in libs
            `importScripts("${this._hermesSerializerUrl}");\n`,
            `importScripts("${this._hermesMessengerUrl}");\n`,
            `importScripts("${this._serializersUrl}");\n`,
            ...this._importedScripts.map(scriptUrl => `importScripts("${scriptUrl}");\n`),
            `importScripts("${this._initFunctionUrl}");\n`,
        ]);
    }

    async _buildInitWorkerFunction() {
        if (this._workerIsUrl) {
            const response = await fetch(this._fileWorkerUrl);
            const contentScript = await response.text();
            this._workerFunctionUrl = URL.createObjectURL(new Blob(this._createBlobWithArray([contentScript])));
        }
        this._initFunctionUrl = URL.createObjectURL(this._createBlobWithArray([initFunction]));
    }

    /**
     * Build part of script containing Hermes serializers
     */
    _buildHermesSerializerUrl() {
        this._hermesSerializerUrl = URL.createObjectURL(this._createBlobWithArray([
            "const HermesSerializers = " + HermesSerializers.toString(),
            "\nself['__serializers__'] = new HermesSerializers();",
        ]));
    }

    _buildSerializersUrl() {
        this._serializersUrl = URL.createObjectURL(this._createBlobWithArray(
            this._serializers.map(
                serializerContent => `
                    self['__serializers__'].addSerializer({
                        serialize: ${serializerContent.serialize.toString()}, 
                        unserialize: ${serializerContent.unserialize.toString()}
                    });
                `
            )
        ));
    }

    _createBlobWithArray(array) {
        return new Blob(array, { type: "application/javascript" });
    }

    /**
     * Start workers
     */
    _startWorkers() {
        for (let i = 0; i < this._params.threadInstances; i++) {

            this._workerPool[i] = {
                worker: new Worker(this._workerURL),
                load: false,
            };

            this._workerPool[i].worker.onmessage = (answer) => {
                this._onWorkerMessage(this._workerPool[i], answer.data);
            };

            this._workerPool[i].worker.onerror = (error) => {
                this._onWorkerError(error, i);
            };

            this._workerPool[i].worker.postMessage({
                type: "config",
                data: {
                    threadInstance: i,
                    _workerFunctionUrl: this._workerFunctionUrl,
                    ...this._params.config,
                },
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
            this._loadedPromises.forEach(({ resolve }) => resolve());
            this._cleanBlobUrls();
            this._applyQueue();
        }
    }

    _applyQueue() {
        this._requestQueue.forEach((data) => {
            const { worker, workerIndex } = this._getNextWorker();
            if (!worker) return this._pendingsCalls[data.id].reject(new Error({ err: "worker not found" }));
            this._pendingsCalls[data.id].workerIndex = workerIndex;
            worker.postMessage(data, data.arguments.transferable);
        });

        this._requestQueue = [];
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
        } else if (answer.type === "answer") {
            if (!this._pendingsCalls[answer.id]) return;

            this._pendingsCalls[answer.id].resolve(this._hermesSerializers.unserializeArgs(answer.result)[0]);
            delete this._pendingsCalls[answer.id];
        } else if (answer.type === "error") {
            if (!this._pendingsCalls[answer.id]) return;

            this._pendingsCalls[answer.id].reject(answer.error);
            delete this._pendingsCalls[answer.id];
        }
    }

    /**
     * Is called from worker in case of thrown error
     *
     * @param {any} error
     * @param {number} workerIndex
     */
    _onWorkerError(error, workerIndex) {
        if (!this.isLoaded) {
            this._loadError = error;
            this._loadedPromises.forEach(({ reject }) => reject(error));
        }
        Object.values(this._pendingsCalls).forEach((pendingCall) => {
            if (workerIndex === pendingCall.workerIndex) pendingCall.reject(error);
        });
    }

    /**
     * Find the next worker free for computing
     */
    _getNextWorker() {
        let nextWorkerIndex = this._lastWorkerCall + 1;
        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;

        this._lastWorkerCall = nextWorkerIndex;
        return { worker: this._workerPool[nextWorkerIndex].worker, workerIndex: nextWorkerIndex };
    }

    /**
     * Return promise, resolved when workers are completely loaded
     */
    waitLoad() {
        if (this.isLoaded) return Promise.resolve();
        if (this._loadError) return Promise.reject(this._loadError);
        return new Promise((resolve, reject) => {
            this._loadedPromises.push({ resolve, reject });
        });
    }

    /**
     * Call function to worker
     *
     * @param {String} functionName the name of the function in worker
     * @param {any[]} args arguments applied to the function
     */
    call(functionName, args = []) {
        if (this._loadError) return Promise.reject(this._loadError);
        return new Promise((resolve, reject) => {

            const data = {
                type: "call",
                id: new Date().getTime() + Math.random() * Math.random(),
                arguments: this._hermesSerializers.serializeArgs(args),
                name: functionName,
            };
            this._pendingsCalls[data.id] = {
                resolve,
                reject,
            };

            if (!this.isLoaded) {
                this._requestQueue.push(data);
            } else {
                const { worker, workerIndex } = this._getNextWorker();
                if (!worker) return reject(new Error({ err: "worker not found" }));
                this._pendingsCalls[data.id].workerIndex = workerIndex;
                worker.postMessage(data, data.arguments.transferable);
            }
        });
    }

    /**
     * Terminate Hermes Worker and all webWorkers link to this
     */
    terminate() {
        this._workerPool.forEach((workerObject) => {
            workerObject.worker.terminate();
        });

        Object.values(this._pendingsCalls).forEach((pendingCall) => {
            pendingCall.reject({ error: "Hermes worker is destroyed" });
        });
    }
}

module.exports = HermesWorker;
