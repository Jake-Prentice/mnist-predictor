import Matrix from "../matrix";

type ValueType = number | Matrix;

type FunctionType<T> = 
    T extends Matrix ? Matrix :
    T extends number ? number :
    never;


class ActivationFunc {
  
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
 
