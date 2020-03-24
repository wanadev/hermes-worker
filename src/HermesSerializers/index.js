// THIS FILE IS LOAD IN WORKER AND IN PAGE

class HermesSerializers {
    constructor() {
        this._serializers = [];
    }

    addSerializer(serializerObject) {
        if (!serializerObject.serialize || !serializerObject.unserialize) {
            throw new Error("Serializer required a methods serialize and unserialize", serializerObject);
        }
        this._serializers.push(serializerObject);
    }

    serializeArgs(args) {
        for (var i = this._serializers.length -1; i >= 0; i--) {
            args = this._serializers[i].serialize(args);
        }
        return args;
    }
    unserializeArgs(args) {
        return this._serializers.reduce((args, serializer) => {
            return serializer.unserialize(args);
        }, args);
    }
}

module.exports = HermesSerializers;