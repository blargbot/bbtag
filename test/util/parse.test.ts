import { expect } from 'chai';
import * as parse from '../../dist/util/parse';

export function test() {
    describe('#parseBool()', () => {
        it('should successfully parse strings', () => {
            // arrange
            let cases = [
                { input: 'true', expected: true },
                { input: 'True', expected: true },
                { input: 'yes', expected: true },
                { input: 'Yes', expected: true },
                { input: 't', expected: true },
                { input: 'T', expected: true },
                { input: 'y', expected: true },
                { input: 'Y', expected: true },
                { input: 'false', expected: false },
                { input: 'False', expected: false },
                { input: 'no', expected: false },
                { input: 'No', expected: false },
                { input: 'f', expected: false },
                { input: 'F', expected: false },
                { input: 'n', expected: false },
                { input: 'N', expected: false },
                { input: '1', expected: true },
                { input: '0', expected: false },
                { input: '-1', expected: true },
            ];

            for (const entry of cases) {
                // act
                let result = parse.parseBool(entry.input);

                // assert
                expect(result).to.equal(entry.expected, `'${entry.input}' should correctly parse`);
            }
        });
    });
}