// THIS FILE IS LOAD IN WORKER

/**
 * Used in worker to talk to page
 */
/* eslint-disable no-unused-vars */
class HermesMessenger {
    constructor() {
        this.config = {};
        this._loadedPromise = [];
        this._methods = {};
        this.serializers = __serializers__;
        self.addEventListener("message", event => this._onEvent(event.data));
    }

    /**
     * Return promise when worker is loaded
     */
    onload() {
        return new Promise((resolve) => {
            this._loadedPromise.push(resolve);
        });
    }

    /**
     * Send to the page that the worker is ready to use
     */
    ready() {
        this._sendEvent({
            type: "ready",
        });
    }

    /**
     * Expose the method from call by page
     *
     * @param {String} methodName
     * @param {Function} method
     */
    addMethod(methodName, method) {
        this._methods[methodName] = {
            method,
            methodType: "default",
        };
    }

    /**
     * Expose the async method from call by page
     *
     * @param {String} methodName
     * @param {Function} method
     */
    addAsyncMethod(methodName, method) {
        this._methods[methodName] = {
            method,
            methodType: "promise",
        };
    }

    /**
     * Is called by page for talking to worker
     *
     * @param {Object} event
     */
    _onEvent(event) {
        if (event.type === "config") {
            this.config = event.data;
            this._loadedPromise.forEach(resolve => resolve());
        } else if (event.type === "call") {
            this._call(event);
        }
    }

    /**
     * Used for calling worker method
     *
     * @param {Object} data
     */
    _call(data) {
        if (this._methods[data.name]) {
            const args = this.serializers.unserializeArgs(data.arguments);
            if (this._methods[data.name].methodType === "promise") {
                this._methods[data.name].method(...args).then((result) => {
                    const serializedResult = this.serializers.serializeArgs([result]);
                    this._sendAnswer(data, serializedResult);
                });
            }else{
                const result = this._methods[data.name].method(...args);
                const serializedResult = this.serializers.serializeArgs([result]);
                this._sendAnswer(data, serializedResult);
            }
        } else {
            throw new Error(data.name + " is not found on worker");
        }
    }

    /**
     * @param {any} data
     * @param {number} data.id, id is the unique id of question
     * @param {any} result
     */
    _sendAnswer(data, result) {
        this._sendEvent({
            type: "answer",
            id: data.id,
            result,
        });
    }

    _sendEvent(data) {
        self.postMessage(data);
    }
}
