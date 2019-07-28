import { expect } from 'chai';
import convert from '../../../lib/bbtag/convert';
import { SubtagPrimitiveResult, SubtagResult, SubtagResultArray } from '../../../lib/bbtag/types';
import { array, error, toJSON } from './_helpers';

type Default<T> = T | ((value: SubtagResult) => T);

type TestCase<TResult, AllowDefault extends boolean = false> = AllowDefault extends true
    ? { input: SubtagResult, defaultValue?: Default<TResult>, kind: 'success', expected: TResult }
    | { input: SubtagResult, defaultValue?: Default<TResult>, kind: 'fail', expected: string }
    : { input: SubtagResult, kind: 'success', expected: TResult };

const toStringCases: Array<TestCase<string>> = [
    { kind: 'success', input: 'abc', expected: 'abc' },
    { kind: 'success', input: 12345, expected: '12345' },
    { kind: 'success', input: NaN, expected: 'NaN' },
    { kind: 'success', input: Infinity, expected: 'Infinity' },
    { kind: 'success', input: -Infinity, expected: '-Infinity' },
    { kind: 'success', input: true, expected: 'true' },
    { kind: 'success', input: false, expected: 'false' },
    { kind: 'success', input: undefined, expected: '' },
    { kind: 'success', input: null, expected: '' },
    { kind: 'success', input: array([1, 2, 3]), expected: '[1,2,3]' },
    { kind: 'success', input: array([1, 2, 3], 'xyz'), expected: '{"v":[1,2,3],"n":"xyz"}' },
    { kind: 'success', input: error('test'), expected: '`test`' },
    { kind: 'success', input: error('test', 'Hi!'), expected: 'Hi!' },
    { kind: 'success', input: error('test', 12345), expected: '12345' }
];

const toPrimitiveCases: Array<TestCase<SubtagPrimitiveResult>> = [
    { kind: 'success', input: 'abc', expected: 'abc' },
    { kind: 'success', input: error('test', 'Hi!'), expected: 'Hi!' },
    { kind: 'success', input: true, expected: true },
    { kind: 'success', input: false, expected: false },
    { kind: 'success', input: error('message', true), expected: true },
    { kind: 'success', input: error('message', false), expected: false },
    { kind: 'success', input: 0, expected: 0 },
    { kind: 'success', input: 1, expected: 1 },
    { kind: 'success', input: -1, expected: -1 },
    { kind: 'success', input: Infinity, expected: Infinity },
    { kind: 'success', input: -Infinity, expected: -Infinity },
    { kind: 'success', input: NaN, expected: NaN },
    { kind: 'success', input: 1234567890, expected: 1234567890 },
    { kind: 'success', input: 1.234, expected: 1.234 },
    { kind: 'success', input: Infinity, expected: Infinity },
    { kind: 'success', input: -1000, expected: -1000 },
    { kind: 'success', input: error('message', 12345), expected: 12345 },
    { kind: 'success', input: array([1, 2, 3]), expected: '[1,2,3]' },
    { kind: 'success', input: array([1, 2, 3], 'xyz'), expected: '{"v":[1,2,3],"n":"xyz"}' },
    { kind: 'success', input: error('test'), expected: '`test`' },
    { kind: 'success', input: error('test', array([1, 2, 3])), expected: '[1,2,3]' },
    { kind: 'success', input: error('test', array([1, 2, 3], 'name')), expected: '{"v":[1,2,3],"n":"name"}' }
];

const toBooleanCases: Array<TestCase<boolean, true>> = [
    { kind: 'success', input: 'true', expected: true },
    { kind: 'success', input: 'TruE', expected: true },
    { kind: 'success', input: 't', expected: true },
    { kind: 'success', input: 'yes', expected: true },
    { kind: 'success', input: 'y', expected: true },
    { kind: 'success', input: 'false', expected: false },
    { kind: 'success', input: 'FalSe', expected: false },
    { kind: 'success', input: 'f', expected: false },
    { kind: 'success', input: 'no', expected: false },
    { kind: 'success', input: 'n', expected: false },
    { kind: 'success', input: true, expected: true },
    { kind: 'success', input: false, expected: false },
    { kind: 'success', input: error('message', true), expected: true },
    { kind: 'success', input: error('message', false), expected: false },
    { kind: 'success', input: error('message', 'true'), expected: true },
    { kind: 'success', input: error('message', 'false'), expected: false },
    { kind: 'success', input: 1, defaultValue: true, expected: true },
    { kind: 'success', input: array([1, 2, 3]), defaultValue: true, expected: true },
    { kind: 'success', input: array([1, 2, 3], 'test'), defaultValue: true, expected: true },
    { kind: 'success', input: error('message'), defaultValue: true, expected: true },
    { kind: 'success', input: undefined, defaultValue: true, expected: true },
    { kind: 'success', input: null, defaultValue: true, expected: true },
    { kind: 'success', input: 1, defaultValue: () => true, expected: true },
    { kind: 'success', input: array([1, 2, 3]), defaultValue: () => true, expected: true },
    { kind: 'success', input: array([1, 2, 3], 'test'), defaultValue: () => true, expected: true },
    { kind: 'success', input: error('message'), defaultValue: () => true, expected: true },
    { kind: 'success', input: undefined, defaultValue: () => true, expected: true },
    { kind: 'success', input: null, defaultValue: () => true, expected: true },
    { kind: 'fail', input: error('message', 'test'), expected: 'test is not convertable to boolean' },
    { kind: 'fail', input: 1, expected: '1 is not convertable to boolean' },
    { kind: 'fail', input: array([1, 2, 3]), expected: '[1,2,3] is not convertable to boolean' },
    { kind: 'fail', input: array([1, 2, 3], 'test'), expected: '[1,2,3] is not convertable to boolean' },
    { kind: 'fail', input: error('message'), expected: '`message` is not convertable to boolean' },
    { kind: 'fail', input: error('message', 'error'), expected: 'error is not convertable to boolean' },
    { kind: 'fail', input: undefined, expected: 'undefined is not convertable to boolean' },
    { kind: 'fail', input: null, expected: 'null is not convertable to boolean' }
];

const toNumberCases: Array<TestCase<number, true>> = [
    { kind: 'success', input: '1', expected: 1 },
    { kind: 'success', input: '-1', expected: -1 },
    { kind: 'success', input: 'Infinity', expected: Infinity },
    { kind: 'success', input: '-Infinity', expected: -Infinity },
    { kind: 'success', input: 'NaN', expected: NaN },
    { kind: 'success', input: 'nan', expected: NaN },
    { kind: 'success', input: 'infinity', expected: Infinity },
    { kind: 'success', input: '-infinity', expected: -Infinity },
    { kind: 'success', input: '1234567890', expected: 1234567890 },
    { kind: 'success', input: '1.234', expected: 1.234 },
    { kind: 'success', input: '1234,890.123', expected: 1234890.123 },
    { kind: 'success', input: '000123', expected: 123 },
    { kind: 'success', input: 0, expected: 0 },
    { kind: 'success', input: 1, expected: 1 },
    { kind: 'success', input: Infinity, expected: Infinity },
    { kind: 'success', input: -1000, expected: -1000 },
    { kind: 'success', input: error('message', 12345), expected: 12345 },
    { kind: 'success', input: error('message', '12345'), expected: 12345 },
    { kind: 'success', input: true, defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: false, defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: array([1, 2, 3]), defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: array([1, 2, 3], 'test'), defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: error('message'), defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: undefined, defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: null, defaultValue: 987654321, expected: 987654321 },
    { kind: 'success', input: true, defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: false, defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: array([1, 2, 3]), defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: array([1, 2, 3], 'test'), defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: error('message'), defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: undefined, defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'success', input: null, defaultValue: () => 987654321, expected: 987654321 },
    { kind: 'fail', input: error('message', 'test'), expected: 'test is not convertable to number' },
    { kind: 'fail', input: true, expected: 'true is not convertable to number' },
    { kind: 'fail', input: false, expected: 'false is not convertable to number' },
    { kind: 'fail', input: array([1, 2, 3]), expected: '[1,2,3] is not convertable to number' },
    { kind: 'fail', input: array([1, 2, 3], 'test'), expected: '[1,2,3] is not convertable to number' },
    { kind: 'fail', input: error('message'), expected: '`message` is not convertable to number' },
    { kind: 'fail', input: error('message', 'error'), expected: 'error is not convertable to number' },
    { kind: 'fail', input: undefined, expected: 'undefined is not convertable to number' },
    { kind: 'fail', input: null, expected: 'null is not convertable to number' }
];

const toArrayCases: Array<TestCase<SubtagResultArray, true>> = [
    { kind: 'success', input: '[]', expected: array([]) },
    { kind: 'success', input: '[1,2,3]', expected: array([1, 2, 3]) },
    { kind: 'success', input: '[1,"2",null,true,false]', expected: array([1, '2', null, true, false]) },
    { kind: 'success', input: '{"v":[],"n":"xyz"}', expected: array([], 'xyz') },
    { kind: 'success', input: '{"v":[1,2,3],"n":"xyz"}', expected: array([1, 2, 3], 'xyz') },
    { kind: 'success', input: '{"v":[1,"2",null,true,false],"n":"xyz"}', expected: array([1, '2', null, true, false], 'xyz') },
    { kind: 'success', input: array([1, '2', undefined, null, true, false]), expected: array([1, '2', undefined, null, true, false]) },
    { kind: 'success', input: array([1, '2', undefined, null, true, false], 'xyz'), expected: array([1, '2', undefined, null, true, false], 'xyz') },
    { kind: 'success', input: error('test', [1, 2, 3]), expected: array([1, 2, 3]) },
    { kind: 'success', input: error('test', '[1,2,3]'), expected: array([1, 2, 3]) },
    { kind: 'success', input: 23456, defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: true, defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: false, defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: error('test'), defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: error('test', 'asdfgh'), defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: undefined, defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: null, defaultValue: [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: 23456, defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: true, defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: false, defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: error('test'), defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: error('test', 'asdfgh'), defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: undefined, defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'success', input: null, defaultValue: () => [1, 2, 3], expected: array([1, 2, 3]) },
    { kind: 'fail', input: '{"v":[],"n":12345}', expected: '"{"v\\":[],\\"n\\":12345}" is not convertable to array' },
    { kind: 'fail', input: 'aaaaaa', expected: '"aaaaaa" is not convertable to array' },
    { kind: 'fail', input: error('test', 12345), expected: '12345 is not convertable to array' },
    { kind: 'fail', input: 23456, expected: '23456 is not convertable to array' },
    { kind: 'fail', input: true, expected: 'true is not convertable to array' },
    { kind: 'fail', input: false, expected: 'false is not convertable to array' },
    { kind: 'fail', input: error('test'), expected: '`test` is not convertable to array' },
    { kind: 'fail', input: error('test', 'asdfgh'), expected: 'asdfgh is not convertable to array' },
    { kind: 'fail', input: undefined, expected: 'undefined is not convertable to array' },
    { kind: 'fail', input: null, expected: 'null is not convertable to array' }
];

function successfully({ input, defaultValue, expected }: {
    input: SubtagResult,
    defaultValue?: Default<any>,
    kind: 'success'
    expected: any
}): string {
    return `should successfully convert ${toJSON(input)} to ${toJSON(expected)}${defaultValue !== undefined ? ' when given a default value' : ''}`;
}

function failTo({ input }: { input: SubtagResult, kind: 'fail' }, type: string): string {
    return `should fail to convert ${toJSON(input)} to ${type}`;
}

export default () => describe('const convert', () => {
    describe('function toString', () => {
        for (const testCase of toStringCases) {
            it(successfully(testCase), () => {
                // arrange

                // act
                const result = convert.toString(testCase.input);

                // assert
                expect(result).to.equal(testCase.expected);
            });
        }
    });

    describe('function toPrimitive', () => {
        for (const testCase of toPrimitiveCases) {
            it(successfully(testCase), () => {
                // arrange

                // act
                const result = convert.toPrimitive(testCase.input);

                // assert
                if (typeof testCase.expected === 'number' && isNaN(testCase.expected)) {
                    expect(result).to.be.NaN;
                } else {
                    expect(result).to.equal(testCase.expected);
                }
            });
        }
    });

    describe('function toBoolean', () => {
        for (const testCase of toBooleanCases) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.toBoolean(testCase.input, testCase.defaultValue);

                        // assert
                        expect(result).to.equal(testCase.expected);
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'boolean'), () => {
                        // arrange

                        // act
                        const test = () => convert.toBoolean(testCase.input);

                        // assert
                        expect(test).to.throw(testCase.expected);

                    });
                    break;
            }
        }
    });

    describe('function tryToBoolean', () => {
        for (const testCase of toBooleanCases.filter(c => c.defaultValue === undefined)) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.tryToBoolean(testCase.input);

                        // assert
                        expect(result.success).to.be.true;
                        if (result.success) {
                            expect(result.value).to.equal(testCase.expected);
                        }
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'boolean'), () => {
                        // arrange

                        // act
                        const result = convert.tryToBoolean(testCase.input);

                        // assert
                        expect(result.success).to.be.false;
                    });
            }
        }
    });

    describe('function toNumber', () => {
        for (const testCase of toNumberCases) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.toNumber(testCase.input, testCase.defaultValue);

                        // assert
                        if (isNaN(testCase.expected)) {
                            expect(result).to.be.NaN;
                        } else {
                            expect(result).to.equal(testCase.expected);
                        }
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'number'), () => {
                        // arrange

                        // act
                        const test = () => convert.toNumber(testCase.input);

                        // assert
                        expect(test).to.throw(testCase.expected);

                    });
                    break;
            }
        }
    });

    describe('function tryToNumber', () => {
        for (const testCase of toNumberCases.filter(c => c.defaultValue === undefined)) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.tryToNumber(testCase.input);

                        // assert
                        expect(result.success).to.be.true;
                        if (result.success) {
                            if (isNaN(testCase.expected)) {
                                expect(result.value).to.be.NaN;
                            } else {
                                expect(result.value).to.equal(testCase.expected);
                            }
                        }
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'number'), () => {
                        // arrange

                        // act
                        const result = convert.tryToNumber(testCase.input);

                        // assert
                        expect(result.success).to.be.false;
                    });
            }
        }
    });

    describe('function toArray', () => {
        for (const testCase of toArrayCases) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.toArray(testCase.input, testCase.defaultValue);

                        // assert
                        expect(result).to.have.ordered.members(testCase.expected);
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'array'), () => {
                        // arrange

                        // act
                        const test = () => convert.toArray(testCase.input);

                        // assert
                        expect(test).to.throw(testCase.expected);

                    });
                    break;
            }
        }
    });

    describe('function tryToArray', () => {
        for (const testCase of toArrayCases.filter(c => c.defaultValue === undefined)) {
            switch (testCase.kind) {
                case 'success':
                    it(successfully(testCase), () => {
                        // arrange

                        // act
                        const result = convert.tryToArray(testCase.input);

                        // assert
                        expect(result.success).to.be.true;
                        if (result.success) {
                            expect(result.value).to.have.ordered.members(testCase.expected);
                        }
                    });
                    break;
                case 'fail':
                    it(failTo(testCase, 'array'), () => {
                        // arrange

                        // act
                        const result = convert.tryToArray(testCase.input);

                        // assert
                        expect(result.success).to.be.false;
                    });
            }
        }
    });

    describe('function toCollection', () => {
        type MethodTest = [SubtagResult[], SubtagResult[]];
        const tests: Array<{ input: SubtagResult, start?: MethodTest, end?: MethodTest, include?: MethodTest }> = [
            {
                input: '[1,2,3,4]',
                start: [[1, error('msg', 1)], [2, '1', true, false, undefined, error('msg', 2)]],
                end: [[4, error('msg', 4)], [3, '4', true, false, undefined, error('msg', 3)]],
                include: [[1, 2, 3, 4, error('msg', 3)], ['4', true, false, undefined, error('msg')]]
            },
            {
                input: array([1, 2, 3, 4]),
                start: [[1, error('msg', 1)], [2, '1', true, false, undefined, error('msg', 2)]],
                end: [[4, error('msg', 4)], [3, '4', true, false, undefined, error('msg', 3)]],
                include: [[1, 2, 3, 4, error('msg', 3)], ['4', true, false, undefined, error('msg')]]
            },
            {
                input: 'this is just a simple test',
                start: [['t', 'this is', error('msg', 'this')], [1, 'z', true, false, undefined, error('msg', 2)]],
                end: [['t', 'simple test', error('msg', 'test')], [1, 'z', true, false, undefined, error('msg', 2)]],
                include: [['is', 'this', 'test', 'this is just a simple test'], ['4', true, false, undefined, error('msg')]]
            }
        ];

        for (const { input, start, end, include } of tests) {
            it(`should correctly convert ${toJSON(input)} to a collection`, () => {
                // arrange

                // act
                const result = convert.toCollection(input);

                // assert
                function message(v: SubtagResult, r: boolean): string {
                    return `${toJSON(input)} startswith ${toJSON(v)} should give ${r}`;
                }
                if (start) {
                    for (const value of start[0]) { expect(result.startsWith(value), message(value, true)).to.be.true; }
                    for (const value of start[1]) { expect(result.startsWith(value), message(value, false)).to.be.false; }
                }
                if (end) {
                    for (const value of end[0]) { expect(result.endsWith(value), message(value, true)).to.be.true; }
                    for (const value of end[1]) { expect(result.endsWith(value), message(value, false)).to.be.false; }
                }
                if (include) {
                    for (const value of include[0]) { expect(result.includes(value), message(value, true)).to.be.true; }
                    for (const value of include[1]) { expect(result.includes(value), message(value, false)).to.be.false; }
                }
            });
        }
    });
});