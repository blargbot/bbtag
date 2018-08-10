import { expect } from 'chai';
import * as language from '../dist/language.v2';

describe('Language.2', () => {
    describe('#parse(string)', () => {
        let testCases = [
            {
                input: 'Hello this is a test; how cool!',
                output: ['Hello this is a test; how cool!']
            },
            {
                input: 'Hello this is a {test} how cool!',
                output: ['Hello this is a ', ['test'], ' how cool!']
            }
        ];
        it('should successfully parse a string without subtags', () => {
            // arrange
            let input = 'Hello this is a test; how cool!';

            // act
            let parsed = language.parse(input);

            // assert
            expect(parsed.content).to.equal(input);
            expect(parsed.parts.count()).to.equal(1);
            expect(parsed.parts.first()).to.equal(input);
        });

        it('should successfully parse a string with one subtag', () => {
            // arrange
            let input = 'Hello this is a {test} how cool!';

            // act
            let parsed = language.parse(input);

            // assert
            expect(parsed.content).to.equal(input);
            expect(parsed.parts.count()).to.equal(3);
            expect(parsed.parts.first()).to.equal(input.split('{')[0]);
        });
    });
});