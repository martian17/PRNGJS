# PRNG.js
This prng module is based on the same algorithm Math.random() from V8 relies on (xorshift128+).
Inspired by the V8 blogpost https://v8.dev/blog/math-random

## Classes and Functions
### `class PRNG`
PRNG class stores the internal state of the rng, and provides various methods to initialize its state with arbitrary number of floats or ints.

### `PRNG_SEEDINT()`
`PRNG_SEEDINT` takes in 1, 2, or 4 integers and returns an instance of `PRNG.prototype.get()` method as a function.  
The integer range must be from 0 to 4294967295 (max 32 bit unsigned integer)
```js
PRNG_SEEDINT(seed_number:int{0 < seed_number < MAX_UINT_32T} ...):PRNG.prototype.get
```
### `PRNG_SEEDFLOAT()`
`PRNG_SEEDFLOAT` takes in 1, 2, or 4 floating point numbers and returns an instance of `PRNG.prototype.get()` method as a function.  
There is no set range for the floating point numbers.
```js
PRNG_SEEDFLOAT(seed_number:float ...):PRNG.prototype.get
```
### `PRNG.prototype.get()`
`PRNG.prototype.get()` takes in no argument, and returns a random number ranging 0 < n < 1.
```js
rng_function():double{0 < n < 1}
```

## Uses
node.js (as seen in example.js)
```js
const {PRNG,PRNG_SEEDFLOAT,PRNG_SEEDINT,uint64_t} = require("./main.js");

let rng = PRNG_SEEDFLOAT(Math.random());
for(let i = 0; i < 100; i++){
    let r = rng();
    console.log(rng());
}
```
js+html
```html
<script src="prngjs/main.js"></script>
```
```js
let rng = PRNG_SEEDINT(114514,8101919);
for(let i = 0; i < 100000000; i++){
    let r = rng();
    if(r < 0.0000001){
        console.log(r);
    }
    console.log(rng());
}
```


## Implementation
This module follows the same implementation pattern as V8. The difference is that I separately implemented `uint_64t` class, which does not exist in JavaScript.
After getting the 64 bit sequence using the described algorithm, the module converts it to a double type ranging 0 < n < 1. This is done by replacing the first 12 bits with the appropriate sign and exponent bits, `0` and `01111111111` accordingly. `0` denotes the number being positive, and `01111111111` denotes 2^0th power (https://en.wikipedia.org/wiki/Double-precision_floating-point_format for detail). This process will yield a number ranging 1 < n < 2. Finally, the program subtracts 1 from the number, yielding 0 < n < 1. 
