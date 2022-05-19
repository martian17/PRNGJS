let int32str = function(str){
    str = str.replace(/[^01]/g,"");
    let table = {"0":0,"1":1};
    let n = 0;
    for(let i = 0; i < 32; i++){
        n |= table[str[i]]<<(31-i);
    }
    return n;
}

let intsToDouble01 = (function(){
    let buff = new ArrayBuffer(8);
    let ints = new Int32Array(buff);
    let floats = new Float64Array(buff);
    let mask1 = int32str("00000000 00001111 11111111 11111111");
    let mask2 = int32str("00111111 11110000 00000000 00000000");

    return function(n1,n2){//n1 includes sign bits etc
        ints[0] = n2;
        ints[1] = (n1&mask1)|mask2;
        return floats[0]-1;
    };
})();



let hash32 = function(x) {
    x = ((x >>> 16) ^ x) * 0x45d9f3b;
    x = ((x >>> 16) ^ x) * 0x45d9f3b;
    x = (x >>> 16) ^ x;
    return x;
};

let hashNums = function(){
    //multiple seeds accepted
    //outputs 0 to 1 range
    //combine them with xor
    let state1 = 0;
    let state2 = 0;
    for(let i = 0; i < arguments.length; i++){
        let num = arguments[i];
        let [n1,n2] = doubleToInts(num);
        n1 = hash32(n1);
        n2 = hash32(n2);
        let n1d = (n2<<16)|(n1>>>16);
        let n2d = (n1<<16)|(n2>>>16);
        state1 ^= hash32(n1d);
        state2 ^= hash32(n2d);
    }
    return intsToDouble01(state1,state2);
};

let hashNums2 = function(){
    let state1 = 0;
    let state2 = 1;
    for(let i = 0; i < arguments.length; i++){
        //double to two ints
        let num = arguments[i];
        let [n1,n2] = doubleToInts(num);
        //spread out important bits
        n1 = hash32(n1);
        n2 = hash32(n2);
        //mix up their influences
        let n1d = (n2<<16)|(n1>>>16);
        let n2d = (n1<<16)|(n2>>>16);
        //combine it with the states
        state1 = hash32(state1^n1d);
        state2 = hash32(state2^n2d);
    }
    //diffuse the states
    let _state1 = (state2<<16)|(state1>>>16);
    let _state2 = (state1<<16)|(state2>>>16);
    return intsToDouble01(_state1,_state2);
};