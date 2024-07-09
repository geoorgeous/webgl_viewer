function isNumber(a) {
    return typeof a === "number" && isFinite(a);
}

const gvec3 = (function() {
    function create(x, y, z) {
        return {
            x: (x === undefined) ? 0 : x,
            y: (y === undefined) ? 0 : y,
            z: (z === undefined) ? 0 : (y === undefined) ? x : z };
    }

    // unary operations

    function inverse(a) {
        return create(
            -a.x,
            -a.y,
            -a.z);
    }

    function sqrMagnitude(a) {
        return a.x * a.x + a.y * a.y + a.z * a.z;
    }

    function magnitude(a) {
        return Math.sqrt(sqrMagnitude(a));
    }

    function normalise(a) {
        return divide_s(a, magnitude(a));
    }

    function toArray(a) {
        return [a.x, a.y, a.z];
    }

    // binary operations (vector-scalar)

    function add_s(a, b) {
        return create(
            a.x + b,
            a.y + b,
            a.z + b);
    }

    function subtract_s(a, b) {
        return create(
            a.x - b,
            a.y - b,
            a.z - b);
    }

    function multiply_s(a, b) {
        return create(
            a.x * b,
            a.y * b,
            a.z * b);
    }

    function divide_s(a, b) {
        return create(
            a.x / b,
            a.y / b,
            a.z / b);
    }
    
    // binary operations (vector-vector)

    function add(a, b) {
        return create(
            a.x + b.x,
            a.y + b.y,
            a.z + b.z);
    }

    function subtract(a, b) {
        return create(
            a.x - b.x,
            a.y - b.y,
            a.z - b.z);
    }

    function multiply(a, b) {
        return create(
            a.x * b.x,
            a.y * b.y,
            a.z * b.z);
    }

    function divide(a, b) {
        return create(
            a.x / b.x,
            a.y / b.y,
            a.z / b.z);
    }

    function dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    function cross(a, b) {
        return create(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x);
    }

    function distance(a, b) {
        return magnitude(subtract(b, a));
    }

    function sqrDistance(a, b) {
        return sqrMagnitude(subtract(b, a));
    }

    return {
        create: create,
        inverse: inverse,
        sqrMagnitude: sqrMagnitude,
        magnitude: magnitude,
        normalise: normalise,
        toArray: toArray,
        add_s: add_s,
        subtract_s: subtract_s,
        multiply_s: multiply_s,
        divide_s: divide_s,
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide,
        dot: dot,
        cross: cross,
        distance: distance,
        sqrDistance: sqrDistance
    }
}());

const gmat4 = (function() {
    function create() {
        return {
            aa: 0, ab: 0, ac: 0, ad: 0,
            ba: 0, bb: 0, bc: 0, dd: 0,
            ca: 0, cb: 0, cc: 0, cd: 0,
            da: 0, db: 0, dc: 0, dd: 0 };
    }

    // unary operations

    function inverse(a) {

    };

    function transpose(a) {

    };

    // binary operations (matrix-scalar)

    function add(a, b) {

    }

    function subtract(a, b) {

    }

    function multiply(a, b) {

    }

    function divide(a, b) {

    }

    return {
        create: create,
    };
});