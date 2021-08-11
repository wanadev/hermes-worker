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
            "DataView",
        ];

        const { serializedArgs, transferable } = args.reduce((acc, argument) => {
            if (argument instanceof Error) {
                const obj = {
                    type: "Error",
                    value: { name: argument.name },
                };

                const keys = Object.getOwnPropertyNames(argument);
                keys.reduce((acc, key) => {
                    acc[key] = argument[key];
                    return acc;
                }, obj.value);

                acc.serializedArgs.push(obj);
                return acc;
            }

            if (argument instanceof ArrayBuffer) {
                acc.transferable.push(argument);
                acc.serializedArgs.push({
                    type: "__hermes__transferable__",
                    className: "ArrayBuffer",
                    index: acc.transferable.length - 1,
                });
                return acc;
            }

            if (window.OffscreenCanvas && argument instanceof OffscreenCanvas) {
                acc.transferable.push(argument);
                acc.serializedArgs.push({
                    type: "__hermes__transferable__",
                    className: "OffscreenCanvas",
                    index: acc.transferable.length - 1,
                });
                return acc;
            }

            if (argument instanceof ImageData && "ImageData" in self) {
                acc.transferable.push(argument.data.buffer);
                acc.serializedArgs.push({
                    type: "__hermes__transferable__",
                    className: "ImageData",
                    index: acc.transferable.length - 1,
                    data: {
                        width: argument.width,
                    },
                });
                return acc;
            }

            if (argument && typeof argument === "object" && argument.constructor.name in self && typedArray.includes(argument.constructor.name)) {
                acc.transferable.push(argument.buffer);
                acc.serializedArgs.push({
                    type: "__hermes__transferable__",
                    className: argument.constructor.name,
                    index: acc.transferable.length - 1,
                });
                return acc;
            }

            acc.serializedArgs.push({
                type: "arg",
                value: argument,
            });
            return acc;
        }, { serializedArgs: [], transferable: [] });

        return {
            args: serializedArgs,
            transferable,
        };
    },

    unserialize: (serializedArgs) => {
        "use strict";

        return serializedArgs.args.reduce((acc, data) => {
            if (data.type === "__hermes__transferable__") {
                if (data.className === "ImageData") {
                    acc.push(new ImageData(new Uint8ClampedArray(serializedArgs.transferable[data.index]), data.data.width));
                } else {
                    const ConstructorTransferable = self[data.className];
                    if (serializedArgs.transferable[data.index] instanceof ConstructorTransferable) acc.push(serializedArgs.transferable[data.index]);
                    else acc.push(new ConstructorTransferable(serializedArgs.transferable[data.index]));
                }
                return acc;
            }

            if (data.type === "Error") {
                const obj = new Error();
                for (const key in data.value) {
                    obj[key] = data.value[key];
                }
                acc.push(obj);
                return acc;
            }

            acc.push(data.value);
            return acc;
        }, []);
    },
};
