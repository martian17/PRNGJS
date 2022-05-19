//prng algo: xorshift128+
//as described in https://v8.dev/blog/math-random
class PRNG{
    static doubleMask1 = (new uint64_t()).fromBinary(
        "11111111 11111111 11111111 11111111"+
        "00000000 00001111 11111111 11111111"
    );
    static doubleMask2 = (new uint64_t()).fromBinary(
        "00000000 00000000 00000000 00000000"+
        "00111111 11110000 00000000 00000000"
    );
    constructor(seed0){
        seed = 577911373;
        this.state0 = new uint64_t(0,seed);
        this.state1 = new uint64_t(0,~seed);
        if(seed0){
            this.seed_float1(seed0);
        }
    }
    seed_float4(f1,f2,f3,f4){
        this.state0.a = doubleToInts(f1)[0];
        this.state0.b = doubleToInts(f2)[0];
        this.state1.a = doubleToInts(f3)[0];
        this.state1.b = doubleToInts(f4)[0];
    }
    seed_float2(f1,f2){
        [this.state0.a,this.state0.b,this.state1.a,this.state1.b] = [...doubleToInts(f1),...doubleToInts(f2)];
    }
    seed_float1(f1){
        [this.state0.a,this.state0.b] = doubleToInts(f1);
        [this.state1.a,this.state1.b] = [~this.state0.a,~this.state0.b];
    }
    seed_int4(i1,i2,i3,i4){
        [this.state0.a,this.state0.b,this.state1.a,this.state1.b] = [i1,i2,i3,i4];
    }
    seed_int2(i1,i2){
        [this.state0.a,this.state0.b,this.state1.a,this.state1.b] = [i1,~i1,i2,~i2];
    }
    seed_int1(i1){
        [this.state0.a,this.state0.b,this.state1.a,this.state1.b] = [i1,i1,~i1,~i1];
    }
    seed_float(){
        if(arguments.length >= 4){
            this.seed_float4(...arguments);
        }else if(arguments.length >= 2){
            this.seed_float2(...arguments);
        }else{
            this.seed_float1(...arguments);
        }
    }
    seed_int(){
        if(arguments.length >= 4){
            this.seed_int4(...arguments);
        }else if(arguments.length >= 2){
            this.seed_int2(...arguments);
        }else{
            this.seed_int1(...arguments);
        }
    }
    get(){
        let s1 = this.state0;
        let s0 = this.state1;
        this.state0 = this.state1.clone();
        s1.xor(s1.clone().shiftLeft(23));
        s1.xor(s1.clone().shiftRight(17));
        s1.xor(s0);
        this.state1 = s1;

        return this.state0.clone().add(this.state1)
        //fit it into range 0<1
        .and(this.constructor.doubleMask1).or(this.constructor.doubleMask2)
        /*.printf()*/.toDouble()-1;
    }
};

let PRNG_SEEDFLOAT = function(){
    let rng = new PRNG();
    rng.seed_float(...arguments);
    return rng.get.bind(rng);
};

let PRNG_SEEDINT = function(){
    let rng = new PRNG();
    rng.seed_int(...arguments);
    return rng.get.bind(rng);
};



if(typeof module !== "undefined"){
    module.exports = {PRNG,PRNG_SEEDFLOAT,PRNG_SEEDINT,uint64_t};
}