import { expect } from 'chai';
import getType from '../../../lib/bbUtil/getType';
import { typeMappingTestData } from './_helpers';

describe('function bbtag.getType', () => {
    for (const { input, type: expected } of typeMappingTestData) {
        it(`should report ${getType.name}(${JSON.stringify(input)}) as ${expected}`, () => {
            // arrange

            // act
            const result = getType(input);

            // assert
            expect(result).to.equal(expected);
        });
    }
});