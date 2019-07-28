import { expect } from 'chai';
import switchType from '../../../lib/bbtag/switchType';
import { SwitchHandlers } from '../../../lib/bbtag/types';
import { functions } from '../../../lib/util';
import { typeMappingTestData } from './_helpers';

const completeHandler: SwitchHandlers<true> = {
    array: () => true,
    boolean: () => true,
    error: () => true,
    null: () => true,
    number: () => true,
    string: () => true
};

export default () => {
    for (const { input, type } of typeMappingTestData) {
        it(`should successfully switch on ${JSON.stringify(input)} when the ${type} handler does exist`, () => {
            // arrange

            // act
            const result = switchType(input, { ...completeHandler, [type]: () => type });

            // assert
            expect(result).to.equal(type);
        });
    }
    for (const { input, type } of typeMappingTestData) {
        it(`should fail to switch on ${JSON.stringify(input)} when the ${type} handler does not exist`, () => {
            // arrange

            // act
            const result = switchType(input, { ...completeHandler, [type]: undefined });

            // assert
            expect(result).to.be.undefined;
        });
    }
    for (const { input, type } of typeMappingTestData) {
        it(`should successfully switch on ${JSON.stringify(input)} when the ${type} handler does not exist, but a default is given`, () => {
            // arrange

            // act
            const result = switchType(input, { ...completeHandler, [type]: undefined }, v => functions.NaN.eq(v, input) ? type : false);

            // assert
            expect(result).to.equal(type);
        });
    }
};