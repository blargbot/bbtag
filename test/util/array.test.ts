import { expect } from 'chai';
import { array } from '../../dist/util';

export function test() {
    describe('#serialize()', () => {
        it('should successfully serialize an unnamed array when given a name', () => {
            // arrange
            let name = 'test';
            let value = ['1', '2', '3'];
            let expected = '{"v":["1","2","3"],"n":"test"}';

            // act
            let result = array.serialize(value, name);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully serialize an unnamed array when not given a name', () => {
            // arrange
            let value = ['1', '2', '3'];
            let expected = '["1","2","3"]';

            // act
            let result = array.serialize(value);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully serialize a named array when also given a new name', () => {
            // arrange
            let name = 'newName';
            let value = { v: ['1', '2', '3'], n: 'oldName' };
            let expected = '{"v":["1","2","3"],"n":"newName"}';

            // act
            let result = array.serialize(value, name);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully serialize a named array when not given a new name', () => {
            // arrange
            let value = { v: ['1', '2', '3'], n: 'test' };
            let expected = '{"v":["1","2","3"],"n":"test"}';

            // act
            let result = array.serialize(value);

            // assert
            expect(result).to.equal(expected);
        });
    });
    describe('#deserialize()', () => {
        it('should successfully deserialize a plain array', () => {
            // arrange
            let input = '["1","2","3"]';
            let expected = ['1', '2', '3'];

            // act
            let result = array.deserialize(input);

            // assert
            expect(result).to.exist;
            expect(result!.n).to.not.exist;
            expect(result!.v).to.deep.equal(expected);
        });
        it('should successfully deserialize a named bbarray', () => {
            // arrange
            let input = '{"v":["1","2","3"],"n":"test"}';
            let expected = { v: ['1', '2', '3'], n: 'test' };

            // act
            let result = array.deserialize(input);

            // assert
            expect(result).to.exist;
            expect(result).to.deep.equal(expected);
        });
        it('should successfully deserialize an unnamed bbarray', () => {
            // arrange
            let input = '{"v":["1","2","3"]}';
            let expected = { v: ['1', '2', '3'] };

            // act
            let result = array.deserialize(input);

            // assert
            expect(result).to.exist;
            expect(result).to.deep.equal(expected);
        });
        it('should successfully ignore erroneous values', () => {
            // arrange
            let input = '{"v":["1","2","3"],"n":"test","a":123}';
            let expected = { v: ['1', '2', '3'], n: 'test' };

            // act
            let result = array.deserialize(input);

            // assert
            expect(result).to.exist;
            expect(result).to.deep.equal(expected);
        });
        it('should successfully deserialize a number array to strings', () => {
            // arrange
            let input = '{"v":[1,2,3]}';
            let expected = { v: ['1', '2', '3'] };

            // act
            let result = array.deserialize(input);

            // assert
            expect(result).to.exist;
            expect(result).to.deep.equal(expected);
        });
        it('should successfully deserialize a number spread', () => {
            // arrange
            let expected = { v: ['1', '2', '3', '4', '5'] };
            let cases = [
                '[1..5]',
                '[1..4,5]',
                '[1,2..5]',
                '[1,2..4,5]',
                '[1...5]',
                '[1...4,5]',
                '[1,2...5]',
                '[1,2...4,5]',
                '["1",2...4,"5"]'
            ];

            for (const entry of cases) {
                // act
                let result = array.deserialize(entry);

                // assert
                expect(result).to.exist;
                expect(result).to.deep.equal(expected);
            }
        });
        it('should never spread a string', () => {
            // arrange
            let cases = [
                { input: '[1,"2...4",5]', expected: { v: ['1', '2...4', '5'] } },
                { input: '[1,",2...4",5]', expected: { v: ['1', ',2...4', '5'] } },
                { input: '[1,"2...4,",5]', expected: { v: ['1', '2...4,', '5'] } },
                { input: '[1,",2...4,",5]', expected: { v: ['1', ',2...4,', '5'] } },
                { input: '[1,"[2...4",5]', expected: { v: ['1', '[2...4', '5'] } },
                { input: '[1,"2...4]",5]', expected: { v: ['1', '2...4]', '5'] } },
                { input: '[1,"[2...4]",5]', expected: { v: ['1', '[2...4]', '5'] } },
            ];

            for (const entry of cases) {
                // act
                let result = array.deserialize(entry.input);

                // assert
                expect(result).to.exist;
                expect(result).to.deep.equal(entry.expected);
            }
        });
    });
}