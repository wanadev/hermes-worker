// THIS FILE IS LOAD IN WORKER

class HermesMessenger {
    constructor() {
        this.config = {};
        this._loadedPromise = [];
        this._methods = {};
        this.serializers = __serializers__;
        window.onmessage = event => this._onEvent(event.data);
    }

    onload() {
        return new Promise(resolve => {
            this._loadedPromise.push(resolve);
        });
    }

    ready() {
        this._sendEvent({
            type: "loaded"
        });
    }

    addMethod(methodName, method) {
        this._methods[methodName] = {
            method,
            methodType: "default",
        };
    }

    addAsyncMethod(methodName, method) {
        this._methods[methodName] = {
            method,
            methodType: "promise",
        };
    }

    _onEvent(event) {
        if (event.type === "config") {
            this.config = event.data;
            this._loadedPromise.forEach(resolve => resolve());
        }
        else if (event.type === "call") {
            this._call(event);
        }
    }

    _call(data) {
        if (this._methods[data.name]) {
            const args = this.serializers.unserializeArgs(data.arguments);
            if (this._methods[data.name].methodType == "promise") {
                this._methods[data.name].method(...args).then(result => {
                    const serializedResult = this.serializers.serializeArgs([result]);
                    this._sendAnwser(data, serializedResult);
                });
            }
            else {
                const result = this._methods[data.name].method(...args)
                const serializedResult = this.serializers.serializeArgs([result]);
                this._sendAnwser(data, serializedResult);
            }
        }
        else {
            throw new Error(data.name + " is not found on worker");
        }
    }

    _sendAnwser(data, result) {
        this._sendEvent({
            type: "anwser",
            id: data.id,
            result
        });
    }

    _sendEvent(data) {
        window.postMessage(data);
    }
}