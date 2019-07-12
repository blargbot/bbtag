// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { SubtagResultArray } from '../../src/language';
import { array, number } from '../../src/language/serialize';
import { arr, toName } from '../testHelpers/subtag';

describe('module serialize', () => {
    describe('const array', () => {
        const tests: Array<{ str: string, obj: SubtagResultArray | undefined }> = [
            { str: '[1,2,3]', obj: arr([1, 2, 3]) },
            { str: '{"v":[1,2,3],"n":"test"}', obj: arr([1, 2, 3], 'test') },
            { str: 'test', obj: undefined }
        ];

        for (const { str, obj } of tests) {
            if (obj) {
                it(`should successfully serialize ${toName(obj)}`, () => {
                    // arrange

                    // act
                    const result = array.serialize(obj);

                    // assert
                    expect(result).to.equal(str);
                });
                it(`should successfully deserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = array.deserialize(str);

                    // assert
                    expect(result).to.have.ordered.members(obj);
                    expect(result.name).to.equal(obj.name);
                });
                it(`should successfully tryDeserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = array.tryDeserialize(str);

                    // assert
                    expect(result.success).to.be.true;
                    if (result.success) {
                        expect(result.value).to.have.ordered.members(obj);
                    }
                });
            } else {
                it(`should fail to deserialize '${str}'`, () => {
                    // arrange

                    // act
                    const test = () => array.deserialize(str);

                    // assert
                    expect(test).to.throw(`Failed to deserialize '${str}' as array`);
                });
                it(`should fail to tryDeserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = array.tryDeserialize(str);

                    // assert
                    expect(result.success).to.be.false;
                });
            }
        }
    });
    describe('const number', () => {
        const tests: Array<{ str: string, obj: number | undefined }> = [
            { str: '1', obj: 1 },
            { str: '-1', obj: -1 },
            { str: 'Infinity', obj: Infinity },
            { str: '-Infinity', obj: -Infinity },
            { str: 'NaN', obj: NaN },
            { str: 'nan', obj: NaN },
            { str: 'infinity', obj: Infinity },
            { str: '1234567890', obj: 1234567890 },
            { str: '1.234', obj: 1.234 },
            { str: '1234,890.123', obj: 1234890.123 },
            { str: '000123', obj: 123 }
        ];

        for (const { str, obj } of tests) {
            if (obj) {
                it(`should successfully serialize ${toName(obj)}`, () => {
                    // arrange

                    // act
                    const result = number.serialize(obj);

                    // assert
                    expect(result).to.equal(str);
                });
                it(`should successfully deserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = number.deserialize(str);

                    // assert
                    expect(result).to.equal(obj);
                });
                it(`should successfully tryDeserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = number.tryDeserialize(str);

                    // assert
                    expect(result.success).to.be.true;
                    if (result.success) {
                        expect(result.value).to.equal(obj);
                    }
                });
            } else {
                it(`should fail to deserialize '${str}'`, () => {
                    // arrange

                    // act
                    const test = () => number.deserialize(str);

                    // assert
                    expect(test).to.throw(`Failed to deserialize '${str}' as number`);
                });
                it(`should fail to tryDeserialize '${str}'`, () => {
                    // arrange

                    // act
                    const result = number.tryDeserialize(str);

                    // assert
                    expect(result.success).to.be.false;
                });
            }
        }
    });
});