// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, SubtagResult } from '../../src/language';

describe('function compare', () => {
    const testCases: Array<{ left: SubtagResult, right: SubtagResult, expected: -1 | 0 | 1 }> = [
        // number to number
        { left: 0, right: 0, expected: 0 },
        { left: 1, right: 1, expected: 0 },
        { left: -1, right: -1, expected: 0 },
        { left: 1000, right: 1000, expected: 0 },
        { left: -1000, right: -1000, expected: 0 },
        { left: -1, right: 0, expected: -1 },
        { left: 0, right: 1, expected: -1 },
        { left: -1000, right: 0, expected: -1 },
        { left: 0, right: 1000, expected: -1 },
        { left: 1, right: 0, expected: 1 },
        { left: 0, right: -1, expected: 1 },
        { left: 1000, right: 0, expected: 1 },
        { left: 0, right: -1000, expected: 1 },
        { left: NaN, right: 0, expected: 1 },
        { left: NaN, right: NaN, expected: 0 },
        { left: 0, right: NaN, expected: -1 },
        { left: NaN, right: Infinity, expected: 1 },
        { left: NaN, right: -Infinity, expected: 1 },
        { left: Infinity, right: NaN, expected: -1 },
        { left: -Infinity, right: NaN, expected: -1 },
        { left: Infinity, right: 0, expected: 1 },
        { left: -Infinity, right: 0, expected: -1 },
        { left: Infinity, right: Number.MAX_VALUE, expected: 1 },
        { left: -Infinity, right: -Number.MAX_VALUE, expected: -1 },

        // string to string
        { left: 'abc', right: 'abc', expected: 0 },
        { left: 'abcd', right: 'abc', expected: 1 },
        { left: 'ab', right: 'abc', expected: -1 },

        // array to array
        { left: [1, undefined, '2', 3], right: [1, undefined, '2', 3], expected: 0 },
        { left: [1, undefined, '2', 4], right: [1, undefined, '2', 3], expected: 1 },
        { left: [1, undefined, '2', 3], right: [1, undefined, '2', 4], expected: -1 },
        { left: [1, undefined, '2'], right: [1, undefined, '2', 3], expected: -1 },
        { left: [1, undefined, '2', 3], right: [1, undefined, '2'], expected: 1 },
        { left: [1, undefined, '2'], right: [1, undefined, 2], expected: 1 },
        { left: [1, undefined, NaN], right: [1, undefined, NaN], expected: 0 },
        { left: [1, undefined, NaN], right: [1, undefined, 0], expected: 1 },
        { left: [1, undefined, 0], right: [1, undefined, NaN], expected: -1 },

        // undef to undef
        { left: undefined, right: undefined, expected: 0 },

        // error to error

        // cross type compare
        { left: 0, right: 'abc', expected: -1 },
        { left: 'abc', right: 0, expected: 1 }
    ];

    for (const { left, right, expected } of testCases) {
        it(`should correctly compare '${left}' with '${right}' as ${expected}`, () => {
            // arrange

            // act
            let result = bbtag.compare(left, right);
            if (result !== 0) { result /= Math.abs(result); }

            // assert
            expect(result).to.equal(expected);
        });
    }
});