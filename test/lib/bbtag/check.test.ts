import { expect } from 'chai';
import check from '../../../lib/bbUtil/check';
import { typeMappingTestData } from './_helpers';

describe('const bbtag.check', () => {
    for (const func of Object.keys(check) as Array<keyof typeof check>) {
        describe('function ' + func, () => {
            for (const { input, type } of typeMappingTestData) {
                const expected = type === func;
                it(`should report check.${func}(${JSON.stringify(input)}) as ${expected}`, () => {
                    // arrange

                    // act
                    const result = check[func](input);

                    // assert
                    expect(result).to.equal(expected);
                });
            }
        });
    }
});