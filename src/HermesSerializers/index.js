// THIS FILE IS LOAD IN WORKER AND IN PAGE

/**
 * Class used for managing the serializers, in Page and in worker
 */
class HermesSerializers {
    constructor() {
        this._serializers = [];
    }

    /**
     * Add serializer
     *
     * @param {{serialize: Function, unserialize: Function}} serializerObject
     */
    addSerializer(serializerObject) {
        if (!serializerObject.serialize || !serializerObject.unserialize) {
            throw new Error("Serializer required a methods serialize and unserialize", serializerObject);
        }
        this._serializers.push(serializerObject);
    }

    /**
     * Serialize all args
     *
     * @param {any[]} args
     */
    serializeArgs(args) {
        // Throw error if args is not sendable
        this.checkPosibiltySend(args);

        for (let i = this._serializers.length - 1; i >= 0; i--) {
            args = this._serializers[i].serialize(args);
        }
        return args;
    }

    /**
     * Unserialize all args
     *
     * @param {any[]} args
     */
    unserializeArgs(args) {
        return this._serializers.reduce((args, serializer) => serializer.unserialize(args), args);
    }

    checkPosibiltySend(object, path = "arguments") {
        if (typeof object === "function") throw new Error(`Worker cannot send or receive any function, please remove it at ${path}`);
        if (object instanceof Error) throw new Error(`Worker cannot send or receive any Error, please remove it at ${path}`);
        if (self.HTMLElement && object instanceof HTMLElement) throw new Error(`Worker cannot send or receive any HTMLElement, please remove it at ${path}`);

        // TypedArray
        if (ArrayBuffer.isView(object) || object instanceof ArrayBuffer) return;

        if (Array.isArray(object)) {
            object.forEach((o, i) => this.checkPosibiltySend(o, path + `[${i}]`));
        } else if (typeof object === "object" && object) {
            Object.keys(object).forEach(i => this.checkPosibiltySend(object[i],  path + "." + i));
        }
    }
}

module.exports = HermesSerializers;
