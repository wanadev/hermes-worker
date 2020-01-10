(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("hermes", [], factory);
	else if(typeof exports === 'object')
		exports["hermes"] = factory();
	else
		root["hermes"] = factory();
})(this, function() {
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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"// THIS FILE IS LOAD IN WORKER\\n\\nclass HermesMessenger {\\n    constructor() {\\n        this.config = {};\\n        this._loadedPromise = [];\\n        this._methods = {};\\n        window.onmessage = event => this._onEvent(event.data);\\n    }\\n\\n    start() {\\n        this._sendEvent({\\n            type: \\\"loaded\\\"\\n        })\\n    }\\n\\n    onload() {\\n        return new Promise(resolve => {\\n            this._loadedPromise.push(resolve);\\n        });\\n    }\\n\\n    ready() {\\n        this._sendEvent({\\n            type: \\\"loaded\\\"\\n        });\\n    }\\n\\n    addMethod(methodName, method) {\\n        this._methods[methodName] = {\\n            method,\\n            methodType: \\\"default\\\",\\n        };\\n    }\\n\\n    addAsyncMethod(methodName, method) {\\n        this._methods[methodName] = {\\n            method,\\n            methodType: \\\"promise\\\",\\n        };\\n    }\\n\\n    _onEvent(event) {\\n        if (event.type === \\\"config\\\") {\\n            this.config = event.data;\\n            this._loadedPromise.forEach(resolve => resolve());\\n        }\\n        else if (event.type === \\\"call\\\") {\\n            this._call(event);\\n        }\\n    }\\n\\n    _call(data) {\\n        if (this._methods[data.name]) {\\n            if (this._methods[data.name].methodType == \\\"promise\\\") {\\n                this._methods[data.name].method(...data.arguments).then(result => {\\n                    this._sendAnwser(data,result);\\n                });\\n            }\\n            else {\\n                this._sendAnwser(data, this._methods[data.name].method(...data.arguments));\\n            }\\n        }\\n        else {\\n            throw new Error(data.name + \\\" is not found on worker\\\");\\n        }\\n    }\\n\\n    _sendAnwser(data, result) {\\n        this._sendEvent({\\n            type: \\\"anwser\\\",\\n            id: data.id,\\n            result\\n        })\\n    }\\n\\n    _sendEvent(data) {\\n        window.postMessage(data);\\n    }\\n}\");\n\n//# sourceURL=webpack://hermes/./src/HermesMessenger/index.worker.js?");

/***/ }),

/***/ "./src/HermesWorker/index.js":
/*!***********************************!*\
  !*** ./src/HermesWorker/index.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return HermesWorker; });\n/* harmony import */ var _HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../HermesMessenger/index.worker */ \"./src/HermesMessenger/index.worker.js\");\n\n\nclass HermesWorker {\n    constructor(workerFunction, params = {}) {\n        this._params = Object.assign({\n            numberWorkers: 1, \n            config: {}\n        }, params);\n\n        if (this._params.numberWorkers === \"max\") this._params.numberWorkers = navigator.hardwareConcurrency;\n\n        this._pendingsCalls = {};\n        this._loadedPromise = [];\n\n        this._workerBlob = this._buildWorker(workerFunction);\n        this._workerURL = URL.createObjectURL(this._workerBlob);\n        this._workerPool = [];\n        this._lastWorkerCall = 0;\n\n        this._startWorkers();\n    }\n\n    _buildWorker(workerFunction) {\n        return new Blob([\n            \"var window=this;var global=this;\",\n            _HermesMessenger_index_worker__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n            \"(\" + workerFunction.toString() + \")()\",\n        ],\n        {\n            type: \"application/javascript\",\n        });\n    }\n\n    _startWorkers() {\n        for(let i = 0; i < this._params.numberWorkers; i++) {\n\n            this._workerPool[i] = {\n                worker: new Worker(this._workerURL),\n                load: false\n            };\n\n            this._workerPool[i].worker.onmessage = (anwser) => {\n                this._onWorkerMessage(this._workerPool[i], anwser.data);\n            }\n\n            this._workerPool[i].worker.onerror = (error) => {\n                this._onWorkerError(error);\n            }\n\n            this._workerPool[i].worker.postMessage({\n                type: \"config\",\n                data: {\n                    workerInstance: i,\n                    ... this._params.config\n                }\n            });\n        }\n    }\n\n    _checkLoaded() {\n        const fullLoad = this._workerPool.every(workerObject => workerObject.load);\n        if (fullLoad) this._loadedPromise.forEach(resolve => resolve());\n    }\n\n    _onWorkerMessage(workerObject, anwser) {\n        if (anwser.type === \"loaded\") {\n            workerObject.load = true;\n            this._checkLoaded();\n        }\n        else if (anwser.type === \"anwser\") {\n            if (this._pendingsCalls[anwser.id]) {\n                this._pendingsCalls[anwser.id].resolve(anwser.result);\n                delete this._pendingsCalls[anwser.id];\n            }\n        }\n    }\n\n    _onWorkerError(error) {\n        console.error(error);\n    }\n\n    _getNextWorker() {\n        let nextWorkerIndex = this._lastWorkerCall + 1;\n        if (nextWorkerIndex === this._workerPool.length) nextWorkerIndex = 0;\n\n        this._lastWorkerCall = nextWorkerIndex;\n        return this._workerPool[nextWorkerIndex].worker;\n    }\n\n    onload() {\n        return new Promise(resolve => {\n            this._loadedPromise.push(resolve);\n        });\n    }\n\n    call(functionName, args = []) {\n        return new Promise((resolve, reject) => {\n            const worker = this._getNextWorker();\n            if (worker) {\n                const data = {\n                    type: \"call\",\n                    id: new Date().getTime() + Math.random() * Math.random(),\n                    arguments: args,\n                    name: functionName,\n                };\n                this._pendingsCalls[data.id] = {\n                    resolve,\n                    reject,\n                };\n                worker.postMessage(data);\n            }\n        });\n    }\n}\n\n\n//# sourceURL=webpack://hermes/./src/HermesWorker/index.js?");

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