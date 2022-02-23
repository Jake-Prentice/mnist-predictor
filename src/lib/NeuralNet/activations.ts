import Matrix from "../Matrix";

type ValueType = number | Matrix;

type FunctionType<T> = 
    T extends Matrix ? Matrix :
    T extends number ? number :
    never;

const calc = (m: ValueType, cb: (v: number) => number) => {
    if (m instanceof Matrix) return m.map(v => cb(v)) 
    return cb(m);
}

export abstract class Activation { 

    input?: Matrix;
    output?: Matrix;
    delta?: Matrix;

    abstract forward(input: Matrix): Matrix;
    
    abstract backward(passBackError: Matrix): Matrix; 
}


export class Sigmoid extends Activation { 

    forward(input: Matrix) {
        this.input = input;
        this.output = input.map(v => 
            1/ (1+ Math.exp(-v)) 
        )

        return this.output;
    }

    backward(passBackError: Matrix) {
        if (!this.input || !this.output) throw new Error();
        
        const dSigmoid = this.output.map(v => v * (1 - v) )
        this.delta = passBackError.mul(dSigmoid);

        return this.delta;
    }
}


export class ActivationFunc {
  
    func: <T extends ValueType>(m: T) => FunctionType<T>;
    prime: <T extends ValueType>(m: T) => FunctionType<T>;

    calc(m: ValueType, cb: (v: number) => number) {
        if (m instanceof Matrix) return m.map(v => cb(v)) 
        return cb(m);
    }
    
    constructor(
        func: (v: number) => number, 
        prime: (v: number) => number
    ) {
        this.func = function<T extends ValueType>(m: T) { 
            return this.calc(m, func) as FunctionType<T>; 
        }
        this.prime = function<T extends ValueType>(m: ValueType) { 
            return this.calc(m, prime) as FunctionType<T>; 
        };
    }
}


export const sigmoid = new ActivationFunc(
    v => 1/ (1+ Math.exp(-v)),
    v => v * (1 - v)
);

export const ReLU = new ActivationFunc(
    v => v < 0 ? 0 : v,
    v => v < 0 ? 0 : 1
)