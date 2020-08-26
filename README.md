# Hermes Worker

Hermes Worker is a small library made to simplify WebWorker usage.

In a nutshell, it is a tool which can be used by a web page for computation and which returns the result when it is ready.

## Install

Add the package to your project as a dependency:

    npm install hermes-worker


## Example

```js
const HermesWorker = require("hermes-worker");

// Code to be run on worker side
const workerFunction = () => {
    // Expose a function
    hermes.on("add", (a, b) => {
        return a + b;
    });

    // Finish worker initialization
    hermes.ready();
}

// Create a worker
const hermes = new HermesWorker(workerFunction, {});

// Call function "add" and retrieve answer
hermes.call("add", [1, 2]).then(result => {
    console.log(result); // result === 3
});
```

## Features

- Simple communication between page and worker
- Instantiate worker from url or function
- Multiple instances of the same worker
- Single external scripts import shared between worker instances
- Serialize data between page and worker
- Add custom serializers

## Usage

### Instantiate worker from url

`script.js`
```js
const HermesWorker = require("hermes-worker");

// Create a worker
const hermes = new HermesWorker("workerFile.js", {});

// Call function "add" and retrieve answer
hermes.call("add", [1, 2]).then(result => {
    console.log(result); // result === 3
});
```
`workerFile.js` 
```js
// Code to be run in worker side
// Expose a function
hermes.on("add", (a, b) => {
    return a + b;
});

// Finish worker initialization
hermes.ready();
```

### Multiple instances of the same worker

```js
const HermesWorker = require("hermes-worker");

const workerFunction = () => {
    const fibo = (n) => {
        if (n === 0 || n === 1) {
            return 1;
        }
        return fibo(n - 1) + fibo(n - 2);
    }
    hermes.on("fibo", (n) => fibo(n));
    hermes.on("hello", () => {
        console.log(`Hello world from instance ${hermes.config.threadInstance}`)
    })
    hermes.ready();
}

// Create two workers with same code
const hermes = new HermesWorker(workerFunction, {
    threadInstances: 2
});

// Run by first instance
hermes.call("fibo", [12]);

// Run by second instance
hermes.call("fibo", [34]);

hermes.call("hello"); // Output => "Hello world from instance 0"
hermes.call("hello"); // Output => "Hello world from instance 1"
```

### Imports scripts

```js
const HermesWorker = require("hermes-worker");

const workerFunction = () => {
    /** HERE BABYLON IS DEFINED **/
    hermes.on("length", (x, y) => {
        return new BABYLON.Vector2(x, y).length();
    });

    hermes.ready();
};

// Create a worker
const hermes = new HermesWorker(workerFunction, {
    scripts: [
        "https://cdn.babylonjs.com/babylon.js"
    ]
});

hermes.call("length", [1, 0]).then(result => {
    console.log(result); // result === 1
});
```

### Serialization

Data passed between page and worker are serialized to avoid data loss.

List of handled types:
- Number
- Number[]
- String
- String[]
- Object
- Object[]
- Error
- TypedArray
- ImageData
- ArrayBuffer
- DataView

You can also create your own serializer

```js
const HermesWorker = require("hermes-worker");

// Caution: Hermes only reads `serialize` and `unserialize` keys
const BabylonSerializer = {
    serialize: (args) => {
        return args.map((arg) => {
            if (arg instanceof BABYLON.Vector2) {
                return {
                    _x: arg.x,
                    _y: arg.y,
                    __type__: "BABYLON.Vector2",
                };
            }
            return arg;
        });
    },
    unserialize: (args) => {
        return args => args.map((arg) => {
            if (arg.__type__ === "BABYLON.Vector2") {
                return new BABYLON.Vector2(arg._x, arg._y);
            }
            return arg;
        });
    },
};

const workerFunction = () => {
    hermes.on("length", (vector) => {
        return vector.length();
    });

    hermes.ready();
};

const hermes = new HermesWorker(workerFunction, {
    scripts: ["https://cdn.babylonjs.com/babylon.js"],
    serializers: [
        BabylonSerializer,
    ],
});

hermes.call("length", [new BABYLON.Vector2(2, 0)]).then(result => {
    console.log(result); // result === 2
});
```
