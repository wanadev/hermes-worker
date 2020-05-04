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
        for (var i = this._serializers.length -1; i >= 0; i--) {
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
        return this._serializers.reduce((args, serializer) => {
            return serializer.unserialize(args);
        }, args);
    }
}

module.exports = HermesSerializers;