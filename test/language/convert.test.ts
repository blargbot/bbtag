// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, SubtagResult } from '../../src/language';

describe('module convert', () => {
    describe('function toString', () => {
        const tests: Array<{ input: SubtagResult, expected: string }> = [
            { input: 'abc', expected: 'abc' },
            { input: 12345, expected: '12345' },
            { input: NaN, expected: 'NaN' },
            { input: Infinity, expected: 'Infinity' },
            { input: -Infinity, expected: '-Infinity' },
            { input: true, expected: 'true' },
            { input: false, expected: 'false' },
            { input: undefined, expected: '' },
            { input: null, expected: '' },
            { input: [1, 2, 3], expected: bbtag.array.serialize([1, 2, 3]) },
        ];

        for (const { input, expected } of tests) {
            it(`should correctly convert ${JSON.stringify(input)} to ${expected}`, () => {
                // arrange

                // act
                const result = bbtag.toString(input);

                // assert
                expect(result).to.equal(expected);
            });
        }
    });
});