
import { dotKernel } from "./kernels";
import {create2dArray} from "../util"
import { BinaryOperation } from "./binaryOps";
import {
    add, 
    div, 
    mul,
    pow,
    sub
} from "./binaryOps";

export type Shape = [number, number];
export type MatrixValuesType = number[][] | Float32Array[]

export const assertShapeConsistency = (values: MatrixValuesType, shape: [number, number]) => {
    const [rowsRequired, colsRequired] = shape;

    if (values.length !== rowsRequired) throw new Error(`array requires ${rowsRequired} rows, but got ${values.length}`)

    values.forEach((row, index) => {
        if (row.length !== colsRequired) {
            throw new Error(`array requires each row to have ${colsRequired} column, but at row: ${index} got ${row.length}`);
        }
    })
}


const shapesEqual = (shapeA: Shape, shapeB: Shape) => {
    return shapeA[0] === shapeB[0] && shapeA[1] === shapeB[1];
}

export const assertPositiveShapeDimensions = (shape: Shape) => {
    if (shape[0] < 1 || shape[1] < 1) throw new Error(`matrix must have at least 1 row and 1 colmun, got ${shape[0]} & ${shape[1]}`)
}

export const inferShape = (values: MatrixValuesType, checkShapeConsistency: boolean) => {
    const rows = values.length;
    const cols = values[0].length;

    if (checkShapeConsistency) assertShapeConsistency(values, [rows,cols]);
    return [rows, cols];
}

export interface IMatrixConfig { 
    rows: number;
    cols: number;
    shape: Shape;
} 

class Matrix {

    readonly rows: number;
    readonly cols: number;
    readonly shape: Shape;
    private _values: MatrixValuesType;

    static add: BinaryOperation = add;
    static sub: BinaryOperation = sub;
    static mul: BinaryOperation = mul;
    static div: BinaryOperation = div;
    static pow: BinaryOperation = pow;

    get values() {
        return this._values;
    }

    constructor(
        values: MatrixValuesType,
        shape?: Shape
    ) {
        this.rows = shape ? shape[0] : values.length;
        this.cols = shape ? shape[1] : values[0].length;
        this.shape = [this.rows, this.cols];
        this._values = values;
    }

    assign(newMatrix: Matrix, errorMessage?: string) {
        if (!Matrix.shapeEquals(this, newMatrix)) {
            throw new Error(
                errorMessage || 
                `matrix of shape ${newMatrix.printShape()} can't be assigned to matrix of ${this.printShape()}`
            );
        }
        this._values = newMatrix._values;
    }

    printShape() {
        return `(${this.rows} x ${this.cols})`
    }

    getConfig() {
        return {
            shape: this.shape,
            rows: this.rows,
            cols: this.cols
        }
    }

    static printShape(shape: Shape) {
        return `(${shape[0]} x ${shape[1]})`
    }

    //turns one-dimensional array into Matrix of specified shape
    static shape1DArray(arr: number[] | Float32Array, shape: Shape) {
        const stride = shape[1];
        if (shape[0] * shape[1] > arr.length) {
            throw new Error(`cannot convert arr of length ${arr.length} into Matrix of shape ${this.printShape(shape)}, expected arr.length=${shape[0] * shape[1]} `)
        }
        const result = create2dArray(shape);
        for (let row=0; row < shape[0]; row++) {
            for (let col=0; col < shape[1]; col++) {
                result[row][col] = arr[col + row * stride];
            }
        }
        return new Matrix(result);
    }
 
    static shapeEquals(m1: Matrix, m2: Matrix) {
        return (m1.rows === m2.rows) && (m1.cols === m2.cols);
    }

    static fill(shape: Shape, value: number=1) {
        assertPositiveShapeDimensions(shape);
        const result = create2dArray(shape);
        for (let i=0; i < shape[0]; i++) {
            for (let j=0; j < shape[1]; j++) {
                result[i][j] = value;
            }
        }
        return new Matrix(result);
    }

    static fillFromFunc(shape: Shape, cb: (i: number, j: number) => number) {
        assertPositiveShapeDimensions(shape);
        const result = create2dArray(shape);
        for (let i=0; i < shape[0]; i++) {
            for (let j=0; j < shape[1]; j++) {
                result[i][j] = cb(i,j);
            }
        }
        return new Matrix(result);
    }

    static randUniform(shape: Shape, min: number, max: number) {
        return Matrix.fillFromFunc(shape, () => Math.random() * (max - min) + min)
    }

    //used in serializing 
    flat() {
        const result: number[] = []
        this.iterate(v => result.push(v));
        return new Float32Array(result);
    }

    map(cb: (v: number, i: number, j: number) => number) {
        const result = create2dArray(this.shape);
        for (let i=0; i < this.rows; i++) {
            for (let j=0; j < this.cols; j++) {
                result[i][j] = cb(this._values[i][j], i,j);
            }
        }
        return new Matrix(result);
    }

    iterate(cb: (value: number, i: number, j: number) => void) {
        for (let i=0; i < this.rows; i++) {
            for (let j=0; j < this.cols; j++) {
                cb(this._values[i][j], i,j);
            }
        }
    }

    transpose() { 
        const T =  Matrix.fill([this.cols, this.rows]);
        this.iterate(( value , i, j) => T._values[j][i] = value )
        return T;
    }

    static dotGPU(a: Matrix, b: Matrix): Matrix{
        if (a.cols !== b.rows) throw new Error();
        dotKernel.setOutput([b.cols, a.rows]);
        let out = dotKernel(a.values, b.values, a.cols) as number[][];
        return new Matrix(out);
    }

    static dot(m1: Matrix, m2: Matrix) {
        if (m1.cols !== m2.rows) throw new Error(`cannot dot a (${m1.rows} x ${m1.cols}) & (${m2.rows} x ${m2.cols})`)
        //TODO - make more efficient?
        const result = Matrix.fill([m1.rows, m2.cols]);
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

    sum() {
        let total=0;
        this.iterate(v => total += v);
        return total;
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
        return sumMatrix.map(v => v / this.rows);
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

    max() {
        let maxValue = 0;
        let position: number[] = [];

        this.iterate((v, i,j)=> {
            if (v > maxValue) {
                maxValue = v; 
                position = [i,j];
            } 
        })

        return {value: maxValue, position}
    }

    add(m: Matrix | number) { return Matrix.add(this, m) }
    sub(m: Matrix | number) { return Matrix.sub(this, m) }
    mul(m: Matrix | number) { return Matrix.mul(this, m) }
    div(m: Matrix | number) { return Matrix.div(this, m) }
    pow(m: Matrix | number) { return Matrix.pow(this, m) }

    dot(m: Matrix) { return Matrix.dot(this, m)}
}


interface IMatrixParamas {
    passByRef?: boolean;
    checkShapeConsistency?: boolean;
}

//handles validation  
export const matrix = (values: MatrixValuesType, shape?: Shape, {checkShapeConsistency=true, passByRef=false}: IMatrixParamas = {}) => {

    if (shape) assertPositiveShapeDimensions(shape);
    const [inferredRows, inferredCols] = inferShape(values, checkShapeConsistency);

    if (shape) {
        const [rows, cols] = shape;
        if (inferredRows !== rows || inferredCols !== cols) {
            throw new Error(`shape of given array (${inferredRows} x ${inferredCols}) doesn't match the shape specified (${rows} x ${cols})`);
        }
    }

    return new Matrix(values)
}

//simply a (1x1) matrix
export const scalar = (value: number) => {
    return new Matrix([[value]]);
}


export default Matrix;


/* 


*/