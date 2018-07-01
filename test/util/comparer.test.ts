import { expect } from 'chai';
import { Comparer } from '../../dist/util';
import * as moment from 'moment-timezone';

export function test() {
    describe('#compare()', () => {
        it('should compare correctly', () => {
            // arrange
            let cases = [
                { a: 'This is a test', b: 'This is a test', e: 0 },
                { a: 'This is a test', b: 'This is b test', e: -1 },
                { a: 'This is b test', b: 'This is a test', e: 1 },
                { a: 'M', b: 'm', e: 1 },
                { a: 'M', b: 'l', e: 1 },
                { a: 'M', b: 'n', e: -1 },
                { a: 'M', b: 'L', e: 1 },
                { a: 'M', b: 'N', e: -1 },
                { a: '1', b: '1', e: 0 },
                { a: '1', b: '2', e: -1 },
                { a: '9', b: '10', e: -1 },
                { a: '1', b: '1.0', e: 0 },
                { a: '1', b: '1.00001', e: -1 },
                { a: '9.999999', b: '10', e: -1 },
                { a: '1e10', b: '1e10', e: 0 },
                { a: '1e10', b: '1e11', e: -1 },
                { a: '1e10', b: '1e9', e: 1 },
                { a: '1test', b: '1test', e: 0 },
                { a: '1test', b: 'testing', e: -1 },
                { a: '10testing', b: '10test', e: 1 },
                { a: 'NaN', b: '10', e: 1 }, // NaN always after normal numbers
                { a: 'NaN', b: 'Test', e: -1 }, // NaN is still a number, so always before strings
                { a: 'Infinity', b: String(Number.MAX_SAFE_INTEGER), e: 1 },
                { a: '-Infinity', b: String(-Number.MAX_SAFE_INTEGER), e: -1 },
                { a: 'Infinity', b: 'NaN', e: -1 },
                { a: '-Infinity', b: 'NaN', e: -1 },
                { a: 'NaN', b: 'NaN', e: 0 },
            ] as Array<{ a: string, b: string, e: number }>;

            for (const entry of cases) {
                // act
                let result = Comparer.Default.compare(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' compared to '${entry.b}' should be ${entry.e} but was ${result}`);
            }
        });
        it('should handle 100,000 comparisons per second', () => {
            // arrange
            let compare = [
                'Some really long string which can contain numbers like 10, 0.3 and 1e32',
                'Some really long string which can contain numbers like 10, 0.3 and 1e33'
            ];

            // act
            let start = moment();
            for (let i = 0; i < 100000; i++) {
                Comparer.Default.compare(compare[0], compare[1]);
            }
            let end = moment().diff(start);

            // assert
            expect(end).to.be.lessThan(1000);
        });
    });
    describe('#startswith()', () => {
        it('should successfully handle strings', () => {
            // arrange
            let cases = [
                { a: 'This is a test', b: 'This', e: true },
                { a: 'This is a test', b: 'This ', e: true },
                { a: 'This is a test', b: 'Thus', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.startsWith(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should start with '${entry.b}'`);
            }
        });
        it('should successfully handle strings like arrays', () => {
            // arrange
            let cases = [
                { a: '["This","is","a","test"]', b: 'This', e: true },
                { a: '["This","is","a","test"]', b: 'This ', e: false },
                { a: '["This","is","a","test"]', b: 'Thus', e: false },
                { a: '["This","is","a","test"]', b: '"This"', e: false },
                { a: '["This","is","a","test"]', b: '[', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.startsWith(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should start with '${entry.b}'`);
            }
        });
    });
    describe('#endswith()', () => {
        it('should successfully handle strings', () => {
            // arrange
            let cases = [
                { a: 'This is a test', b: 'test', e: true },
                { a: 'This is a test', b: ' test', e: true },
                { a: 'This is a test', b: 'tast', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.endsWith(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should end with '${entry.b}'`);
            }
        });
        it('should successfully handle strings like arrays', () => {
            // arrange
            let cases = [
                { a: '["This","is","a","test"]', b: 'test', e: true },
                { a: '["This","is","a","test"]', b: 'test ', e: false },
                { a: '["This","is","a","test"]', b: ' test', e: false },
                { a: '["This","is","a","test"]', b: '"test"', e: false },
                { a: '["This","is","a","test"]', b: ']', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.endsWith(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should end with '${entry.b}'`);
            }
        });
    });
    describe('#includes()', () => {
        it('should successfully handle strings', () => {
            // arrange
            let cases = [
                { a: 'This is a test', b: 'is', e: true },
                { a: 'This is a test', b: ' is', e: true },
                { a: 'This is a test', b: 'is ', e: true },
                { a: 'This is a test', b: 'it', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.includes(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should include '${entry.b}'`);
            }
        });
        it('should successfully handle strings like arrays', () => {
            // arrange
            let cases = [
                { a: '["This","is","a","test"]', b: 'is', e: true },
                { a: '["This","is","a","test"]', b: 'is ', e: false },
                { a: '["This","is","a","test"]', b: ' is', e: false },
                { a: '["This","is","a","test"]', b: '"is"', e: false },
                { a: '["This","is","a","test"]', b: ',', e: false }
            ];

            for (const entry of cases) {
                // act
                let result = Comparer.Default.includes(entry.a, entry.b);

                // assert
                expect(result).to.equal(entry.e, `'${entry.a}' should include '${entry.b}'`);
            }
        });
    });
}