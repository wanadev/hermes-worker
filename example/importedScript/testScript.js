/* eslint-disable no-undef */
class Test {
    constructor(vector1, vector2) {
        this.superVector = vector1.add(vector2);
    }
}

// eslint-disable-next-line no-unused-vars
const test = new Test(new BABYLON.Vector2(15, 12), new BABYLON.Vector2(50, 50));
