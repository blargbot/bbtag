// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { Cursor, Position } from '../../..';

interface ICursorMovement {
    count: number;
    success: boolean;
    next: string | undefined;
    prev: string | undefined;
    offset: number;
    line: number;
    column: number;
    position: Position;
}

interface ICursorTestCase {
    input: string;
    movements: Iterable<ICursorMovement>;
}

function mov(
    count: number,
    success: boolean,
    [prev, next]: Array<string | undefined>,
    [offset, line, column]: number[]): ICursorMovement {
    return { count, success, next, prev, offset, line, column, position: new Position(offset, line, column) };
}

const und = undefined;
const tr = true;
const fa = false;

describe('class Cursor', () => {
    const testCases: ICursorTestCase[] = [
        {
            input: 'abc\nxyz', // test moving forward and then back
            movements: [
                mov(0,  /**/ tr, [und,  /**/  'a'], [0, 0, 0]),
                mov(-1, /**/ fa, [und,  /**/  'a'], [0, 0, 0]),
                mov(0,  /**/ tr, [und,  /**/  'a'], [0, 0, 0]),
                mov(1,  /**/ tr, ['a',  /**/  'b'], [1, 0, 1]),
                mov(1,  /**/ tr, ['b',  /**/  'c'], [2, 0, 2]),
                mov(2,  /**/ tr, ['\n', /**/  'x'], [4, 1, 0]),
                mov(-1, /**/ tr, ['c',  /**/ '\n'], [3, 0, 3]),
                mov(1,  /**/ tr, ['\n', /**/  'x'], [4, 1, 0]),
                mov(1,  /**/ tr, ['x',  /**/  'y'], [5, 1, 1]),
                mov(1,  /**/ tr, ['y',  /**/  'z'], [6, 1, 2]),
                mov(1,  /**/ tr, ['z',  /**/  und], [7, 1, 3]),
                mov(1,  /**/ fa, ['z',  /**/  und], [7, 1, 3]),
                mov(0,  /**/ tr, ['z',  /**/  und], [7, 1, 3]),
                mov(-1, /**/ tr, ['y',  /**/  'z'], [6, 1, 2]),
                mov(-1, /**/ tr, ['x',  /**/  'y'], [5, 1, 1]),
                mov(-1, /**/ tr, ['\n', /**/  'x'], [4, 1, 0]),
                mov(-1, /**/ tr, ['c',  /**/ '\n'], [3, 0, 3]),
                mov(-1, /**/ tr, ['b',  /**/  'c'], [2, 0, 2]),
                mov(-1, /**/ tr, ['a',  /**/  'b'], [1, 0, 1]),
                mov(-1, /**/ tr, [und,  /**/  'a'], [0, 0, 0]),
                mov(-1, /**/ fa, [und,  /**/  'a'], [0, 0, 0]),
                mov(0,  /**/ tr, [und,  /**/  'a'], [0, 0, 0])
            ]
        }
    ];
    for (const { input, movements } of testCases) {
        it(`should correctly navigate the string ${JSON.stringify(input)}`, () => {
            // arrange
            const results = [];
            const expected = [];
            const cursor = new Cursor(input);
            let index = 0;

            // act
            for (const { count, success, prev, next, line, column, offset, position } of movements) {
                const step = `Step: ${index++}`;
                results.push([step, cursor.move(count), cursor.prevChar, cursor.nextChar, cursor.line, cursor.column, cursor.offset, cursor.position]);
                expected.push([step, success, prev, next, line, column, offset, position]);
            }

            // assert
            expect(results).to.deep.equal(expected);
        });
    }
});