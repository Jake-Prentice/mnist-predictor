
class Matrix {

    rows: number;
    cols: number;
     _values: number[][];

    // get values() {
    //     return this._values;
    // }
    
    // set values(theValues: number[][]) {
    //     if (this.rows !== theValues.length || this.cols !== theValues[0].length) {
    //         throw new Error(`matrix is of dimensions (${this.rows} x ${this.cols}) not (${theValues.length} x ${theValues[0].length})`)
    //     }
    //     this._values = theValues;
    // }

    constructor(...params: [number, number] | [number[][]]) {

        if (Array.isArray(params[0])) {
            const matrix = params[0];
            this.rows = matrix.length;
            this.cols = matrix[0].length;
            this._values = matrix;
        }else {
            if (params[0] < 1 || params[1]! < 1) throw new Error();
            this.rows = params[0];
            this.cols = params[1]!;
            this._values = Array.from({length: this.rows}, _ => Array.from({length: this.cols}, _ => 1))
        }
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

    transpose() { 
        const T = new Matrix(this.cols, this.rows);
        console.log(T, this.cols, this.rows)
        this.forIJ(( value , i, j) => T._values[j][i] = value )
        return T;
    }

    static convertArrayToMatrix(arr: number[] | string[]) {
        return arr.map(v => [+v]);
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

        if (
            typeof m === "number" 
            || m instanceof Matrix && (this.rows === m.rows && this.cols === m.cols)
        ) {
            return this.map((v, i, j) => m instanceof Matrix ? cb(v, m._values[i][j]) : cb(v,m))  
        }

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
    
}


export default Matrix;


/* 


*/