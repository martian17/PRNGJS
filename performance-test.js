import {PRNG,PRNG_SEEDFLOAT,PRNG_SEEDINT,uint64_t} from "./index.js";


const randPerformance = function(rng,label){
    let max = 100000000;
    let start = performance.now();
    for(let i = 0; i < max; i++){
        let r = rng();
        if(r < 0.0000001){
            console.log(r);
        }
    }
    let end = performance.now();
    let duration = (end-start)/1000;
    console.log(`${Math.floor(max/duration)} operations per second for ${label}`);
};

let rng = PRNG_SEEDFLOAT(Math.random());

randPerformance(rng,"index.js");
randPerformance(Math.random,"Math.random");



