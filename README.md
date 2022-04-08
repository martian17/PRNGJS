# PRNG.js
This prng module is based on the same algorithm Math.random() from V8 relies on (xorshift128+).
Inspired by the V8 blogpost https://v8.dev/blog/math-random

## Functions
### `PRNG()`
`PRNG` takes in an integer randing 0 to 4294967295 (max 32 bit unsigned integer), and returns a random number generation function `rng_function`  
```js
PRNG(seed_number:int{0 < seed_number < MAX_UINT_32T}):rng_function
```
### `rng_function()`
`rng_function()` takes in no argument, and returns a random number ranging from 0 < n < 1.
```js
rng_function():double{0 < n < 1}
```

## Uses
node.js (as seen in example.js)
```js
const {PRNG} = require("prng.js");

let rng = PRNG((Math.random()*10000000)|0);
for(let i = 0; i < 100; i++){
    console.log(rng());
}
```
js+html
```html
<script src="prngjs/main.js"></script>
```
```js
let rng = PRNG((Math.random()*10000000)|0);
for(let i = 0; i < 100; i++){
    console.log(rng());
}
```


## Implementation
This module follows the same implementation pattern as V8. The difference is that I separately implemented `uint_64t` class, which does not exist in JavaScript.
After getting the 64 bit sequence using the described algorithm, the module converts it to a double type ranging 0 < n < 1. This is done by replacing the first 12 bits with the appropriate sign and exponent bits, `0` and `01111111111` accordingly. `0` denotes the number being positive, and `01111111111` denotes 2^0th power (https://en.wikipedia.org/wiki/Double-precision_floating-point_format for detail). This process will yield a number ranging 1 < n < 2. Finally, the program subtracts 1 from the number, yielding 0 < n < 1. 
