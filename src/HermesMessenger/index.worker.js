// THIS FILE IS LOADED IN WORKER

/**
 * Used in worker to talk to page
 */
/* eslint-disable no-unused-vars */
class HermesMessenger {
    constructor() {
        this.config = {};
        this._loadedPromise = [];
        this._routes = {};
        this.serializers = __serializers__;
        self.addEventListener("message", event => this._onEvent(event.data));
    }

    /**
     * Return promise when worker is loaded
     */
    waitLoad() {
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
     * Expose the callback from call by page
     *
     * @param {String} eventName
     * @param {Function} callback
     * @param {any} option
     */
    on(eventName, callback, option = {}) {
        if (!option.type) option.type = "default";

        this._routes[eventName] = {
            callback,
            option,
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
     * Used for calling worker route
     *
     * @param {Object} data
     */
    async _call(data) {
        if (this._routes[data.name]) {
            const args = this.serializers.unserializeArgs(data.arguments);
            if (this._routes[data.name].option.type === "async") {
                const result = await this._routes[data.name].callback(...args);
                const serializedResult = this.serializers.serializeArgs([result]);
                this._sendAnswer(data, serializedResult);
            } else {
                const result = this._routes[data.name].callback(...args);
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
