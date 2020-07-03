(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("hermes", [], factory);
	else if(typeof exports === 'object')
		exports["hermes"] = factory();
	else
		root["hermes"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/HermesMessenger/index.worker.js":
/*!*********************************************!*\
  !*** ./src/HermesMessenger/index.worker.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"// THIS FILE IS LOADED IN WORKER\\n\\n/**\\n * Used in worker to talk to page\\n */\\n/* eslint-disable no-unused-vars */\\nclass HermesMessenger {\\n    constructor() {\\n        this.config = {};\\n        this._loadedPromise = [];\\n        this._routes = {};\\n        this.serializers = __serializers__;\\n        self.addEventListener(\\\"message\\\", event => this._onEvent(event.data));\\n    }\\n\\n    /**\\n     * Return promise when worker is loaded\\n     */\\n    waitLoad() {\\n        return new Promise((resolve) => {\\n            this._loadedPromise.push(resolve);\\n        });\\n    }\\n\\n    /**\\n     * Send to the page that the worker is ready to use\\n     */\\n    ready() {\\n        this._sendEvent({\\n            type: \\\"ready\\\",\\n        });\\n    }\\n\\n    /**\\n     * Expose the callback from call by page\\n     *\\n     * @param {String} eventName\\n     * @param {Function} callback\\n     * @param {any} option\\n     */\\n    on(eventName, callback, option = {}) {\\n        if (!option.type) option.type = \\\"default\\\";\\n\\n        this._routes[eventName] = {\\n            callback,\\n            option,\\n        };\\n    }\\n\\n    /**\\n     * Is called by page for talking to worker\\n     *\\n     * @param {Object} event\\n     */\\n    _onEvent(event) {\\n        if (event.type === \\\"config\\\") {\\n            this.config = event.data;\\n            this._loadedPromise.forEach(resolve => resolve());\\n        } else if (event.type === \\\"call\\\") {\\n            this._call(event);\\n        }\\n    }\\n\\n    /**\\n     * Used for calling worker route\\n     *\\n     * @param {Object} data\\n     */\\n    async _call(data) {\\n        if (this._routes[data.name]) {\\n            const args = this.serializers.unserializeArgs(data.arguments);\\n            if (this._routes[data.name].option.type === \\\"async\\\") {\\n                const result = await this._routes[data.name].callback(...args);\\n                const serializedResult = this.serializers.serializeArgs([result]);\\n                this._sendAnswer(data, serializedResult);\\n            } else {\\n                const result = this._routes[data.name].callback(...args);\\n                const serializedResult = this.serializers.serializeArgs([result]);\\n                this._sendAnswer(data, serializedResult);\\n            }\\n        } else {\\n            throw new Error(data.name + \\\" is not found on worker\\\");\\n        }\\n    }\\n\\n    /**\\n     * @param {any} data\\n     * @param {number} data.id, id is the unique id of question\\n     * @param {any} result\\n     */\\n    _sendAnswer(data, result) {\\n        this._sendEvent({\\n            type: \\\"answer\\\",\\n            id: data.id,\\n            result,\\n        });\\n    }\\n\\n    _sendEvent(data) {\\n        self.postMessage(data);\\n    }\\n}\\n\");\n\n//# sourceURL=webpack://hermes/./src/HermesMessenger/index.worker.js?");

/***/ }),

/***/ "./src/HermesSerializers/defautSerializer.js":
/*!***************************************************!*\
  !*** ./src/HermesSerializers/defautSerializer.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// THIS FILE IS A COPY OF https://github.com/flozz/threadify/blob/master/src/helpers.js\n\n\nmodule.exports =  {\n    serialize: (args) => {\n        \"use strict\";\n\n        const typedArray = [\n            \"Int8Array\",\n            \"Uint8Array\",\n            \"Uint8ClampedArray\",\n            \"Int16Array\",\n            \"Uint16Array\",\n            \"Int32Array\",\n            \"Uint32Array\",\n            \"Float32Array\",\n            \"Float64Array\",\n        ];\n        const serializedArgs = [];\n        const transferable = [];\n\n        for (let i = 0; i < args.length; i++) {\n            if (args[i] instanceof Error) {\n                const obj = {\n                    type: \"Error\",\n                    value: { name: args[i].name },\n                };\n                const keys = Object.getOwnPropertyNames(args[i]);\n                for (let k = 0; k < keys.length; k++) {\n                    obj.value[keys[k]] = args[i][keys[k]];\n                }\n                serializedArgs.push(obj);\n            } else if (args[i] instanceof DataView) {\n                transferable.push(args[i].buffer);\n                serializedArgs.push({\n                    type: \"DataView\",\n                    value: args[i].buffer,\n                });\n            } else {\n                // transferable: ArrayBuffer\n                if (args[i] instanceof ArrayBuffer) {\n                    transferable.push(args[i]);\n\n                // tranferable: ImageData\n                } else if (\"ImageData\" in self && args[i] instanceof ImageData) {\n                    transferable.push(args[i].data.buffer);\n\n                // tranferable: TypedArray\n                } else {\n                    for (let t = 0; t < typedArray.length; t++) {\n                        if (args[i] instanceof self[typedArray[t]]) {\n                            transferable.push(args[i].buffer);\n                            break;\n                        }\n                    }\n                }\n\n                serializedArgs.push({\n                    type: \"arg\",\n                    value: args[i],\n                });\n            }\n        }\n\n        return {\n            args: serializedArgs,\n            transferable,\n        };\n    },\n\n    unserialize: (data) => {\n        \"use strict\";\n\n        const serializedArgs = data.args || [];\n\n        const args = [];\n\n        for (let i = 0; i < serializedArgs.length; i++) {\n            switch (serializedArgs[i].type) {\n                case \"arg\":\n                    args.push(serializedArgs[i].value);\n                    break;\n                case \"Error\":\n                    const obj = new Error();\n                    for (const key in serializedArgs[i].value) {\n                        obj[key] = serializedArgs[i].value[key];\n                    }\n                    args.push(obj);\n                    break;\n                case \"DataView\":\n                    args.push(new DataView(serializedArgs[i].value));\n                    break;\n                default:\n                    break;\n            }\n        }\n\n        return args;\n    },\n};\n\n\n//# sourceURL=webpack://hermes/./src/HermesSerializers/defautSerializer.js?");

/***/ }),

/***/ "./src/HermesSerializers/index.js":
/*!****************************************!*\
  !*** ./src/HermesSerializers/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// THIS FILE IS LOAD IN WORKER AND IN PAGE\n\n/**\n * Class used for managing the serializers, in Page and in worker\n */\nclass HermesSerializers {\n    constructor() {\n        this._serializers = [];\n    }\n\n    /**\n     * Add serializer\n     *\n     * @param {{serialize: Function, unserialize: Function}} serializerObject\n     */\n    addSerializer(serializerObject) {\n        if (!serializerObject.serialize || !serializerObject.unserialize) {\n            throw new Error(\"Serializer required a methods serialize and unserialize\", serializerObject);\n        }\n        this._serializers.push(serializerObject);\n    }\n\n    /**\n     * Serialize all args\n     *\n     * @param {any[]} args\n     */\n    serializeArgs(args) {\n        for (let i = this._serializers.length - 1; i >= 0; i--) {\n            args = this._serializers[i].serialize(args);\n        }\n        return args;\n    }\n\n    /**\n     * Unserialize all args\n     *\n     * @param {any[]} args\n     */\n    unserializeArgs(args) {\n        return this._serializers.reduce((args, serializer) => serializer.unserialize(args), args);\n    }\n}\n\nmodule.exports = HermesSerializers;\n\n\n//# sourceURL=webpack://hermes/./src/HermesSerializers/index.js?");

/***/ }),

/***/ "./src/HermesWorker/index.js":
/*!***********************************!*\
  !*** ./src/HermesWorker/index.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return HermesWorker; });\n/* harmony import */ var _HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../HermesMessenger/index.worker */ \"./src/HermesMessenger/index.worker.js\");\n/* harmony import */ var _initFunction_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./initFunction.worker */ \"./src/HermesWorker/initFunction.worker.js\");\n/* harmony import */ var _HermesSerializers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../HermesSerializers */ \"./src/HermesSerializers/index.js\");\n/* harmony import */ var _HermesSerializers__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_HermesSerializers__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../HermesSerializers/defautSerializer */ \"./src/HermesSerializers/defautSerializer.js\");\n/* harmony import */ var _HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n\n\nclass HermesWorker {\n    /**\n     * @param {Function} workerFunction is the function instancied in worker\n     * @param {Object} params\n     * @param {Number | String} params.threadInstances is the number of thread instances (the value `auto` is equal to the number of client cores available)\n     * @param {String[]} params.scripts is the urls of scripts when inject on worker (ex: vendor), if multiThread script is downloaded just once\n     * @param {{serialize: Function, unserialize: Function}[]} params.serializers is used to serialize the data sent and received from the worker\n     * @param {Boolean} params.safe if is true Hermes lock the maximum numbers a the recomended by navigator\n     * @param {Object} params.config is the config sent to worker\n     */\n    constructor(workerFunction, params = {}) {\n        this._hermesSerializers = new _HermesSerializers__WEBPACK_IMPORTED_MODULE_2___default.a();\n        this._hermesMessengerUrl = URL.createObjectURL(new Blob([_HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__[\"default\"]]));\n        this._workerFunctionUrl = URL.createObjectURL(new Blob([`(${workerFunction.toString()})()`]));\n        this.isLoaded = false;\n\n        this._params = Object.assign({\n            threadInstances: 1,\n            safe: true,\n            scripts: [],\n            serializers: [],\n            config: {},\n        }, params);\n\n        this._MAX_THREAD = navigator.hardwareConcurrency - 1;\n\n        if (this._params.threadInstances === \"auto\"\n            || this._params.safe && this._params.threadInstances > this._MAX_THREAD) {\n            this._params.threadInstances = this._MAX_THREAD;\n        }\n\n        this._requestQueue = [];\n        this._pendingsCalls = {};\n        this._loadedPromise = [];\n        this._importedScripts = [];\n        this._serializers = [_HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_3___default.a, ...this._params.serializers.reverse()];\n        this.numberOfThreadInstances = this._params.threadInstances;\n\n        this._serializers.forEach(serializer => this._hermesSerializers.addSerializer(serializer));\n\n        this._buildHermesSerializerUrl();\n        this._buildSerializersUrl();\n        this._buildInitWorkerFunction();\n        this._computeScriptsAndStartWorkers();\n    }\n\n    async _computeScriptsAndStartWorkers() {\n        await this._importScripts();\n        this._workerBlob = this._buildWorker();\n        this._workerURL = URL.createObjectURL(this._workerBlob);\n        this._workerPool = [];\n        this._lastWorkerCall = 0;\n\n        this._startWorkers();\n    }\n\n    /**\n     * A queue to import scripts\n     */\n    _importScripts() {\n        return new Promise((resolve) => {\n            if (this._params.scripts.length === 0) return resolve();\n            this._importScript(0, resolve);\n        });\n    }\n\n    /**\n     *\n     * @param {number} scriptIndex\n     * @param {Promise.Resolve} resolver\n     */\n    _importScript(scriptIndex, resolver) {\n        const scriptLink = this._params.scripts[scriptIndex];\n        return fetch(scriptLink)\n            .then(response => response.text())\n            .then((contentScript) => {\n                this._importedScripts.push(URL.createObjectURL(new Blob([contentScript])));\n                if (scriptIndex === this._params.scripts.length - 1) return resolver();\n                return this._importScript(scriptIndex + 1, resolver);\n            });\n    }\n\n    _cleanBlobUrls() {\n        URL.revokeObjectURL(this._workerFunctionUrl);\n        URL.revokeObjectURL(this._hermesMessengerUrl);\n        URL.revokeObjectURL(this._hermesSerializerUrl);\n        URL.revokeObjectURL(this._initFunctionUrl);\n        URL.revokeObjectURL(this._serializersUrl);\n        this._importedScripts.forEach(url => URL.revokeObjectURL(url));\n        this._importedScripts = [];\n    }\n\n    /**\n     * Create the blob of the worker\n     */\n    _buildWorker() {\n        return this._createBlobWithArray([\n            `importScripts(\"${this._hermesSerializerUrl}\");\\n`,\n            `importScripts(\"${this._hermesMessengerUrl}\");\\n`,\n            `importScripts(\"${this._serializersUrl}\");\\n`,\n            ...this._importedScripts.map(scriptUrl => `importScripts(\"${scriptUrl}\");\\n`),\n            `importScripts(\"${this._initFunctionUrl}\");\\n`,\n        ]);\n    }\n\n    _buildInitWorkerFunction() {\n        this._initFunctionUrl = URL.createObjectURL(this._createBlobWithArray([_initFunction_worker__WEBPACK_IMPORTED_MODULE_1__[\"default\"]]));\n    }\n\n    /**\n     * Build part of script containing Hermes serializers\n     */\n    _buildHermesSerializerUrl() {\n        this._hermesSerializerUrl = URL.createObjectURL(this._createBlobWithArray([\n            _HermesSerializers__WEBPACK_IMPORTED_MODULE_2___default.a.toString(),\n            \"\\nself['__serializers__'] = new HermesSerializers();\",\n        ]));\n    }\n\n    _buildSerializersUrl() {\n        this._serializersUrl = URL.createObjectURL(this._createBlobWithArray(\n            this._serializers.map(\n                serializerContent => `\n                    self['__serializers__'].addSerializer({\n                        serialize: ${serializerContent.serialize.toString()}, \n                        unserialize: ${serializerContent.unserialize.toString()}\n                    });\n                `\n            )\n        ));\n    }\n\n    _createBlobWithArray(array) {\n        return new Blob(array, { type: \"application/javascript\" });\n    }\n\n    /**\n     * Start workers\n     */\n    _startWorkers() {\n        for (let i = 0; i < this._params.threadInstances; i++) {\n\n            this._workerPool[i] = {\n                worker: new Worker(this._workerURL),\n                load: false,\n            };\n\n            this._workerPool[i].worker.onmessage = (answer) => {\n                this._onWorkerMessage(this._workerPool[i], answer.data);\n            };\n\n            this._workerPool[i].worker.onerror = (error) => {\n                this._onWorkerError(error);\n            };\n\n            this._workerPool[i].worker.postMessage({\n                type: \"config\",\n                data: {\n                    threadInstance: i,\n                    _workerFunctionUrl: this._workerFunctionUrl,\n                    ...this._params.config,\n                },\n            });\n        }\n    }\n\n    /**\n     * Check if all workers are loaded, if is true resolve loaded promise\n     */\n    _checkWorkersLoad() {\n        const fullLoaded = this._workerPool.every(workerObject => workerObject.load);\n        if (fullLoaded) {\n            this.isLoaded = true;\n            this._loadedPromise.forEach(resolve => resolve());\n            this._cleanBlobUrls();\n            this._applyQueue();\n        }\n    }\n\n    _applyQueue() {\n        this._requestQueue.forEach((data) => {\n            const worker = this._getNextWorker();\n            if (!worker) return this._pendingsCalls[data.id].reject(new Error({ err: \"worker not found\" }));\n            worker.postMessage(data);\n        });\n    }\n\n    /**\n     * Is called by worker for talking to page\n     *\n     * @param {{load: boolean, worker: Worker}} workerObject\n     * @param {Object} answer\n     */\n    _onWorkerMessage(workerObject, answer) {\n        if (answer.type === \"ready\") {\n            workerObject.load = true;\n            this._checkWorkersLoad();\n        } else if (answer.type === \"answer\") {\n            if (!this._pendingsCalls[answer.id]) return;\n\n            this._pendingsCalls[answer.id].resolve(this._hermesSerializers.unserializeArgs(answer.result)[0]);\n            delete this._pendingsCalls[answer.id];\n        }\n    }\n\n    /**\n     * Is called from worker in case of thrown error\n     *\n     * TODO: Improve error handling\n     *\n     * @param {any} error\n     */\n    _onWorkerError(error) {\n        console.error(error);\n    }\n\n    /**\n     * Find the next worker free for computing\n     */\n    _getNextWorker() {\n        let nextWorkerIndex = this._lastWorkerCall + 1;\n        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;\n\n        this._lastWorkerCall = nextWorkerIndex;\n        return this._workerPool[nextWorkerIndex].worker;\n    }\n\n    /**\n     * Return promise, resolved when workers are completely loaded\n     */\n    waitLoad() {\n        if (this.isLoaded) return Promise.resolve();\n        return new Promise((resolve) => {\n            this._loadedPromise.push(resolve);\n        });\n    }\n\n    /**\n     * Call function to worker\n     *\n     * @param {String} functionName the name of the function in worker\n     * @param {any[]} args arguments applied to the function\n     */\n    call(functionName, args = []) {\n        return new Promise((resolve, reject) => {\n\n            const data = {\n                type: \"call\",\n                id: new Date().getTime() + Math.random() * Math.random(),\n                arguments: this._hermesSerializers.serializeArgs(args),\n                name: functionName,\n            };\n            this._pendingsCalls[data.id] = {\n                resolve,\n                reject,\n            };\n\n            if (!this.isLoaded) {\n                this._requestQueue.push(data);\n            } else {\n                const worker = this._getNextWorker();\n                if (!worker) return reject(new Error({ err: \"worker not found\" }));\n                worker.postMessage(data);\n            }\n        });\n    }\n}\n\n\n//# sourceURL=webpack://hermes/./src/HermesWorker/index.js?");

/***/ }),

/***/ "./src/HermesWorker/initFunction.worker.js":
/*!*************************************************!*\
  !*** ./src/HermesWorker/initFunction.worker.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"/* eslint-disable no-undef */\\n// eslint-disable-next-line no-global-assign\\nconst hermes = new HermesMessenger();\\nself.hermes = hermes;\\nhermes.waitLoad().then(() => {\\n    importScripts(hermes.config._workerFunctionUrl);\\n});\\n\");\n\n//# sourceURL=webpack://hermes/./src/HermesWorker/initFunction.worker.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: HermesWorker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _HermesWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HermesWorker */ \"./src/HermesWorker/index.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"HermesWorker\", function() { return _HermesWorker__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n\n\n\n\n\n//# sourceURL=webpack://hermes/./src/index.js?");

/***/ })

/******/ });
});