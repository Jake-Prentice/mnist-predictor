
class Matrix {

    rows: number;
    cols: number;
    values: number[][];

    constructor(...params: [number, number] | [number[][]]) {

        if (Array.isArray(params[0])) {
            const matrix = params[0];
            this.rows = matrix.length;
            this.cols = matrix[0].length;
            this.values = matrix;
        }else {
            if (params[0] < 1 || params[1]! < 1) throw new Error();
            this.rows = params[0];
            this.cols = params[1]!;
            this.values = Array.from({length: this.rows}, _ => Array.from({length: this.cols}, _ => 1))
        }
    }

    //TODO - turn array into matrix 

    elementWise(m: Matrix, cb: (v1: number, v2: number) => number) {
        if (this.rows !== m.rows || this.cols !== m.cols) throw new Error("rows and cols must be the same!")
        return this.values.map((r, rowi) => r.map((v, coli) => cb(v, m.values[rowi][coli]) ))
    }

    forIJ(cb: (value: number, i: number, j: number) => void) {
        this.values.forEach((row, i) => {
            row.forEach((value, j) => {
                cb(value,i,j);
            })
        })
    }

    initRand(min: number, max: number) {
        this.values = this.elementWise(this, () => Math.random() * (max - min) + min);
    }

    transpose() {
        const T = new Matrix(this.cols, this.rows);
        this.forIJ(( value , i, j) => T.values[j][i] = value )
        return T.values;
    }

    static dot(m1: Matrix, m2: Matrix) {

        const result: number[][] = [];

        const n = m1.rows;
        const m = m1.cols;
        const p = m2.cols;
    
        for (let r=0; r < n; r++) {
            result.push([]);
        }
        
        for (let i=0; i < n; i++) {
            for (let j=0; j < p; j++) {
                let sum = 0;
                for (let k=0; k < m; k++) {
                    sum += m1.values[i][k] * m2.values[k][j];
                }
    
                result[i][j] = sum;
            }
        }
    
        return result;
    }


    static add(m1: Matrix, m2: Matrix) {
      return m1.elementWise(m2, (v1, v2) => v1 + v2);
    }

    static subtract(m1: Matrix, m2: Matrix) {
        return m1.elementWise(m2, (v1, v2) => v2 - v1);
    }

    static multiply(m1: Matrix, m2: Matrix) {
        return m1.elementWise(m2, (v1, v2) => v1 * v2);
    }
    
}


export default Matrix;