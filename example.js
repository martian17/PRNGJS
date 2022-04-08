const {PRNG} = require("./main.js");

let rng = PRNG((Math.random()*10000000)|0);
for(let i = 0; i < 100; i++){
    console.log(rng());
}