import { GPU } from "gpu.js";

// (rows, cols, passByRef) | (values, passByRef)
type MatrixParamsType = [number, number, boolean?] | [number[][], boolean?];

                
class Matrix {

    rows: number;
    cols: number;
     _values: number[][];
    gpu: GPU

    get values() {
        return this._values;
    }
    
    set values(theValues: number[][]) {
        if (this.rows !== theValues.length || this.cols !== theValues[0].length) {
            throw new Error(`matrix is of dimensions (${this.rows} x ${this.cols}) not (${theValues.length} x ${theValues[0].length})`)
        }
        this._values = theValues;
    }

    constructor(...params: MatrixParamsType) {

        this.gpu = new GPU();

        let passByRef = typeof params[params.length - 1] === "boolean" ?? false;
        //if values of the matrix are passed in 
        if (Array.isArray(params[0]))  {
            const matrix = params[0];
            this.rows = matrix.length;
            this.cols = matrix[0].length;
            this._values = matrix;
        }else {
            //TODO - sort this out!
            const rows = params[0];
            const cols = params[1] as number;

            if (rows < 1 || cols! < 1) throw new Error();
            this.rows = rows;
            this.cols = cols;
            this._values = Array.from({length: this.rows}, _ => Array.from({length: this.cols}, _ => 1))
        }
    }

    static isSameShape(m1: Matrix, m2: Matrix) {
        return (m1.rows === m2.rows) && (m1.cols === m2.cols);
    }

    map(cb: (v: number, i: number, j: number) => number) {
        return new Matrix( this._values.map((row, i) => row.map((v, j) => cb(v, i, j))) )
    }

    forIJ(cb: (value: number, i: number, j: number) => void) {
        this._values.forEach((row, i) => {
            row.forEach((value, j) => {
                cb(value,i,j);
            })
        })
    }

    initRand(min: number, max: number) {
      this._values = this.map(() => Math.random() * (max - min) + min)._values;
    }

    
    static transposeArray(arr: number[][]) {
        for (let i=0; i < arr.length; i++) {
            for (let j=0; j < arr[0].length; j++) {
                arr[j][i] = arr[i][j];
            }
        }
    }

    transpose() { 
        const T = new Matrix(this.cols, this.rows);
        this.forIJ(( value , i, j) => T._values[j][i] = value )
        return T;
    }

    static convertArrayToMatrix(arr: number[] | string[]) {
        return new Matrix(arr.map(v => [+v]));
    }

    static dot(m1: Matrix, m2: Matrix) {
            
        if (m1.cols !== m2.rows) throw new Error(`cannot dot a (${m1.rows} x ${m1.cols}) & (${m2.rows} x ${m2.cols})`)

        const result = new Matrix(m1.rows, m2.cols);
        
        for (let i=0; i < m1.rows; i++) {
            for (let j=0; j < m2.cols; j++) {
                let sum = 0;
                for (let k=0; k < m1.cols; k++) {
                    sum += m1._values[i][k] * m2._values[k][j];
                }
    
                result._values[i][j] = sum; 
            }
        }
    
        return result;
    }

    sumRows() {
        const sums: number[][] = [];
        
        for (let i=0; i < this.rows; i++) {
            let sum = 0;
            for (let j=0; j < this.cols; j++) {
                sum += this._values[i][j];
            }
            sums.push([sum]);
        }

        return new Matrix(sums);
    }


    averageRows() {
        const sumMatrix = this.sumRows();
        return sumMatrix.map((v, i, j) => v / this.rows);
    }

    averageCols() {
        let sum = 0;
        const average: number[][] = [[]];

        for (let i=0; i < this.rows; i++) {
            for (let j=0; j < this.cols; j++) {
                sum += this._values[j][i];
            }
            average.push([sum / this.cols]);
        }

        return new Matrix(average)
    }

    
    calc(m: Matrix | number, cb: (v1: number, v2: number) => number) {

        //broadcast single value
        if (typeof m === "number") return this.map((v, i, j) => cb(v,m))  
        
        //shapes are the same
        if (this.rows === m.rows && this.cols === m.cols) return this.map((v, i, j) => cb(v, m._values[i][j]))

        //try to broadcast rows and columns
        if (this.rows === m.rows) {
            if (this.cols === 1) return m.map((v, i,j) => cb(this._values[i][0], v));
            if (m.cols === 1) return this.map((v, i,j) => cb(v, m._values[i][0]));
        }

        if (this.cols === m.cols) {
            if (this.rows === 1) return m.map((v, i, j) => cb(this._values[0][j], v));
            if (m.rows === 1) return this.map((v, i, j) => cb(v, this._values[0][j]));
        }

        throw new Error(`(${this.rows} x ${this.cols}) & (${m.rows} x ${m.cols}) not broadcastable!`);
    }


    add(m: Matrix | number) {
        return this.calc(m, (v1, v2) => v1 + v2);
    }

    subtract(m: Matrix | number) {
        return this.calc(m, (v1, v2) => v1 - v2);
    }

    //hadamard product
    multiply(m: Matrix | number) {
        return this.calc(m, (v1, v2) => v1 * v2);
    }

    divide(m: Matrix | number) {
        return this.calc(m, (v1, v2) => v1 / v2);
    }

    
    toPow(m: Matrix | number) {
        return this.calc(m, (v1, v2) => v1 ** v2);
    }
    
}


export default Matrix;


/* 


*/