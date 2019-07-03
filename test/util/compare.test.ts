// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { SubtagResult } from '../../src/structures';
import { compare } from '../../src/util/compare';

describe('function compare', () => {
    const testCases: Array<{ left: SubtagResult, right: SubtagResult, expected: number }> = [
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
        { left: 0, right: -1000, expected: 1 }

        // string to string

        // array to array

        // undef to undef

        // error to error

        // cross type compare
    ];

    for (const { left, right, expected } of testCases) {
        it(`should correctly compare '${left}' with '${right}' as ${expected}`, () => {
            // arrange

            // act
            let result = compare(left, right);
            if (result !== 0) { result /= Math.abs(result); }

            // assert
            expect(result).to.equal(expected);
        });
    }
});