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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"// THIS FILE IS LOAD IN WORKER\\n\\n/**\\n * Used in worker to talk page\\n */\\nclass HermesMessenger {\\n    constructor() {\\n        this.config = {};\\n        this._loadedPromise = [];\\n        this._methods = {};\\n        this.serializers = __serializers__;\\n        window.addEventListener(\\\"message\\\", event => this._onEvent(event.data))\\n    }\\n\\n    /**\\n     * Return promise when worker is load\\n     */\\n    onload() {\\n        return new Promise(resolve => {\\n            this._loadedPromise.push(resolve);\\n        });\\n    }\\n\\n    /**\\n     * Send to the page that the worker is ready to use\\n     */\\n    ready() {\\n        this._sendEvent({\\n            type: \\\"loaded\\\"\\n        });\\n    }\\n\\n    /**\\n     * Expose the method from call by page\\n     * \\n     * @param {String} methodName \\n     * @param {Function} method \\n     */\\n    addMethod(methodName, method) {\\n        this._methods[methodName] = {\\n            method,\\n            methodType: \\\"default\\\",\\n        };\\n    }\\n\\n    /**\\n     * Expose the async method from call by page\\n     * \\n     * @param {String} methodName \\n     * @param {Function} method \\n     */\\n    addAsyncMethod(methodName, method) {\\n        this._methods[methodName] = {\\n            method,\\n            methodType: \\\"promise\\\",\\n        };\\n    }\\n\\n    /**\\n     * Is call by page for talk to worker\\n     * \\n     * @param {Object} event \\n     */\\n    _onEvent(event) {\\n        if (event.type === \\\"config\\\") {\\n            this.config = event.data;\\n            this._loadedPromise.forEach(resolve => resolve());\\n        }\\n        else if (event.type === \\\"call\\\") {\\n            this._call(event);\\n        }\\n    }\\n\\n    /**\\n     * Used for call worker method\\n     * \\n     * @param {Object} data \\n     */\\n    _call(data) {\\n        if (this._methods[data.name]) {\\n            const args = this.serializers.unserializeArgs(data.arguments);\\n            if (this._methods[data.name].methodType == \\\"promise\\\") {\\n                this._methods[data.name].method(...args).then(result => {\\n                    const serializedResult = this.serializers.serializeArgs([result]);\\n                    this._sendAnwser(data, serializedResult);\\n                });\\n            }\\n            else {\\n                const result = this._methods[data.name].method(...args)\\n                const serializedResult = this.serializers.serializeArgs([result]);\\n                this._sendAnwser(data, serializedResult);\\n            }\\n        }\\n        else {\\n            throw new Error(data.name + \\\" is not found on worker\\\");\\n        }\\n    }\\n\\n    /**\\n     * @param {{id: number}} data, id is the unique id of question \\n     * @param {any} result \\n     */\\n    _sendAnwser(data, result) {\\n        this._sendEvent({\\n            type: \\\"anwser\\\",\\n            id: data.id,\\n            result\\n        });\\n    }\\n\\n    _sendEvent(data) {\\n        window.postMessage(data);\\n    }\\n}\");\n\n//# sourceURL=webpack://hermes/./src/HermesMessenger/index.worker.js?");

/***/ }),

/***/ "./src/HermesSerializers/defautSerializer.js":
/*!***************************************************!*\
  !*** ./src/HermesSerializers/defautSerializer.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// THIS FILE IS A COPY OF https://github.com/flozz/threadify/blob/master/src/helpers.js\n\n\nmodule.exports =  {\n\n    serialize: function (args) {\n        \"use strict\";\n\n        var typedArray = [\n            \"Int8Array\",\n            \"Uint8Array\",\n            \"Uint8ClampedArray\",\n            \"Int16Array\",\n            \"Uint16Array\",\n            \"Int32Array\",\n            \"Uint32Array\",\n            \"Float32Array\",\n            \"Float64Array\"\n        ];\n        var serializedArgs = [];\n        var transferable = [];\n\n        for (var i = 0 ; i < args.length ; i++) {\n            if (args[i] instanceof Error) {\n                var obj = {\n                    type: \"Error\",\n                    value: {name: args[i].name}\n                };\n                var keys = Object.getOwnPropertyNames(args[i]);\n                for (var k = 0 ; k < keys.length ; k++) {\n                    obj.value[keys[k]] = args[i][keys[k]];\n                }\n                serializedArgs.push(obj);\n            } else if (args[i] instanceof DataView) {\n                transferable.push(args[i].buffer);\n                serializedArgs.push({\n                    type: \"DataView\",\n                    value: args[i].buffer\n                });\n            } else {\n                // transferable: ArrayBuffer\n                if (args[i] instanceof ArrayBuffer) {\n                    transferable.push(args[i]);\n\n                // tranferable: ImageData\n                } else if (\"ImageData\" in window && args[i] instanceof ImageData) {\n                    transferable.push(args[i].data.buffer);\n\n                // tranferable: TypedArray\n                } else {\n                    for (var t = 0 ; t < typedArray.length ; t++) {\n                        if (args[i] instanceof window[typedArray[t]]) {\n                            transferable.push(args[i].buffer);\n                            break;\n                        }\n                    }\n                }\n\n                serializedArgs.push({\n                    type: \"arg\",\n                    value: args[i]\n                });\n            }\n        }\n\n        return {\n            args: serializedArgs,\n            transferable: transferable\n        };\n    },\n\n    unserialize: function (data) {\n        \"use strict\";\n        const serializedArgs = data.args || [];\n\n        var args = [];\n\n        for (var i = 0 ; i < serializedArgs.length ; i++) {\n\n            switch (serializedArgs[i].type) {\n                case \"arg\":\n                    args.push(serializedArgs[i].value);\n                    break;\n                case \"Error\":\n                    var obj = new Error();\n                    for (var key in serializedArgs[i].value) {\n                        obj[key] = serializedArgs[i].value[key];\n                    }\n                    args.push(obj);\n                    break;\n                case \"DataView\":\n                    args.push(new DataView(serializedArgs[i].value));\n            }\n        }\n\n        return args;\n    }\n};\n\n//# sourceURL=webpack://hermes/./src/HermesSerializers/defautSerializer.js?");

/***/ }),

/***/ "./src/HermesSerializers/index.js":
/*!****************************************!*\
  !*** ./src/HermesSerializers/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// THIS FILE IS LOAD IN WORKER AND IN PAGE\n\n/**\n * Class use for manage the serializers, in Page and in worker\n */\nclass HermesSerializers {\n    constructor() {\n        this._serializers = [];\n    }\n\n    /**\n     * Add serializer\n     * \n     * @param {{serialize: Function, unserialize: Function}} serializerObject \n     */\n    addSerializer(serializerObject) {\n        if (!serializerObject.serialize || !serializerObject.unserialize) {\n            throw new Error(\"Serializer required a methods serialize and unserialize\", serializerObject);\n        }\n        this._serializers.push(serializerObject);\n    }\n\n    /**\n     * Serialize all args\n     *\n     * @param {any[]} args \n     */\n    serializeArgs(args) {\n        for (var i = this._serializers.length -1; i >= 0; i--) {\n            args = this._serializers[i].serialize(args);\n        }\n        return args;\n    }\n\n    /**\n     * Unserialize all args\n     *\n     * @param {any[]} args \n     */\n    unserializeArgs(args) {\n        return this._serializers.reduce((args, serializer) => {\n            return serializer.unserialize(args);\n        }, args);\n    }\n}\n\nmodule.exports = HermesSerializers;\n\n//# sourceURL=webpack://hermes/./src/HermesSerializers/index.js?");

/***/ }),

/***/ "./src/HermesWorker/index.js":
/*!***********************************!*\
  !*** ./src/HermesWorker/index.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return HermesWorker; });\n/* harmony import */ var _HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../HermesMessenger/index.worker */ \"./src/HermesMessenger/index.worker.js\");\n/* harmony import */ var _HermesSerializers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../HermesSerializers */ \"./src/HermesSerializers/index.js\");\n/* harmony import */ var _HermesSerializers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_HermesSerializers__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../HermesSerializers/defautSerializer */ \"./src/HermesSerializers/defautSerializer.js\");\n/* harmony import */ var _HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\n\nclass HermesWorker {\n    /**\n     * \n     * @param {Function} workerFunction is the function instancied in worker\n     * @param {Object} params\n     * @param {Number | String} params.threadInstances is the number of tread instance (the value `auto` is equal to the number of client core available)\n     * @param {String[]} params.scripts is the urls of scriptx when inject on worker (ex: vendor), if multiTread script is download just once\n     * @param {{serialize: Function, unserialize: Function}[]} params.serializers is used to serialize the data sent and received from the worker  \n     * @param {Object} params.config is the config send to worker\n     */\n    constructor(workerFunction, params = {}) {\n        this.hermesSerializers = new _HermesSerializers__WEBPACK_IMPORTED_MODULE_1___default.a();\n        this.isLoad = false;\n\n        this._params = Object.assign({\n            threadInstances: 1,\n            scripts: [],\n            serializers: [],\n            config: {}\n        }, params);\n\n        if (this._params.threadInstances === \"auto\") this._params.threadInstances = navigator.hardwareConcurrency - 1;\n\n        this._pendingsCalls = {};\n        this._loadedPromise = [];\n        this._importedScripts = [];\n        this._serializers = [_HermesSerializers_defautSerializer__WEBPACK_IMPORTED_MODULE_2___default.a, ...this._params.serializers.reverse()];\n\n        this._serializers.forEach(serializer => this.hermesSerializers.addSerializer(serializer));\n\n        this._importScripts().then(() => {\n            this._workerBlob = this._buildWorker(workerFunction);\n            this._workerURL = URL.createObjectURL(this._workerBlob);\n            this._workerPool = [];\n            this._lastWorkerCall = 0;\n    \n            this._startWorkers();\n        });\n    }\n\n    /**\n     * A queue for import script\n     */\n    _importScripts() {\n        return new Promise(resolve => {\n            if (this._params.scripts.length === 0) return resolve();\n            this._importScript(0, resolve);\n        });\n    }\n\n    /**\n     * \n     * @param {number} scriptIndex\n     * @param {Promise.Resolve} resolver \n     */\n    _importScript(scriptIndex, resolver) {\n        const scriptLink = this._params.scripts[scriptIndex];\n        return fetch(scriptLink, {\n            mode: \"cors\",\n        })\n            .then((response) => {\n                return response.text();\n            })\n            .then((contentScript) => {\n                this._importedScripts.push(contentScript)\n\n                if (scriptIndex === this._params.scripts.length -1) return resolver();\n                return this._importScript(scriptIndex + 1, resolver);\n            });\n    }\n\n    /**\n     * Create the blob of the worker\n     * \n     * @param {Function} workerFunction \n     */\n    _buildWorker(workerFunction) {\n        return new Blob([\n            \"var window=this;var global=this;\",\n            ...this._buildHermesSerializer(),\n            _HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n            \"const worker_require = n => require(n);\",\n            ...this._serializers.map(serializerContent => `\n                \\nwindow['__serializers__'].addSerializer({serialize: ${serializerContent.serialize}, unserialize: ${serializerContent.unserialize}});\\n\n            `),\n            ...this._importedScripts.map(scriptContent => `\\n${scriptContent};\\n `),\n            \"(\" + workerFunction.toString() + \")()\",\n        ],\n        {\n            type: \"application/javascript\",\n        });\n    }\n\n    /**\n     * Build part of script contain Hermes serializers\n     */\n    _buildHermesSerializer() {\n        return [\n            `${_HermesSerializers__WEBPACK_IMPORTED_MODULE_1___default.a.toString()}\\n`,\n            \"window['__serializers__'] = new HermesSerializers();\\n\",\n        ];\n    }\n\n    /**\n     * Start workers\n     */\n    _startWorkers() {\n        for(let i = 0; i < this._params.threadInstances; i++) {\n\n            this._workerPool[i] = {\n                worker: new Worker(this._workerURL),\n                load: false\n            };\n\n            this._workerPool[i].worker.onmessage = (anwser) => {\n                this._onWorkerMessage(this._workerPool[i], anwser.data);\n            }\n\n            this._workerPool[i].worker.onerror = (error) => {\n                this._onWorkerError(error);\n            }\n\n            this._workerPool[i].worker.postMessage({\n                type: \"config\",\n                data: {\n                    threadInstance: i,\n                    ... this._params.config\n                }\n            });\n        }\n    }\n\n    /**\n     * Check if all worker is load, if is true resolve loaded promise\n     */\n    _checkWorkersLoad() {\n        const fullLoaded = this._workerPool.every(workerObject => workerObject.load);\n        if (fullLoaded) {\n            this.isLoad = true;\n            this._loadedPromise.forEach(resolve => resolve());\n        }\n    }\n\n    /**\n     * Is call by worker for talk to page\n     *\n     * @param {{load: boolean, worker: Worker}} workerObject \n     * @param {Object} anwser \n     */\n    _onWorkerMessage(workerObject, anwser) {\n        if (anwser.type === \"loaded\") {\n            workerObject.load = true;\n            this._checkWorkersLoad();\n        }\n        else if (anwser.type === \"anwser\") {\n            if (!this._pendingsCalls[anwser.id]) return;\n\n            this._pendingsCalls[anwser.id].resolve(this.hermesSerializers.unserializeArgs(anwser.result)[0]);\n            delete this._pendingsCalls[anwser.id];\n        }\n    }\n\n    /**\n     * Is call from worker in case of error is throw\n     * \n     * TODO: Improve error handling\n     * \n     * @param {any} error \n     */\n    _onWorkerError(error) {\n        console.error(error);\n    }\n\n    /**\n     * Find the next worker free for compute\n     */\n    _getNextWorker() {\n        let nextWorkerIndex = this._lastWorkerCall + 1;\n        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;\n\n        this._lastWorkerCall = nextWorkerIndex;\n        return this._workerPool[nextWorkerIndex].worker;\n    }\n\n    /**\n     * Return promise, resolve where all worker is load\n     */\n    onload() {\n        if (this.isLoad) return Promise.resolve();\n        return new Promise(resolve => {\n            this._loadedPromise.push(resolve);\n        });\n    }\n    \n    /**\n     * Call function to worker\n     * \n     * @param {String} functionName the name of the function in worker\n     * @param {any[]} args arguments apply to the function\n     */\n    call(functionName, args = []) {\n        const worker = this._getNextWorker();\n        return new Promise((resolve, reject) => {\n            if (!worker) return reject({err: \"worker not found\"});\n\n            const data = {\n                type: \"call\",\n                id: new Date().getTime() + Math.random() * Math.random(),\n                arguments: this.hermesSerializers.serializeArgs(args),\n                name: functionName,\n            };\n            this._pendingsCalls[data.id] = {\n                resolve,\n                reject,\n            };\n            worker.postMessage(data);\n        });\n    }\n}\n\n\n//# sourceURL=webpack://hermes/./src/HermesWorker/index.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: HermesWorker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _HermesWorker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HermesWorker */ \"./src/HermesWorker/index.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"HermesWorker\", function() { return _HermesWorker__WEBPACK_IMPORTED_MODULE_0__[\"default\"]; });\n\n\n\n\n\n//# sourceURL=webpack://hermes/./src/index.js?");

/***/ })

/******/ });
});