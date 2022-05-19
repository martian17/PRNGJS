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