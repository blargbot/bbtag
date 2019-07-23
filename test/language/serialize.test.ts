// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, ISerializer, SubtagResultArray } from '../..';
import { arr, toName } from '../testHelpers/subtag';

type TestCase<T> = { input: string, value: undefined, output?: undefined } | { input: string, value: T, output?: string };
interface ITestType<T> { name: string; serializer: ISerializer<T>; data: Array<TestCase<T>>; deserializeAssert(expected: T, actual: T): void; }

function t<T>(name: string, serializer: ISerializer<T>, data: Array<TestCase<T>>, deserializeAssert: (expected: T, actual: T) => void): ITestType<T> {
    return { name, serializer, data, deserializeAssert };
}

function c<T>(input: string): TestCase<T>;
function c<T>(input: string, value: T): TestCase<T>;
function c<T>(input: string, value: T, output: string): TestCase<T>;
function c<T>(input: string, value?: T, output?: string): TestCase<T> {
    return { input, value: value!, output };
}

describe('module serialize', () => {
    const tests: Array<ITestType<any>> = [
        t('array', bbtag.array, [
            c('[1,2,3]', arr([1, 2, 3])),
            c('{"v":[1,2,3],"n":"test"}', arr([1, 2, 3], 'test')),
            c('{"v":123,"n":"test"}'),
            c('{"v":[1,2,3],"n":5}'),
            c('test')
        ], (expected: SubtagResultArray, actual: SubtagResultArray): void => {
            expect(actual).to.have.ordered.members(expected);
            expect(actual.name).to.equal(expected.name);
        }),
        t('number', bbtag.number, [
            c('0', 0),
            c('1', 1),
            c('-1', -1),
            c('Infinity', Infinity),
            c('-Infinity', -Infinity),
            c('NaN', NaN),
            c('nan', NaN, 'NaN'),
            c('infinity', Infinity, 'Infinity'),
            c('-infinity', -Infinity, '-Infinity'),
            c('1234567890', 1234567890),
            c('1.234', 1.234),
            c('1234,890.123', 1234890.123, '1234890.123'),
            c('000123', 123, '123'),
            c('test')
        ], (expected: number, actual: number): void => {
            if (isNaN(expected)) {
                expect(actual).to.be.NaN;
            } else {
                expect(actual).to.equal(expected);
            }
        }),
        t('boolean', bbtag.boolean, [
            c('true', true),
            c('TruE', true, 'true'),
            c('t', true, 'true'),
            c('yes', true, 'true'),
            c('y', true, 'true'),
            c('false', false),
            c('FalSe', false, 'false'),
            c('f', false, 'false'),
            c('no', false, 'false'),
            c('n', false, 'false'),
            c('test'),
            c('0')
        ], (expected: boolean, actual: boolean): void => {
            expect(actual).to.equal(expected);
        })
    ];

    for (const { name, serializer, data, deserializeAssert } of tests) {
        describe('const ' + name, () => {
            const done = new Set();
            for (const { input, output, value } of data) {
                if (value !== undefined) {
                    if (done.size !== done.add(value).size) {
                        it(`should successfully serialize ${toName(value)}`, () => {
                            // arrange

                            // act
                            const result = serializer.serialize(value);

                            // assert
                            expect(result).to.equal(output || input);
                        });
                    }
                    it(`should successfully deserialize '${input}'`, () => {
                        // arrange

                        // act
                        const result = serializer.deserialize(input);

                        // assert
                        deserializeAssert(result, value);
                    });
                    it(`should successfully tryDeserialize '${input}'`, () => {
                        // arrange

                        // act
                        const result = serializer.tryDeserialize(input);

                        // assert
                        expect(result.success).to.be.true;
                        if (result.success) {
                            deserializeAssert(result.value, value);
                        }
                    });
                } else {
                    it(`should fail to deserialize '${input}'`, () => {
                        // arrange

                        // act
                        const test = () => serializer.deserialize(input);

                        // assert
                        expect(test).to.throw(`Failed to deserialize '${input}' as ${name}`);
                    });
                    it(`should fail to tryDeserialize '${input}'`, () => {
                        // arrange

                        // act
                        const result = serializer.tryDeserialize(input);

                        // assert
                        expect(result.success).to.be.false;
                    });
                }
            }
        });
    }
});