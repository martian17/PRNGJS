const {PRNG,PRNG_SEEDFLOAT,PRNG_SEEDINT,uint64_t} = require("./main.js");

let rng = PRNG_SEEDFLOAT(Math.random());
for(let i = 0; i < 100000000; i++){
    let r = rng();
    //let r = Math.random();
    if(r < 0.0000001){
        console.log(r);
    }
}