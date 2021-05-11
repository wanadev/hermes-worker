!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define("HermesWorker",[],r):"object"==typeof exports?exports.HermesWorker=r():e.HermesWorker=r()}(window,(function(){return function(e){var r={};function n(s){if(r[s])return r[s].exports;var t=r[s]={i:s,l:!1,exports:{}};return e[s].call(t.exports,t,t.exports,n),t.l=!0,t.exports}return n.m=e,n.c=r,n.d=function(e,r,s){n.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,r){if(1&r&&(e=n(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var t in e)n.d(s,t,function(r){return e[r]}.bind(null,t));return s},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(r,"a",r),r},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="",n(n.s=0)}([function(module,exports,__webpack_require__){eval("const HermesWorker = __webpack_require__(1);\n\nmodule.exports = HermesWorker;\n\n\n//# sourceURL=webpack://HermesWorker/./src/index.js?")},function(module,exports,__webpack_require__){eval('const HermesMessenger = __webpack_require__(2).default;\nconst initFunction = __webpack_require__(3).default;\n\nconst HermesSerializers = __webpack_require__(4);\nconst defautSerializer = __webpack_require__(5);\n\nclass HermesWorker {\n    /**\n     * @param {Function | String} workerFunction is the function instancied in worker\n     * @param {Object} params\n     * @param {Number | String} params.threadInstances is the number of thread instances (the value `auto` is equal to the number of client cores available)\n     * @param {String[]} params.scripts is the urls of scripts when inject on worker (ex: vendor), if multiThread script is downloaded just once\n     * @param {{serialize: Function, unserialize: Function}[]} params.serializers is used to serialize the data sent and received from the worker\n     * @param {Boolean} params.safe if is true Hermes lock the maximum numbers a the recomended by navigator\n     * @param {Object} params.config is the config sent to worker\n     */\n    constructor(workerFunction, params = {}) {\n        this._workerIsUrl = false;\n        this._hermesSerializers = new HermesSerializers();\n        this._hermesMessengerUrl = URL.createObjectURL(this._createBlobWithArray([HermesMessenger]));\n\n        if (typeof workerFunction === "string") {\n            this._fileWorkerUrl = workerFunction;\n            this._workerIsUrl = true;\n        } else {\n            this._workerFunctionUrl = URL.createObjectURL(this._createBlobWithArray([`(${workerFunction.toString()})()`]));\n        }\n\n        this._params = Object.assign({\n            threadInstances: 1,\n            safe: true,\n            scripts: [],\n            serializers: [],\n            config: {},\n        }, params);\n\n        this._MAX_THREAD = navigator.hardwareConcurrency - 1;\n\n        if (this._params.threadInstances === "auto"\n            || this._params.safe && this._params.threadInstances > this._MAX_THREAD) {\n            this._params.threadInstances = this._MAX_THREAD;\n        }\n\n        this._requestQueue = [];\n        this._pendingsCalls = {};\n        this._loadedPromise = [];\n        this._importedScripts = [];\n        this._serializers = [defautSerializer, ...this._params.serializers.reverse()];\n\n        this.numberOfThreadInstances = this._params.threadInstances;\n        this.isLoaded = false;\n\n        this._serializers.forEach(serializer => this._hermesSerializers.addSerializer(serializer));\n\n        this._buildHermesSerializerUrl();\n        this._buildSerializersUrl();\n        this._computeScriptsAndStartWorkers();\n    }\n\n    async _computeScriptsAndStartWorkers() {\n        await this._buildInitWorkerFunction();\n        await this._importScripts();\n        this._workerBlob = this._buildWorker();\n        this._workerURL = URL.createObjectURL(this._workerBlob);\n        this._workerPool = [];\n        this._lastWorkerCall = 0;\n\n        this._startWorkers();\n    }\n\n    /**\n     * A queue to import scripts\n     */\n    _importScripts() {\n        return new Promise((resolve) => {\n            if (this._params.scripts.length === 0) return resolve();\n            this._importScript(0, resolve);\n        });\n    }\n\n    /**\n     *\n     * @param {number} scriptIndex\n     * @param {Promise.Resolve} resolver\n     */\n    _importScript(scriptIndex, resolver) {\n        const scriptLink = this._params.scripts[scriptIndex];\n        return fetch(scriptLink)\n            .then(response => response.text())\n            .then((contentScript) => {\n                this._importedScripts.push(URL.createObjectURL(this._createBlobWithArray([contentScript])));\n                if (scriptIndex === this._params.scripts.length - 1) return resolver();\n                return this._importScript(scriptIndex + 1, resolver);\n            });\n    }\n\n    _cleanBlobUrls() {\n        URL.revokeObjectURL(this._workerFunctionUrl);\n        URL.revokeObjectURL(this._hermesMessengerUrl);\n        URL.revokeObjectURL(this._hermesSerializerUrl);\n        URL.revokeObjectURL(this._initFunctionUrl);\n        URL.revokeObjectURL(this._serializersUrl);\n        this._importedScripts.forEach(url => URL.revokeObjectURL(url));\n        this._importedScripts = [];\n    }\n\n    /**\n     * Create the blob of the worker\n     */\n    _buildWorker() {\n        return this._createBlobWithArray([\n            "window=self;global=self;\\n", // window or global is currently used in libs\n            `importScripts("${this._hermesSerializerUrl}");\\n`,\n            `importScripts("${this._hermesMessengerUrl}");\\n`,\n            `importScripts("${this._serializersUrl}");\\n`,\n            ...this._importedScripts.map(scriptUrl => `importScripts("${scriptUrl}");\\n`),\n            `importScripts("${this._initFunctionUrl}");\\n`,\n        ]);\n    }\n\n    async _buildInitWorkerFunction() {\n        if (this._workerIsUrl) {\n            const response = await fetch(this._fileWorkerUrl);\n            const contentScript = await response.text();\n            this._workerFunctionUrl = URL.createObjectURL(new Blob(this._createBlobWithArray([contentScript])));\n        }\n        this._initFunctionUrl = URL.createObjectURL(this._createBlobWithArray([initFunction]));\n    }\n\n    /**\n     * Build part of script containing Hermes serializers\n     */\n    _buildHermesSerializerUrl() {\n        this._hermesSerializerUrl = URL.createObjectURL(this._createBlobWithArray([\n            "const HermesSerializers = " + HermesSerializers.toString(),\n            "\\nself[\'__serializers__\'] = new HermesSerializers();",\n        ]));\n    }\n\n    _buildSerializersUrl() {\n        this._serializersUrl = URL.createObjectURL(this._createBlobWithArray(\n            this._serializers.map(\n                serializerContent => `\n                    self[\'__serializers__\'].addSerializer({\n                        serialize: ${serializerContent.serialize.toString()}, \n                        unserialize: ${serializerContent.unserialize.toString()}\n                    });\n                `\n            )\n        ));\n    }\n\n    _createBlobWithArray(array) {\n        return new Blob(array, { type: "application/javascript" });\n    }\n\n    /**\n     * Start workers\n     */\n    _startWorkers() {\n        for (let i = 0; i < this._params.threadInstances; i++) {\n\n            this._workerPool[i] = {\n                worker: new Worker(this._workerURL),\n                load: false,\n            };\n\n            this._workerPool[i].worker.onmessage = (answer) => {\n                this._onWorkerMessage(this._workerPool[i], answer.data);\n            };\n\n            this._workerPool[i].worker.onerror = (error) => {\n                this._onWorkerError(error);\n            };\n\n            this._workerPool[i].worker.postMessage({\n                type: "config",\n                data: {\n                    threadInstance: i,\n                    _workerFunctionUrl: this._workerFunctionUrl,\n                    ...this._params.config,\n                },\n            });\n        }\n    }\n\n    /**\n     * Check if all workers are loaded, if is true resolve loaded promise\n     */\n    _checkWorkersLoad() {\n        const fullLoaded = this._workerPool.every(workerObject => workerObject.load);\n        if (fullLoaded) {\n            this.isLoaded = true;\n            this._loadedPromise.forEach(resolve => resolve());\n            this._cleanBlobUrls();\n            this._applyQueue();\n        }\n    }\n\n    _applyQueue() {\n        this._requestQueue.forEach((data) => {\n            const worker = this._getNextWorker();\n            if (!worker) return this._pendingsCalls[data.id].reject(new Error({ err: "worker not found" }));\n            worker.postMessage(data);\n        });\n\n        this._requestQueue = [];\n    }\n\n    /**\n     * Is called by worker for talking to page\n     *\n     * @param {{load: boolean, worker: Worker}} workerObject\n     * @param {Object} answer\n     */\n    _onWorkerMessage(workerObject, answer) {\n        if (answer.type === "ready") {\n            workerObject.load = true;\n            this._checkWorkersLoad();\n        } else if (answer.type === "answer") {\n            if (!this._pendingsCalls[answer.id]) return;\n\n            this._pendingsCalls[answer.id].resolve(this._hermesSerializers.unserializeArgs(answer.result)[0]);\n            delete this._pendingsCalls[answer.id];\n        }\n    }\n\n    /**\n     * Is called from worker in case of thrown error\n     *\n     * TODO: Improve error handling\n     *\n     * @param {any} error\n     */\n    _onWorkerError(error) {\n        console.error(error);\n    }\n\n    /**\n     * Find the next worker free for computing\n     */\n    _getNextWorker() {\n        let nextWorkerIndex = this._lastWorkerCall + 1;\n        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;\n\n        this._lastWorkerCall = nextWorkerIndex;\n        return this._workerPool[nextWorkerIndex].worker;\n    }\n\n    /**\n     * Return promise, resolved when workers are completely loaded\n     */\n    waitLoad() {\n        if (this.isLoaded) return Promise.resolve();\n        return new Promise((resolve) => {\n            this._loadedPromise.push(resolve);\n        });\n    }\n\n    /**\n     * Call function to worker\n     *\n     * @param {String} functionName the name of the function in worker\n     * @param {any[]} args arguments applied to the function\n     */\n    call(functionName, args = []) {\n        return new Promise((resolve, reject) => {\n\n            const data = {\n                type: "call",\n                id: new Date().getTime() + Math.random() * Math.random(),\n                arguments: this._hermesSerializers.serializeArgs(args),\n                name: functionName,\n            };\n            this._pendingsCalls[data.id] = {\n                resolve,\n                reject,\n            };\n\n            if (!this.isLoaded) {\n                this._requestQueue.push(data);\n            } else {\n                const worker = this._getNextWorker();\n                if (!worker) return reject(new Error({ err: "worker not found" }));\n                worker.postMessage(data);\n            }\n        });\n    }\n\n    /**\n     * Terminate Hermes Worker and all webWorkers link to this\n     */\n    terminate() {\n        this._workerPool.forEach((workerObject) => {\n            workerObject.worker.terminate();\n        });\n\n        Object.values(this._pendingsCalls).forEach((pendingCall) => {\n            pendingCall.reject({ error: "Hermes worker is destroyed" });\n        });\n    }\n}\n\nmodule.exports = HermesWorker;\n\n\n//# sourceURL=webpack://HermesWorker/./src/HermesWorker/index.js?')},function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__["default"] = ("// THIS FILE IS LOADED IN WORKER\\n\\n/**\\n * Used in worker to talk to page\\n */\\n/* eslint-disable no-unused-vars */\\nclass HermesMessenger {\\n    constructor() {\\n        this.config = {};\\n        this._loadedPromise = [];\\n        this._routes = {};\\n        this.serializers = __serializers__;\\n        self.addEventListener(\\"message\\", event => this._onEvent(event.data));\\n    }\\n\\n    /**\\n     * Return promise when worker is loaded\\n     */\\n    waitLoad() {\\n        return new Promise((resolve) => {\\n            this._loadedPromise.push(resolve);\\n        });\\n    }\\n\\n    /**\\n     * Send to the page that the worker is ready to use\\n     */\\n    ready() {\\n        this._sendEvent({\\n            type: \\"ready\\",\\n        });\\n    }\\n\\n    /**\\n     * Expose the callback from call by page\\n     *\\n     * @param {String} eventName\\n     * @param {Function} callback\\n     * @param {any} option\\n     */\\n    on(eventName, callback, option = {}) {\\n        if (!option.type) option.type = \\"default\\";\\n\\n        this._routes[eventName] = {\\n            callback,\\n            option,\\n        };\\n    }\\n\\n    /**\\n     * Is called by page for talking to worker\\n     *\\n     * @param {Object} event\\n     */\\n    _onEvent(event) {\\n        if (event.type === \\"config\\") {\\n            this.config = event.data;\\n            this._loadedPromise.forEach(resolve => resolve());\\n        } else if (event.type === \\"call\\") {\\n            this._call(event);\\n        }\\n    }\\n\\n    /**\\n     * Used for calling worker route\\n     *\\n     * @param {Object} data\\n     */\\n    async _call(data) {\\n        if (this._routes[data.name]) {\\n            const args = this.serializers.unserializeArgs(data.arguments);\\n            if (this._routes[data.name].option.type === \\"async\\") {\\n                const result = await this._routes[data.name].callback(...args);\\n                const serializedResult = this.serializers.serializeArgs([result]);\\n                this._sendAnswer(data, serializedResult);\\n            } else {\\n                const result = this._routes[data.name].callback(...args);\\n                const serializedResult = this.serializers.serializeArgs([result]);\\n                this._sendAnswer(data, serializedResult);\\n            }\\n        } else {\\n            throw new Error(data.name + \\" is not found on worker\\");\\n        }\\n    }\\n\\n    /**\\n     * @param {any} data\\n     * @param {number} data.id, id is the unique id of question\\n     * @param {any} result\\n     */\\n    _sendAnswer(data, result) {\\n        this._sendEvent({\\n            type: \\"answer\\",\\n            id: data.id,\\n            result,\\n        });\\n    }\\n\\n    _sendEvent(data) {\\n        self.postMessage(data);\\n    }\\n}\\n");\n\n//# sourceURL=webpack://HermesWorker/./src/HermesMessenger/index.worker.js?')},function(module,__webpack_exports__,__webpack_require__){"use strict";eval('__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__["default"] = ("/* eslint-disable no-undef */\\n// eslint-disable-next-line no-global-assign\\nconst hermes = new HermesMessenger();\\nself.hermes = hermes;\\nhermes.waitLoad().then(() => {\\n    importScripts(hermes.config._workerFunctionUrl);\\n});\\n");\n\n//# sourceURL=webpack://HermesWorker/./src/HermesWorker/initFunction.worker.js?')},function(module,exports){eval('// THIS FILE IS LOAD IN WORKER AND IN PAGE\n\n/**\n * Class used for managing the serializers, in Page and in worker\n */\nclass HermesSerializers {\n    constructor() {\n        this._serializers = [];\n    }\n\n    /**\n     * Add serializer\n     *\n     * @param {{serialize: Function, unserialize: Function}} serializerObject\n     */\n    addSerializer(serializerObject) {\n        if (!serializerObject.serialize || !serializerObject.unserialize) {\n            throw new Error("Serializer required a methods serialize and unserialize", serializerObject);\n        }\n        this._serializers.push(serializerObject);\n    }\n\n    /**\n     * Serialize all args\n     *\n     * @param {any[]} args\n     */\n    serializeArgs(args) {\n        for (let i = this._serializers.length - 1; i >= 0; i--) {\n            args = this._serializers[i].serialize(args);\n        }\n        return args;\n    }\n\n    /**\n     * Unserialize all args\n     *\n     * @param {any[]} args\n     */\n    unserializeArgs(args) {\n        return this._serializers.reduce((args, serializer) => serializer.unserialize(args), args);\n    }\n}\n\nmodule.exports = HermesSerializers;\n\n\n//# sourceURL=webpack://HermesWorker/./src/HermesSerializers/index.js?')},function(module,exports){eval('// THIS FILE IS A COPY OF https://github.com/flozz/threadify/blob/master/src/helpers.js\n\n\nmodule.exports =  {\n    serialize: (args) => {\n        "use strict";\n\n        const typedArray = [\n            "Int8Array",\n            "Uint8Array",\n            "Uint8ClampedArray",\n            "Int16Array",\n            "Uint16Array",\n            "Int32Array",\n            "Uint32Array",\n            "Float32Array",\n            "Float64Array",\n        ];\n        const serializedArgs = [];\n        const transferable = [];\n\n        for (let i = 0; i < args.length; i++) {\n            if (args[i] instanceof Error) {\n                const obj = {\n                    type: "Error",\n                    value: { name: args[i].name },\n                };\n                const keys = Object.getOwnPropertyNames(args[i]);\n                for (let k = 0; k < keys.length; k++) {\n                    obj.value[keys[k]] = args[i][keys[k]];\n                }\n                serializedArgs.push(obj);\n            } else if (args[i] instanceof DataView) {\n                transferable.push(args[i].buffer);\n                serializedArgs.push({\n                    type: "DataView",\n                    value: args[i].buffer,\n                });\n            } else {\n                // transferable: ArrayBuffer\n                if (args[i] instanceof ArrayBuffer) {\n                    transferable.push(args[i]);\n                    args[i] = "hermes__transferable__" + transferable.length - 1;\n\n                // tranferable: ImageData\n                } else if ("ImageData" in self && args[i] instanceof ImageData) {\n                    transferable.push(args[i].data.buffer);\n                    args[i] = {\n                        type: "hermes__transferable__ImageData",\n                        index: transferable.length - 1,\n                        width: args[i].width,\n                    };\n                // tranferable: TypedArray\n                } else {\n                    for (let t = 0; t < typedArray.length; t++) {\n                        if (args[i] instanceof self[typedArray[t]]) {\n                            transferable.push(args[i].buffer);\n                            args[i] = "hermes__transferable__" + transferable.length - 1;\n                            break;\n                        }\n                    }\n                }\n\n                serializedArgs.push({\n                    type: "arg",\n                    value: args[i],\n                });\n            }\n        }\n\n        return {\n            args: JSON.stringify(serializedArgs),\n            transferable,\n        };\n    },\n\n    unserialize: (data) => {\n        "use strict";\n\n        const serializedArgs = JSON.parse(data.args) || [];\n\n        const args = [];\n\n        for (let i = 0; i < serializedArgs.length; i++) {\n            switch (serializedArgs[i].type) {\n                case "arg":\n                    if (typeof serializedArgs[i].value === "object" && serializedArgs[i].value.type === "hermes__transferable__ImageData") {\n                        const buffer = data.transferable[serializedArgs[i].value.index];\n                        args.push(new ImageData(new Uint8ClampedArray(buffer), serializedArgs[i].value.width));\n                    } else if (serializedArgs[i].value && serializedArgs[i].value.startWith && serializedArgs[i].value.startWith("hermes__transferable__")) {\n                        const transferableIndex = serializedArgs[i].value.replace("hermes__transferable__", "");\n                        args.push(data.transferable[transferableIndex]);\n                    } else {\n                        args.push(serializedArgs[i].value);\n                    }\n                    break;\n                case "Error":\n                    const obj = new Error();\n                    for (const key in serializedArgs[i].value) {\n                        obj[key] = serializedArgs[i].value[key];\n                    }\n                    args.push(obj);\n                    break;\n                case "DataView":\n                    args.push(new DataView(serializedArgs[i].value));\n                    break;\n                default:\n                    break;\n            }\n        }\n\n        return args;\n    },\n};\n\n\n//# sourceURL=webpack://HermesWorker/./src/HermesSerializers/defautSerializer.js?')}])}));