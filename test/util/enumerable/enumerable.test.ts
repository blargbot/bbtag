import { Enumerable } from '../../../src/util/enumerable';
import { expect } from 'chai';
import { predicate } from '../../../src/util/enumerable/types';

function compare<T>(actual: Enumerable<T>, expected: T[]) {
    let enumerator = actual.getEnumerator();
    let iterable = actual.toIterable();

    expect([...iterable]).to.deep.eq(expected);
    expect(enumerator.current).to.be.undefined;
    for (let i = 0; i < expected.length; i++) {
        expect(enumerator.moveNext()).to.be.true;
        expect(enumerator.current).to.deep.eq(expected[i]);
    }
    expect(enumerator.moveNext()).to.be.false;
    expect(enumerator.current).to.be.undefined;
}

describe('Enumerable', function () {
    describe('instance', function () {
        describe('#select', function () {
            let testCases: Array<{ input: any[], selector: (element: any, index: number) => any, expected: any[] }> = [
                { input: [1, 2, 3, 4, 5], selector: (e, i) => e + i, expected: [1, 3, 5, 7, 9] },
                { input: [1, 2, 3, 4, 5], selector: (e, i) => 0, expected: [0, 0, 0, 0, 0] },
                { input: [], selector: (e, i) => { throw 1; }, expected: [] },
                { input: [5, 4, 3, 2, 1], selector: (e, i) => i, expected: [0, 1, 2, 3, 4] }
            ];

            for (const testCase of testCases) {
                it(`should select ${testCase.selector} from [${testCase.input}]`, function () {
                    // arrange
                    let input = Enumerable.from(testCase.input);

                    // act
                    let result = input.select(testCase.selector);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
        describe('#selectMany', function () {
            let testCases: Array<{ input: any[], selector: (element: any, index: number) => any[], expected: any[] }> = [
                { input: [1, 2, 3, 4, 5], selector: (e, i) => [e, i], expected: [1, 0, 2, 1, 3, 2, 4, 3, 5, 4] },
                { input: [0, 0, 1, 2, 0], selector: (e, i) => [...new Array(e)].map(() => i), expected: [2, 3, 3] },
            ];

            for (const testCase of testCases) {
                it(`should select ${testCase.selector} from [${testCase.input}]`, function () {
                    // arrange
                    let input = Enumerable.from(testCase.input);

                    // act
                    let result = input.selectMany(testCase.selector);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
        describe('#except', function () {
            let testCases = [
                { left: [1, 2, 3, 4, 5], right: [], expected: [1, 2, 3, 4, 5] },
                { left: [1, 2, 3, 4, 5], right: [1, 2, 3, 4, 5], expected: [] },
                { left: [1, 2, 3, 4, 5], right: [1, 3, 5, 7], expected: [2, 4] },
            ];

            for (const testCase of testCases) {
                it(`should correctly get [${testCase.left}] except [${testCase.right}]`, function () {
                    // arrange
                    let source = Enumerable.from(testCase.left);

                    // act
                    let result = source.except(testCase.right);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
        describe('#skip', function () {
            let testCases: Array<{ source: any[], condition: predicate<any> | number, expected: any[] }> = [
                { source: [1, 2, 3, 4, 5], condition: 0, expected: [1, 2, 3, 4, 5] },
                { source: [1, 2, 3, 4, 5], condition: 1, expected: [2, 3, 4, 5] },
                { source: [1, 2, 3, 4, 5], condition: 4, expected: [5] },
                { source: [1, 2, 3, 4, 5], condition: 5, expected: [] },
                { source: [1, 2, 3, 4, 5], condition: (e) => !!(e % 3 > 0), expected: [3, 4, 5] },
            ];

            for (const testCase of testCases) {
                let methodName = typeof testCase.condition === 'number' ? 'skip' : 'skip while';
                it(`should ${methodName} ${testCase.condition} on [${testCase.source}]`, function () {
                    // arrange
                    let source = Enumerable.from(testCase.source);

                    // act
                    let result = source.skip(<any>testCase.condition);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
        describe('#take', function () {
            let testCases: Array<{ source: any[], condition: predicate<any> | number, expected: any[] }> = [
                { source: [1, 2, 3, 4, 5], condition: 0, expected: [] },
                { source: [1, 2, 3, 4, 5], condition: 1, expected: [1] },
                { source: [1, 2, 3, 4, 5], condition: 4, expected: [1, 2, 3, 4] },
                { source: [1, 2, 3, 4, 5], condition: 5, expected: [1, 2, 3, 4, 5] },
                { source: [1, 2, 3, 4, 5], condition: (e) => !!(e % 3 > 0), expected: [1, 2] },
            ];

            for (const testCase of testCases) {
                let methodName = typeof testCase.condition === 'number' ? 'take' : 'take while';
                it(`should ${methodName} ${testCase.condition} on [${testCase.source}]`, function () {
                    // arrange
                    let source = Enumerable.from(testCase.source);

                    // act
                    let result = source.take(<any>testCase.condition);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
    });
    describe('static', function () {
        describe('#empty', function () {
            it('should return an enumerable with no values', function () {
                // arrange

                // act
                let result = Enumerable.empty<number>();

                // assert
                compare(result, []);
            });
        });
        describe('#range', function () {
            let testCases = [
                { start: 0, count: 0, step: 0, expected: [] },
                { start: 0, count: 1, step: 0, expected: [0] },
                { start: 0, count: -1, step: 0, expected: [] },
                { start: 0, count: 5, step: 0, expected: [0, 0, 0, 0, 0] },
                { start: 0, count: 5, step: 1, expected: [0, 1, 2, 3, 4] },
                { start: 0, count: 5, step: 3, expected: [0, 3, 6, 9, 12] },
                { start: 5, count: 5, step: 5, expected: [5, 10, 15, 20, 25] },
            ];

            for (let testCase of testCases) {
                it(`should correctly start from ${testCase.start} and perform ${testCase.count} steps of size ${testCase.step}`, function () {
                    // arrange

                    // act
                    let result = Enumerable.range(testCase.start, testCase.count, testCase.step);

                    // assert
                    compare(result, testCase.expected);
                })
            }
        });
        describe('#infinite', function () {
            let testCases = [
                { start: 0, step: 0 },
                { start: 0, step: 1 },
                { start: 5, step: 0 },
                { start: 5, step: 5 }
            ];

            for (let testCase of testCases) {
                it(`should never end when starting at ${testCase.start} with steps of size ${testCase.step}`, function () {
                    // arrange

                    // act
                    let result = Enumerable.infinite(testCase.start, testCase.step);
                    let enumerator = result.getEnumerator();

                    // assert
                    for (let i = 0; i < 10000; i++) {
                        expect(enumerator.moveNext()).to.be.true;
                        expect(enumerator.current).to.be.be.equal(testCase.start + testCase.step * i);
                    }
                });
            }
        });
    });
});