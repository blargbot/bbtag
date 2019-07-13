// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { Enumerable, predicateFunc } from '../../src/util';

function compare<T>(actual: Enumerable<T>, expected: T[]): void {
    const enumerator = actual.getEnumerator();

    expect([...actual]).to.deep.eq(expected);
    expect(enumerator.current).to.be.undefined;
    for (const expectation of expected) {
        expect(enumerator.moveNext()).to.be.true;
        expect(enumerator.current).to.deep.eq(expectation);
    }
    expect(enumerator.moveNext()).to.be.false;
    expect(enumerator.current).to.be.undefined;
}

describe('class Enumerable', () => {
    describe('function select', () => {
        const testCases: Array<{ input: any[], selector: (element: any, index: number) => any, expected: any[] }> = [
            { input: [1, 2, 3, 4, 5], selector: (e, i) => e + i, expected: [1, 3, 5, 7, 9] },
            { input: [1, 2, 3, 4, 5], selector: () => 0, expected: [0, 0, 0, 0, 0] },
            { input: [], selector: () => { throw 1; }, expected: [] },
            { input: [5, 4, 3, 2, 1], selector: (_, i) => i, expected: [0, 1, 2, 3, 4] }
        ];

        for (const testCase of testCases) {
            it(`should select ${testCase.selector} from [${testCase.input}]`, () => {
                // arrange
                const input = Enumerable.from(testCase.input);

                // act
                const result = input.select(testCase.selector);

                // assert
                compare(result, testCase.expected);
            });
        }
    });
    describe('function selectMany', () => {
        const testCases: Array<{ input: any[], selector: (element: any, index: number) => any[], expected: any[] }> = [
            { input: [1, 2, 3, 4, 5], selector: (e, i) => [e, i], expected: [1, 0, 2, 1, 3, 2, 4, 3, 5, 4] },
            { input: [0, 0, 1, 2, 0], selector: (e, i) => [...new Array(e)].map(() => i), expected: [2, 3, 3] }
        ];

        for (const testCase of testCases) {
            it(`should select ${testCase.selector} from [${testCase.input}]`, () => {
                // arrange
                const input = Enumerable.from(testCase.input);

                // act
                const result = input.selectMany(testCase.selector);

                // assert
                compare(result, testCase.expected);
            });
        }
    });
    describe('function except', () => {
        const testCases = [
            { left: [1, 2, 3, 4, 5], right: [], expected: [1, 2, 3, 4, 5] },
            { left: [1, 2, 3, 4, 5], right: [1, 2, 3, 4, 5], expected: [] },
            { left: [1, 2, 3, 4, 5], right: [1, 3, 5, 7], expected: [2, 4] }
        ];

        for (const testCase of testCases) {
            it(`should correctly get [${testCase.left}] except [${testCase.right}]`, () => {
                // arrange
                const source = Enumerable.from(testCase.left);

                // act
                const result = source.except(testCase.right);

                // assert
                compare(result, testCase.expected);
            });
        }
    });
    describe('function skip', () => {
        const testCases: Array<{ source: any[], condition: predicateFunc<any> | number, expected: any[] }> = [
            { source: [1, 2, 3, 4, 5], condition: 0, expected: [1, 2, 3, 4, 5] },
            { source: [1, 2, 3, 4, 5], condition: 1, expected: [2, 3, 4, 5] },
            { source: [1, 2, 3, 4, 5], condition: 4, expected: [5] },
            { source: [1, 2, 3, 4, 5], condition: 5, expected: [] },
            { source: [1, 2, 3, 4, 5], condition: (e) => !!(e % 3 > 0), expected: [3, 4, 5] }
        ];

        for (const testCase of testCases) {
            const methodName = typeof testCase.condition === 'number' ? 'skip' : 'skip while';
            it(`should ${methodName} ${testCase.condition} on [${testCase.source}]`, () => {
                // arrange
                const source = Enumerable.from(testCase.source);

                // act
                const result = source.skip(testCase.condition as any);

                // assert
                compare(result, testCase.expected);
            });
        }
    });
    describe('function take', () => {
        const testCases: Array<{ source: any[], condition: predicateFunc<any> | number, expected: any[] }> = [
            { source: [1, 2, 3, 4, 5], condition: 0, expected: [] },
            { source: [1, 2, 3, 4, 5], condition: 1, expected: [1] },
            { source: [1, 2, 3, 4, 5], condition: 4, expected: [1, 2, 3, 4] },
            { source: [1, 2, 3, 4, 5], condition: 5, expected: [1, 2, 3, 4, 5] },
            { source: [1, 2, 3, 4, 5], condition: (e) => !!(e % 3 > 0), expected: [1, 2] }
        ];

        for (const testCase of testCases) {
            const methodName = typeof testCase.condition === 'number' ? 'take' : 'take while';
            it(`should ${methodName} ${testCase.condition} on [${testCase.source}]`, () => {
                // arrange
                const source = Enumerable.from(testCase.source);

                // act
                const result = source.take(testCase.condition as any);

                // assert
                compare(result, testCase.expected);
            });
        }
    });
    describe('static', () => {
        describe('function empty', () => {
            it('should return an enumerable with no values', () => {
                // arrange

                // act
                const result = Enumerable.empty<number>();

                // assert
                compare(result, []);
            });
        });
        describe('function range', () => {
            const testCases = [
                { start: 0, count: 0, step: 0, expected: [] },
                { start: 0, count: 1, step: 0, expected: [0] },
                { start: 0, count: -1, step: 0, expected: [] },
                { start: 0, count: 5, step: 0, expected: [0, 0, 0, 0, 0] },
                { start: 0, count: 5, step: 1, expected: [0, 1, 2, 3, 4] },
                { start: 0, count: 5, step: 3, expected: [0, 3, 6, 9, 12] },
                { start: 5, count: 5, step: 5, expected: [5, 10, 15, 20, 25] }
            ];

            for (const testCase of testCases) {
                it(`should correctly start from ${testCase.start} and perform ${testCase.count} steps of size ${testCase.step}`, () => {
                    // arrange

                    // act
                    const result = Enumerable.range(testCase.start, testCase.count, testCase.step);

                    // assert
                    compare(result, testCase.expected);
                });
            }
        });
        describe('function infinite', () => {
            const testCases = [
                { start: 0, step: 0 },
                { start: 0, step: 1 },
                { start: 5, step: 0 },
                { start: 5, step: 5 }
            ];

            for (const testCase of testCases) {
                it(`should never end when starting at ${testCase.start} with steps of size ${testCase.step}`, () => {
                    // arrange

                    // act
                    const result = Enumerable.infinite(testCase.start, testCase.step);
                    const enumerator = result.getEnumerator();

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