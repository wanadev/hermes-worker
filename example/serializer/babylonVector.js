const BABYLON_VECTOR_SERIALIZER = {
    serialize: function(args) {
        const _serializer = (args) => {
            return args.map(arg => {
                if (arg instanceof Array) {
                    return _serializer(arg);
                }
                else if (arg instanceof BABYLON.Vector2) {
                    return {
                        _x: arg.x,
                        _y: arg.y,
                        __type__: "BABYLON.Vector2"
                    }
                }
                else if (arg instanceof BABYLON.Vector3) {
                    return {
                        _x: arg.x,
                        _y: arg.y,
                        _z: arg.z,
                        __type__: "BABYLON.Vector3"
                    }
                }
                return arg;
            });
        };
        return _serializer(args);
    },
    unserialize: function(args) {
        const _unserialize = (args) => {
            return args.map(arg => {
                if (arg instanceof Array) {
                    return _unserialize(arg);
                }
                else if (arg.__type__) {
                    if (arg.__type__ === "BABYLON.Vector2") {
                        return new BABYLON.Vector2(arg._x, arg._y);
                    }
                    else  if (arg.__type__ === "BABYLON.Vector3") {
                        return new BABYLON.Vector3(arg._x, arg._y, arg._z);
                    }
                }
                return arg;
            });
        }

        return _unserialize(args);
    }
}