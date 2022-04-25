let toBitString = function(n){
    let s = "";
    for(let i = 31; i >= 0; i--){
        s += (n>>i)&1
    }
    return s;
};

let intsToDouble = (()=>{
    let buff = new ArrayBuffer(8);
    let ints = new Int32Array(buff);
    let floats = new Float64Array(buff);
    return function(a,b){
        ints[0] = a;
        ints[1] = b;
        return floats[0];
    };
})();

let doubleToInts = (()=>{
    let buff = new ArrayBuffer(8);
    let ints = new Int32Array(buff);
    let floats = new Float64Array(buff);
    return function(f){
        floats[0] = f;
        return [...ints];
    };
})();

class uint64_t{
    constructor(a,b){
        this.a = a;
        this.b = b;
    }
    shiftLeft(n){
        if(n >= 32){
            this.a = this.b << (n-32);
            this.b = 0;
        }else{
            this.a = (this.a << n) | (this.b >>> 32-n);
            this.b = this.b << n;
        }
        return this;
    }
    shiftRight(n){
        if(n >= 32){
            this.b = this.a >>> (n-32);
            this.a = 0;
        }else{
            this.b = (this.b >>> n) | (this.a << 32-n);
            this.a = this.a >>> n;
        }
        return this;
    }
    xor(n){
        this.a ^= n.a;
        this.b ^= n.b;
        return this;
    }
    and(n){
        this.a &= n.a;
        this.b &= n.b;
        return this;
    }
    or(n){
        this.a |= n.a;
        this.b |= n.b;
        return this;
    }
    add(n){
        let a1r = this.a&(-1>>>2);
        let b1r = this.b&(-1>>>2);
        let a2r = n.a&(-1>>>2);
        let b2r = n.b&(-1>>>2);

        let bb = b1r+b2r;
        //upper 2 bits
        let br = ((bb&~(-1>>>2))>>>30)+(this.b>>>30)+(n.b>>>30);
        let carry = br>>>2;//1 or 0
        this.b = (bb&(-1>>>2))|(br<<30);

        let aa = a1r+a2r+carry;
        //upper 2 bits
        let ar = ((aa&~(-1>>>2))>>>30)+(this.a>>>30)+(n.a>>>30);
        this.a = (aa&(-1>>>2))|(ar<<30);
        return this;
    }
    toDouble(){
        return intsToDouble(this.a,this.b);
    }
    clone(){
        return new uint64_t(this.a,this.b);
    }
    fromBinary(str){
        str = str.replace(/[^01]/g,"");
        let table = {"0":0,"1":1};
        let a = 0;
        let b = 0;
        for(let i = 0; i < 32; i++){
            a |= table[str[i]]<<(31-i);
            b |= table[str[i+32]]<<(31-i);
        }
        this.a = a;
        this.b = b;
        return this;
    }
    print(){
        console.log(toBitString(this.a)+" "+toBitString(this.b));
        return this;
    }
    printf(){
        console.log([
            toBitString(this.a),
            toBitString(this.b)
        ].map(s=>{
            let ss = "";
            for(let i = 0; i < s.length; i++){
                ss += s[i];
                if((i+1)%8 === 0){
                    ss += " ";
                }
            }
            return ss;
        }).join("\n"));
        return this;
    }
};




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