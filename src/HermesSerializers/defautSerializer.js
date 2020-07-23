// THIS FILE IS A COPY OF https://github.com/flozz/threadify/blob/master/src/helpers.js


module.exports =  {
    serialize: (args) => {
        "use strict";

        const typedArray = [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float32Array",
            "Float64Array",
        ];
        const serializedArgs = [];
        const transferable = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i] instanceof Error) {
                const obj = {
                    type: "Error",
                    value: { name: args[i].name },
                };
                const keys = Object.getOwnPropertyNames(args[i]);
                for (let k = 0; k < keys.length; k++) {
                    obj.value[keys[k]] = args[i][keys[k]];
                }
                serializedArgs.push(obj);
            } else if (args[i] instanceof DataView) {
                transferable.push(args[i].buffer);
                serializedArgs.push({
                    type: "DataView",
                    value: args[i].buffer,
                });
            } else {
                // transferable: ArrayBuffer
                if (args[i] instanceof ArrayBuffer) {
                    transferable.push(args[i]);

                // tranferable: ImageData
                } else if ("ImageData" in self && args[i] instanceof ImageData) {
                    transferable.push(args[i].data.buffer);

                // tranferable: TypedArray
                } else {
                    for (let t = 0; t < typedArray.length; t++) {
                        if (args[i] instanceof self[typedArray[t]]) {
                            transferable.push(args[i].buffer);
                            break;
                        }
                    }
                }

                serializedArgs.push({
                    type: "arg",
                    value: args[i],
                });
            }
        }

        return {
            args: JSON.stringify(serializedArgs),
            transferable,
        };
    },

    unserialize: (data) => {
        "use strict";

        const serializedArgs = JSON.parse(data.args) || [];

        const args = [];

        for (let i = 0; i < serializedArgs.length; i++) {
            switch (serializedArgs[i].type) {
                case "arg":
                    args.push(serializedArgs[i].value);
                    break;
                case "Error":
                    const obj = new Error();
                    for (const key in serializedArgs[i].value) {
                        obj[key] = serializedArgs[i].value[key];
                    }
                    args.push(obj);
                    break;
                case "DataView":
                    args.push(new DataView(serializedArgs[i].value));
                    break;
                default:
                    break;
            }
        }

        return args;
    },
};
