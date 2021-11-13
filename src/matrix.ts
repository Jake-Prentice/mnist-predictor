
class Matrix {

    rows: number;
    cols: number;
    private _values: number[][];

    get values() {
        return this._values;
    }
    
    set values(theValues: number[][]) {
        if (this.rows !== theValues.length || this.cols !== theValues[0].length) {
            throw new Error(`matrix is of dimensions (${this.rows} x ${this.cols}) not (${theValues.length} x ${theValues[0].length})`)
        }
        this._values = theValues;
    }

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

    // elementWise(m: Matrix, cb: (v1: number, v2: number) => number) {
    //     if (this.rows !== m.rows || this.cols !== m.cols) throw new Error("rows and cols must be the same!")
    //     return new Matrix(this._values.map((r, rowi) => r.map((v, coli) => cb(v, m.values[rowi][coli]) )) )
    // }

    map(cb: (v: number, i: number, j: number) => number) {
        return new Matrix( this.values.map((row, i) => row.map((v, j) => cb(v, i, j))) )
    }

    forIJ(cb: (value: number, i: number, j: number) => void) {
        this._values.forEach((row, i) => {
            row.forEach((value, j) => {
                cb(value,i,j);
            })
        })
    }

    initRand(min: number, max: number) {
      this._values = this.map(() => Math.random() * (max - min) + min).values;
    }

    transpose() { 
        const T = new Matrix(this.cols, this.rows);
        this.forIJ(( value , i, j) => T.values[j][i] = value )
        return T._values;
    }

    static convertArrayToMatrix(arr: number[] | string[]) {
        return arr.map(v => [+v]);
    }

    static dot(m1: Matrix, m2: Matrix) {

        const n = m1.rows;
        const m = m1.cols;
        const p = m2.cols;
    
        const result = new Matrix(n, p);
        
        for (let i=0; i < n; i++) {
            for (let j=0; j < p; j++) {
                let sum = 0;
                for (let k=0; k < m; k++) {
                    sum += m1.values[i][k] * m2.values[k][j];
                }
    
                result.values[i][j] = sum; 
            }
        }
    
        return result;
    }


    calc(m: Matrix | number, cb: (v1: number, v2: number) => number) {
      return this.map((v, i, j) => m instanceof Matrix ? cb(v, m._values[i][j]) : cb(v,m)) 
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

    Matrix.elementWise(m1, m2, (v1, v2) => v1 + v2)


    static elementWise(m1: Matrix | number, m2: Matrix | number) {
        if (m1 instanceOf Matrix)
    }
*/