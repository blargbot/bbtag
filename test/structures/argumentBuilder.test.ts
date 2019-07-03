// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { argumentBuilder, IArgumentSource, IHandlerArgumentValue } from '../../src/structures';

type TestCaseInput = [string, boolean] | [string, boolean, boolean] | [string, boolean, string] | [string, boolean, boolean, string];
type TestCases = Array<{ input: TestCaseInput, structure: IHandlerArgumentValue, string: string }>;

function easyArg(name: string, required: boolean, many: boolean, type: string | undefined): IHandlerArgumentValue {
    return { name, required, many, type };
}

const testCases: TestCases = [
    { input: ['test1', true], structure: easyArg('test1', true, false, undefined), string: '<test1>' },
    { input: ['test2', true, false], structure: easyArg('test2', true, false, undefined), string: '<test2>' },
    { input: ['test3', true, 'type1'], structure: easyArg('test3', true, false, 'type1'), string: '<test3:type1>' },
    { input: ['test4', true, 'type2'], structure: easyArg('test4', true, false, 'type2'), string: '<test4:type2>' },
    { input: ['test5', true, false, 'type3'], structure: easyArg('test5', true, false, 'type3'), string: '<test5:type3>' },
    { input: ['test6', true, true], structure: easyArg('test6', true, true, undefined), string: '<...test6>' },
    { input: ['test7', true, true, 'type4'], structure: easyArg('test7', true, true, 'type4'), string: '<...test7:type4>' },
    { input: ['test8', false], structure: easyArg('test8', false, false, undefined), string: '[test8]' },
    { input: ['test9', false, false], structure: easyArg('test9', false, false, undefined), string: '[test9]' },
    { input: ['test10', false, 'type5'], structure: easyArg('test10', false, false, 'type5'), string: '[test10:type5]' },
    { input: ['test11', false, 'type6'], structure: easyArg('test11', false, false, 'type6'), string: '[test11:type6]' },
    { input: ['test12', false, false, 'type7'], structure: easyArg('test12', false, false, 'type7'), string: '[test12:type7]' },
    { input: ['test13', false, true], structure: easyArg('test13', false, true, undefined), string: '[...test13]' },
    { input: ['test14', false, true, 'type8'], structure: easyArg('test14', false, true, 'type8'), string: '[...test14:type8]' }
];

describe('constant argumentBuilder', () => {
    describe('#create', () => {
        for (const { input, structure: expected } of testCases) {
            it(`should create ${expected.required ? 'a required' : 'an optional'}${expected.many ? ' expandable' : ''} ${expected.type || 'typeless'} argument`, () => {
                // arrange

                // act
                const result = argumentBuilder.create(...input as Parameters<IArgumentSource['create']>);

                // assert
                expect(result).to.deep.equal(expected);
            });
        }
    });
    describe('#toString', () => {
        for (const { structure: input, string: expected } of testCases) {
            it(`should turn ${JSON.stringify(input)} into ${expected}`, () => {
                // arrange

                // act
                const result = argumentBuilder.stringify(input);

                // assert
                expect(result).to.equal(expected);
            });
        }
        it(`should turn ${JSON.stringify({ required: true, values: 2 })} into <x y>`, () => {
            // arrange
            const parts = [6, 13].map(i => testCases[i]);

            // act
            const result = argumentBuilder.stringify({ required: true, values: parts.map(p => p.structure) });

            // assert
            expect(result).to.equal(`<${parts.map(p => p.string).join(' ')}>`);
        });
        it(`should turn ${JSON.stringify({ required: false, values: 2 })} into [x y]`, () => {
            // arrange
            const parts = [6, 13].map(i => testCases[i]);

            // act
            const result = argumentBuilder.stringify({ required: false, values: parts.map(p => p.structure) });

            // assert
            expect(result).to.equal(`[${parts.map(p => p.string).join(' ')}]`);
        });
    });
});