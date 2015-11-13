"use strict";

let fs = require('fs');

class OutOfBoundError extends Error {
    constructor(matrix, i, j) {
        super(`Index array out of bound (${i},${j}) exceeds (${matrix.lines}, ${matrix.columns}).`);
        this.name = 'OutOfBoundError';
    }
}

class Matrix {
    constructor(lines, columns) {
        // this.lines = lines;
        // this.columns = columns;

        this.data = [];

        for (let i = 0; i < lines; i++) {
            let line = [];
            for (let j = 0; j < columns; j++) {
                line.push(0);
            }
            this.data.push(line);
        }
    }

    get(i, j) {
        // if (i >= this.lines || j >= this.columns || i < 0 || j < 0 ) {
        //     this._throwOutOfBoundError(i,j);
        // }
        return this.data[i][j];
    }

    set(i, j, value) {
        // if (i >= this.lines || j >= this.columns || i < 0 || j < 0 ) {
        //     this._throwOutOfBoundError(i,j);
        // }
        return this.data[i][j] = value;
    }

    print(type) {
        if (type === 'matlab') {

            let maxColumns = 0;

            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].length > maxColumns)
                    maxColumns = this.data[i].length;
            }

            let str = '[';

            for (let i = 0; i < this.data.length; i++) {
                str += '[';
                for (let j = 0; j < maxColumns; j++) {
                    str +=
                        (this.data[i][j] !== undefined ? this.data[i][j] : 0) +
                        (j === maxColumns - 1 ? ']' : ',');
                }
                str += (i === this.data.length - 1 ? ']' : ';');
            }

            console.log(str + ';');

            return;
        }
        // for (let i = 0; i < this.lines; i++) {
        //     for (let j = 0; j < this.columns; j++) {
        //         process.stdout.write(this.get(i,j) + ' ');
        //     }
        //     process.stdout.write('\n');
        // }
    }

    toArray() {
        return this.data;
    }

    fromArray(array) {

        // if (! array instanceof Array)
        //     throw new TypeError('Parameter is not an array');

        // let columns = null;
        // for (let line of array) {
        //     if (! line instanceof Array)
        //         throw new TypeError('Parameter is not an array of array');

        //     if (columns === null) {
        //         columns = line.length;
        //     } else if (columns !== line.length) {
        //         throw new Typerror('The lines have not the same size');
        //     }

        // }

        this.data = array;

        // this.columns = columns;
        // this.lines = array.length;

    }

    saveToFile(path, type) {
        if (type === 'matlab') {
            fs.writeFileSync(path, JSON.stringify(this.data).replace('],', '];'));
            return;
        }
        fs.writeFileSync(path, JSON.stringify(this.data));
    }

    loadFromFile(path) {
        this.fromArray(JSON.parse(fs.readFileSync(path, 'utf-8')));
    }

    _throwOutOfBoundError(i,j) {
        throw new OutOfBoundError(this, i, j);
    }
};

module.exports = Matrix;

function main() {

    var m = new Matrix(2,3);
    m.set(1,2,3);
    m.print();
    m.saveToFile('tests/myMatrix.json');

    console.log('----');

    var m2 = new Matrix();
    m2.loadFromFile('tests/myMatrix.json');
    m2.print();

}

if (require.main === module) {
    main();
}
