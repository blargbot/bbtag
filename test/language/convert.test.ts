// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SubtagResultType } from '../../src/language';
import { arr, ctx, err, str, tag } from '../testHelpers/subtag';

type Default<T> = T | ((value: SubtagResult) => T);

type TestCase<TResult, AllowDefault extends boolean = false> = AllowDefault extends true
    ? { input: SubtagResult, defaultValue?: Default<TResult>, expected: string | TResult }
    : { input: SubtagResult, expected: string | TResult };

function toName(value: SubtagResult): string {
    return typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
        ? `[${'format' in value.token ? 'STR' : 'SUB'} ERROR '${value.message}']` : JSON.stringify(value);
}

describe('module convert', () => {
    describe('function toString', () => {
        const tests: Array<TestCase<string>> = [
            { input: 'abc', expected: 'abc' },
            { input: 12345, expected: '12345' },
            { input: NaN, expected: 'NaN' },
            { input: Infinity, expected: 'Infinity' },
            { input: -Infinity, expected: '-Infinity' },
            { input: true, expected: 'true' },
            { input: false, expected: 'false' },
            { input: undefined, expected: '' },
            { input: null, expected: '' },
            { input: arr([1, 2, 3]), expected: '[1,2,3]' },
            { input: arr([1, 2, 3], 'xyz'), expected: '{"v":[1,2,3],"n":"xyz"}' },
            { input: err('test', str('abc'), ctx()), expected: '`test`' },
            { input: err('test', str('abc'), ctx(x => x.fallback = 'Hi!')), expected: 'Hi!' }
        ];

        for (const { input, expected } of tests) {
            it(`should successfully convert ${toName(input)} to '${expected}'`, () => {
                // arrange

                // act
                const result = bbtag.toString(input);

                // assert
                expect(result).to.equal(expected);
            });
        }
    });

    describe('function toBoolean', () => {
        const tests: Array<TestCase<boolean, true>> = [
            { input: 'true', expected: true },
            { input: 'TruE', expected: true },
            { input: 't', expected: true },
            { input: 'yes', expected: true },
            { input: 'y', expected: true },
            { input: 'false', expected: false },
            { input: 'FalSe', expected: false },
            { input: 'f', expected: false },
            { input: 'no', expected: false },
            { input: 'n', expected: false },
            { input: true, expected: true },
            { input: false, expected: false },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'true')), expected: true },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'false')), expected: false },
            { input: 1, expected: '1 is not convertable to boolean' },
            { input: arr([1, 2, 3]), expected: '[1,2,3] is not convertable to boolean' },
            { input: arr([1, 2, 3], 'test'), expected: '[1,2,3] is not convertable to boolean' },
            { input: err('message', str('abc'), ctx()), expected: '`message` is not convertable to boolean' },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'error')), expected: 'error is not convertable to boolean' },
            { input: undefined, expected: 'undefined is not convertable to boolean' },
            { input: null, expected: 'null is not convertable to boolean' },
            { input: 1, defaultValue: true, expected: true },
            { input: arr([1, 2, 3]), defaultValue: true, expected: true },
            { input: arr([1, 2, 3], 'test'), defaultValue: true, expected: true },
            { input: err('message', str('abc'), ctx()), defaultValue: true, expected: true },
            { input: undefined, defaultValue: true, expected: true },
            { input: null, defaultValue: true, expected: true },
            { input: 1, defaultValue: () => true, expected: true },
            { input: arr([1, 2, 3]), defaultValue: () => true, expected: true },
            { input: arr([1, 2, 3], 'test'), defaultValue: () => true, expected: true },
            { input: err('message', str('abc'), ctx()), defaultValue: () => true, expected: true },
            { input: undefined, defaultValue: () => true, expected: true },
            { input: null, defaultValue: () => true, expected: true }
        ];

        for (const { input, defaultValue, expected } of tests) {
            if (typeof expected === 'boolean') {
                it(`should successfully convert ${toName(input)} to ${expected}${defaultValue !== undefined ? ' when given a default value' : ''}`, () => {
                    // arrange

                    // act
                    const result = bbtag.toBoolean(input, defaultValue);

                    // assert
                    expect(result).to.equal(expected);
                });
            } else {
                it(`should fail to convert ${toName(input)} to boolean`, () => {
                    // arrange

                    // act
                    const test = () => bbtag.toBoolean(input);

                    // assert
                    expect(test).to.throw(expected);

                });
            }
        }
    });

    describe('function tryToboolean', () => {
        const tests: Array<TestCase<boolean | undefined>> = [
            { input: 'true', expected: true },
            { input: 'TruE', expected: true },
            { input: 't', expected: true },
            { input: 'yes', expected: true },
            { input: 'y', expected: true },
            { input: 'false', expected: false },
            { input: 'FalSe', expected: false },
            { input: 'f', expected: false },
            { input: 'no', expected: false },
            { input: 'n', expected: false },
            { input: true, expected: true },
            { input: false, expected: false },
            { input: 1, expected: undefined },
            { input: arr([1, 2, 3]), expected: undefined },
            { input: arr([1, 2, 3], 'test'), expected: undefined },
            { input: err('message', str('abc'), ctx()), expected: undefined },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'true')), expected: true },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'false')), expected: false },
            { input: undefined, expected: undefined },
            { input: null, expected: undefined }
        ];

        for (const { input, expected } of tests) {
            if (typeof expected === 'boolean') {
                it(`should successfully convert ${toName(input)} to ${expected}`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToBoolean(input);

                    // assert
                    expect(result.success).to.be.true;
                    if (result.success) {
                        expect(result.value).to.equal(expected);
                    }
                });
            } else {
                it(`should fail to convert ${toName(input)} to boolean`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToBoolean(input);

                    // assert
                    expect(result.success).to.be.false;
                });
            }
        }
    });

    describe('function toNumber', () => {
        const tests: Array<TestCase<number, true>> = [
            { input: '1', expected: 1 },
            { input: '-1', expected: -1 },
            { input: 'Infinity', expected: Infinity },
            { input: '-Infinity', expected: -Infinity },
            { input: 'NaN', expected: NaN },
            { input: 'nan', expected: NaN },
            { input: 'infinity', expected: Infinity },
            { input: '1234567890', expected: 1234567890 },
            { input: '1.234', expected: 1.234 },
            { input: '1234,890.123', expected: 1234890.123 },
            { input: '000123', expected: 123 },
            { input: 0, expected: 0 },
            { input: 1, expected: 1 },
            { input: Infinity, expected: Infinity },
            { input: -1000, expected: -1000 },
            { input: err('message', str('abc'), ctx(x => x.fallback = '12345')), expected: 12345 },
            { input: true, expected: 'true is not convertable to number' },
            { input: false, expected: 'false is not convertable to number' },
            { input: arr([1, 2, 3]), expected: '[1,2,3] is not convertable to number' },
            { input: arr([1, 2, 3], 'test'), expected: '[1,2,3] is not convertable to number' },
            { input: err('message', str('abc'), ctx()), expected: '`message` is not convertable to number' },
            { input: err('message', str('abc'), ctx(x => x.fallback = 'error')), expected: 'error is not convertable to number' },
            { input: undefined, expected: 'undefined is not convertable to number' },
            { input: null, expected: 'null is not convertable to number' },
            { input: true, defaultValue: 987654321, expected: 987654321 },
            { input: false, defaultValue: 987654321, expected: 987654321 },
            { input: arr([1, 2, 3]), defaultValue: 987654321, expected: 987654321 },
            { input: arr([1, 2, 3], 'test'), defaultValue: 987654321, expected: 987654321 },
            { input: err('message', str('abc'), ctx()), defaultValue: 987654321, expected: 987654321 },
            { input: undefined, defaultValue: 987654321, expected: 987654321 },
            { input: null, defaultValue: 987654321, expected: 987654321 },
            { input: true, defaultValue: () => 987654321, expected: 987654321 },
            { input: false, defaultValue: () => 987654321, expected: 987654321 },
            { input: arr([1, 2, 3]), defaultValue: () => 987654321, expected: 987654321 },
            { input: arr([1, 2, 3], 'test'), defaultValue: () => 987654321, expected: 987654321 },
            { input: err('message', str('abc'), ctx()), defaultValue: () => 987654321, expected: 987654321 },
            { input: undefined, defaultValue: () => 987654321, expected: 987654321 },
            { input: null, defaultValue: () => 987654321, expected: 987654321 }
        ];

        for (const { input, defaultValue, expected } of tests) {
            if (typeof expected === 'number') {
                it(`should successfully convert ${toName(input)} to ${expected}${defaultValue !== undefined ? ' when given a default value' : ''}`, () => {
                    // arrange

                    // act
                    const result = bbtag.toNumber(input, defaultValue);

                    // assert
                    if (isNaN(expected)) {
                        expect(result).to.be.NaN;
                    } else {
                        expect(result).to.equal(expected);
                    }
                });
            } else {
                it(`should fail to convert ${toName(input)} to number`, () => {
                    // arrange

                    // act
                    const test = () => bbtag.toNumber(input);

                    // assert
                    expect(test).to.throw(expected);

                });
            }
        }
    });

    describe('function tryToNumber', () => {
        const tests: Array<TestCase<number | undefined>> = [
            { input: '1', expected: 1 },
            { input: '-1', expected: -1 },
            { input: 'Infinity', expected: Infinity },
            { input: '-Infinity', expected: -Infinity },
            { input: 'NaN', expected: NaN },
            { input: 'nan', expected: NaN },
            { input: 'infinity', expected: Infinity },
            { input: '1234567890', expected: 1234567890 },
            { input: '1.234', expected: 1.234 },
            { input: '1234,890.123', expected: 1234890.123 },
            { input: '000123', expected: 123 },
            { input: 0, expected: 0 },
            { input: 1, expected: 1 },
            { input: Infinity, expected: Infinity },
            { input: -1000, expected: -1000 },
            { input: err('message', str('abc'), ctx(x => x.fallback = '12345')), expected: 12345 },
            { input: true, expected: undefined },
            { input: false, expected: undefined },
            { input: arr([1, 2, 3]), expected: undefined },
            { input: arr([1, 2, 3], 'test'), expected: undefined },
            { input: err('message', str('abc'), ctx()), expected: undefined },
            { input: undefined, expected: undefined },
            { input: null, expected: undefined }
        ];

        for (const { input, expected } of tests) {
            if (typeof expected === 'number') {
                it(`should successfully convert ${toName(input)} to ${expected}`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToNumber(input);

                    // assert
                    expect(result.success).to.be.true;
                    if (result.success) {
                        if (isNaN(expected)) {
                            expect(result.value).to.be.NaN;
                        } else {
                            expect(result.value).to.equal(expected);
                        }
                    }
                });
            } else {
                it(`should fail to convert ${toName(input)} to number`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToNumber(input);

                    // assert
                    expect(result.success).to.be.false;
                });
            }
        }
    });

    describe('function toArray', () => {
        const tests: Array<TestCase<SubtagResultArray, true>> = [
            { input: '[]', expected: arr([]) },
            { input: '[1,2,3]', expected: arr([1, 2, 3]) },
            { input: '[1,"2",null,true,false]', expected: arr([1, '2', null, true, false]) },
            { input: '{"v":[],"n":"xyz"}', expected: arr([], 'xyz') },
            { input: '{"v":[1,2,3],"n":"xyz"}', expected: arr([1, 2, 3], 'xyz') },
            { input: '{"v":[1,"2",null,true,false],"n":"xyz"}', expected: arr([1, '2', null, true, false], 'xyz') },
            { input: arr([1, '2', undefined, null, true, false]), expected: arr([1, '2', undefined, null, true, false]) },
            { input: arr([1, '2', undefined, null, true, false], 'xyz'), expected: arr([1, '2', undefined, null, true, false], 'xyz') },
            { input: err('test', str('xyz'), ctx(x => x.fallback = '[1,2,3]')), expected: arr([1, 2, 3]) },
            { input: 23456, expected: '23456 is not convertable to array' },
            { input: true, expected: 'true is not convertable to array' },
            { input: false, expected: 'false is not convertable to array' },
            { input: err('test', str('xyz'), ctx()), expected: '`test` is not convertable to array' },
            { input: err('test', str('xyz'), ctx(x => x.fallback = 'asdfgh')), expected: 'asdfgh is not convertable to array' },
            { input: undefined, expected: 'undefined is not convertable to array' },
            { input: null, expected: 'null is not convertable to array' },
            { input: 23456, defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: true, defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: false, defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: err('test', str('xyz'), ctx()), defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: err('test', str('xyz'), ctx(x => x.fallback = 'asdfgh')), defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: undefined, defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: null, defaultValue: [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: 23456, defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: true, defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: false, defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: err('test', str('xyz'), ctx()), defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: err('test', str('xyz'), ctx(x => x.fallback = 'asdfgh')), defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: undefined, defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) },
            { input: null, defaultValue: () => [1, 2, 3], expected: arr([1, 2, 3]) }
        ];

        for (const { input, defaultValue, expected } of tests) {
            if (typeof expected === 'object') {
                it(`should successfully convert ${toName(input)} to [${expected}]${defaultValue !== undefined ? ' when given a default value' : ''}`, () => {
                    // arrange

                    // act
                    const result = bbtag.toArray(input, defaultValue);

                    // assert
                    expect(result).to.have.ordered.members(expected);
                    expect(result.name).to.equal(expected.name);
                });
            } else {
                it(`should fail to convert ${toName(input)} to array`, () => {
                    // arrange

                    // act
                    const test = () => bbtag.toArray(input);

                    // assert
                    expect(test).to.throw(expected);

                });
            }
        }
    });

    describe('function tryToArray', () => {
        const tests: Array<TestCase<SubtagResultArray | undefined>> = [
            { input: '[]', expected: arr([]) },
            { input: '[1,2,3]', expected: arr([1, 2, 3]) },
            { input: '[1,"2",null,true,false]', expected: arr([1, '2', null, true, false]) },
            { input: '{"v":[],"n":"xyz"}', expected: arr([], 'xyz') },
            { input: '{"v":[1,2,3],"n":"xyz"}', expected: arr([1, 2, 3], 'xyz') },
            { input: '{"v":[1,"2",null,true,false],"n":"xyz"}', expected: arr([1, '2', null, true, false], 'xyz') },
            { input: arr([1, '2', undefined, null, true, false]), expected: arr([1, '2', undefined, null, true, false]) },
            { input: arr([1, '2', undefined, null, true, false], 'xyz'), expected: arr([1, '2', undefined, null, true, false], 'xyz') },
            { input: err('test', str('xyz'), ctx(x => x.fallback = '[1,2,3]')), expected: arr([1, 2, 3]) },
            { input: 23456, expected: undefined },
            { input: true, expected: undefined },
            { input: false, expected: undefined },
            { input: err('test', str('xyz'), ctx()), expected: undefined },
            { input: err('test', str('xyz'), ctx(x => x.fallback = 'asdfgh')), expected: undefined },
            { input: undefined, expected: undefined },
            { input: null, expected: undefined }
        ];

        for (const { input, expected } of tests) {
            if (typeof expected === 'object') {
                it(`should successfully convert ${toName(input)} to [${expected}]`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToArray(input);

                    // assert
                    expect(result.success).to.be.true;
                    if (result.success) {
                        expect(result.value).to.have.ordered.members(expected);
                        expect(result.value.name).to.equal(expected.name);
                    }
                });
            } else {
                it(`should fail to convert ${toName(input)} to array`, () => {
                    // arrange

                    // act
                    const result = bbtag.tryToArray(input);

                    // assert
                    expect(result.success).to.be.false;
                });
            }
        }
    });

    describe('function toPrimitive', () => {
        const tests: Array<TestCase<SubtagPrimitiveResult>> = [
            { input: 'abc', expected: 'abc' },
            { input: err('test', str('abc'), ctx(x => x.fallback = 'Hi!')), expected: 'Hi!' },
            { input: true, expected: true },
            { input: false, expected: false },
            { input: err('message', str('abc'), ctx(x => x.fallback = true)), expected: true },
            { input: err('message', str('abc'), ctx(x => x.fallback = false)), expected: false },
            { input: 0, expected: 0 },
            { input: 1, expected: 1 },
            { input: -1, expected: -1 },
            { input: Infinity, expected: Infinity },
            { input: -Infinity, expected: -Infinity },
            { input: NaN, expected: NaN },
            { input: 1234567890, expected: 1234567890 },
            { input: 1.234, expected: 1.234 },
            { input: Infinity, expected: Infinity },
            { input: -1000, expected: -1000 },
            { input: err('message', str('abc'), ctx(x => x.fallback = 12345)), expected: 12345 },
            { input: arr([1, 2, 3]), expected: '[1,2,3]' },
            { input: arr([1, 2, 3], 'xyz'), expected: '{"v":[1,2,3],"n":"xyz"}' },
            { input: err('test', str('abc'), ctx()), expected: '`test`' },
            { input: err('test', str('abc'), ctx(x => x.fallback = arr([1, 2, 3]))), expected: '[1,2,3]' },
            { input: err('test', str('abc'), ctx(x => x.fallback = arr([1, 2, 3], 'name'))), expected: '{"v":[1,2,3],"n":"name"}' }
        ];

        for (const { input, expected } of tests) {
            it(`should successfully convert ${typeof input} ${toName(input)} to ${typeof expected} ${expected}`, () => {
                // arrange

                // act
                const result = bbtag.toPrimitive(input);

                // assert
                if (typeof expected === 'number' && isNaN(expected)) {
                    expect(result).to.be.NaN;
                } else {
                    expect(result).to.equal(expected);
                }
            });
        }
    });

    describe('function toCollection', () => {
        type MethodTest = [SubtagResult[], SubtagResult[]];
        const tests: Array<{ input: SubtagResult, start?: MethodTest, end?: MethodTest, include?: MethodTest }> = [
            {
                input: '[1,2,3,4]',
                start: [[1, err('msg', str(''), ctx(x => x.fallback = 1))], [2, '1', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 2))]],
                end: [[4, err('msg', str(''), ctx(x => x.fallback = 4))], [3, '4', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 3))]],
                include: [[1, 2, 3, 4, err('msg', str(''), ctx(x => x.fallback = 3))], ['4', true, false, undefined, err('msg', str(''), ctx())]]
            },
            {
                input: arr([1, 2, 3, 4]),
                start: [[1, err('msg', str(''), ctx(x => x.fallback = 1))], [2, '1', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 2))]],
                end: [[4, err('msg', str(''), ctx(x => x.fallback = 4))], [3, '4', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 3))]],
                include: [[1, 2, 3, 4, err('msg', str(''), ctx(x => x.fallback = 3))], ['4', true, false, undefined, err('msg', str(''), ctx())]]
            },
            {
                input: 'this is just a simple test',
                start: [['t', 'this is', err('msg', str(''), ctx(x => x.fallback = 'this'))], [1, 'z', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 2))]],
                end: [['t', 'simple test', err('msg', str(''), ctx(x => x.fallback = 'test'))], [1, 'z', true, false, undefined, err('msg', str(''), ctx(x => x.fallback = 2))]],
                include: [['is', 'this', 'test', 'this is just a simple test'], ['4', true, false, undefined, err('msg', str(''), ctx())]]
            }
        ];

        for (const { input, start, end, include } of tests) {
            it(`should correctly convert ${toName(input)} to a collection`, () => {
                // arrange

                // act
                const result = bbtag.toCollection(input);

                // assert
                function message(v: SubtagResult, r: boolean): string {
                    return `${toName(input)} startswith ${toName(v)} should give ${r}`;
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

    describe('const value', () => {
        const testData: Array<{ input: SubtagResult, str?: boolean, num?: boolean, bool?: boolean, arr?: boolean, null?: boolean, err?: boolean }> = [
            { input: 'test', str: true },
            { input: '', str: true },
            { input: 123456, num: true },
            { input: Infinity, num: true },
            { input: NaN, num: true },
            { input: -Infinity, num: true },
            { input: 0, num: true },
            { input: Number.EPSILON, num: true },
            { input: true, bool: true },
            { input: false, bool: true },
            { input: null, null: true },
            { input: undefined, null: true },
            { input: arr([1, 2, 3]), arr: true },
            { input: arr([1, 2, 3], 'test'), arr: true },
            { input: err('msg', str('token'), ctx()), err: true },
            { input: err('msg', tag(str('token')), ctx()), err: true }
        ];

        describe('function isString', () => {
            for (const { input, str: isString } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isString ? 'not ' : ''}a string`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isString(input);

                    // assert
                    expect(result).to.equal(!!isString);
                });
            }
        });

        describe('function isNumber', () => {
            for (const { input, num: isNumber } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isNumber ? 'not ' : ''}a number`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isNumber(input);

                    // assert
                    expect(result).to.equal(!!isNumber);
                });
            }
        });

        describe('function isBoolean', () => {
            for (const { input, bool: isBool } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isBool ? 'not ' : ''}a boolean`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isBoolean(input);

                    // assert
                    expect(result).to.equal(!!isBool);
                });
            }
        });

        describe('function isNull', () => {
            for (const { input, null: isNull } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isNull ? 'not ' : ''}null`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isNull(input);

                    // assert
                    expect(result).to.equal(!!isNull);
                });
            }
        });

        describe('function isArray', () => {
            for (const { input, arr: isArray } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isArray ? 'not ' : ''}an array`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isArray(input);

                    // assert
                    expect(result).to.equal(!!isArray);
                });
            }
        });

        describe('function isError', () => {
            for (const { input, err: isError } of testData) {
                it(`should correctly identify ${toName(input)} as ${!isError ? 'not ' : ''}an error`, () => {
                    // arrange

                    // act
                    const result = bbtag.value.isError(input);

                    // assert
                    expect(result).to.equal(!!isError);
                });
            }
        });
    });

    describe('function getType', () => {
        const tests: Array<{ input: SubtagResult, expected: SubtagResultType }> = [
            { input: 'test', expected: 'string' },
            { input: '', expected: 'string' },
            { input: 123456, expected: 'number' },
            { input: Infinity, expected: 'number' },
            { input: NaN, expected: 'number' },
            { input: -Infinity, expected: 'number' },
            { input: 0, expected: 'number' },
            { input: Number.EPSILON, expected: 'number' },
            { input: true, expected: 'boolean' },
            { input: false, expected: 'boolean' },
            { input: null, expected: 'null' },
            { input: undefined, expected: 'null' },
            { input: arr([1, 2, 3]), expected: 'array' },
            { input: arr([1, 2, 3], 'test'), expected: 'array' },
            { input: err('msg', str('token'), ctx()), expected: 'error' },
            { input: err('msg', tag(str('token')), ctx()), expected: 'error' }
        ];

        for (const { input, expected } of tests) {
            it(`should correctly identify ${toName(input)} as '${expected}'`, () => {
                // arrange

                // act
                const result = bbtag.getType(input);

                // assert
                expect(result).to.equal(expected);
            });
        }
    });
});