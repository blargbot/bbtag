// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { argumentBuilder, Enumerable, IArgumentSource, IHandlerArgumentValue } from '../../..';

type TestCaseInput = [string, boolean] | [string, boolean, boolean] | [string, boolean, string] | [string, boolean, boolean, string];
type TestCases = Enumerable<{ input: TestCaseInput, structure: IHandlerArgumentValue, string: string }>;

function arg(name: string, required: boolean, many: boolean, type: string | undefined): IHandlerArgumentValue {
    return { name, required, many, type };
}

const testCases: TestCases = Enumerable.from([
    { input: ['test1', true], structure: arg('test1', true, false, undefined), string: '<test1>' },
    { input: ['test2', true, false], structure: arg('test2', true, false, undefined), string: '<test2>' },
    { input: ['test3', true, 'type1'], structure: arg('test3', true, false, 'type1'), string: '<test3:type1>' },
    { input: ['test4', true, 'type2'], structure: arg('test4', true, false, 'type2'), string: '<test4:type2>' },
    { input: ['test5', true, false, 'type3'], structure: arg('test5', true, false, 'type3'), string: '<test5:type3>' },
    { input: ['test6', true, true], structure: arg('test6', true, true, undefined), string: '<...test6>' },
    { input: ['test7', true, true, 'type4'], structure: arg('test7', true, true, 'type4'), string: '<...test7:type4>' },
    { input: ['test8', false], structure: arg('test8', false, false, undefined), string: '[test8]' },
    { input: ['test9', false, false], structure: arg('test9', false, false, undefined), string: '[test9]' },
    { input: ['test10', false, 'type5'], structure: arg('test10', false, false, 'type5'), string: '[test10:type5]' },
    { input: ['test11', false, 'type6'], structure: arg('test11', false, false, 'type6'), string: '[test11:type6]' },
    { input: ['test12', false, false, 'type7'], structure: arg('test12', false, false, 'type7'), string: '[test12:type7]' },
    { input: ['test13', false, true], structure: arg('test13', false, true, undefined), string: '[...test13]' },
    { input: ['test14', false, true, 'type8'], structure: arg('test14', false, true, 'type8'), string: '[...test14:type8]' }
]);

describe('constant argumentBuilder', () => {
    describe('function c', () => {
        it('should be the same as #create', () => {
            // arrange

            // act

            // assert
            expect(argumentBuilder.c).to.equal(argumentBuilder.create);
        });
    });
    describe('function r', () => {
        it('should be the same as #require', () => {
            // arrange

            // act

            // assert
            expect(argumentBuilder.r).to.equal(argumentBuilder.require);
        });
    });
    describe('function o', () => {
        it('should be the same as #optional', () => {
            // arrange

            // act

            // assert
            expect(argumentBuilder.o).to.equal(argumentBuilder.optional);
        });
    });
    describe('function g', () => {
        it('should be the same as #group', () => {
            // arrange

            // act

            // assert
            expect(argumentBuilder.g).to.equal(argumentBuilder.group);
        });
    });
    describe('function create', () => {
        for (const { input, structure: expected } of testCases) {
            it(`should create ${expected.required ? 'a required' : 'an optional'}${expected.many ? ' expandable ' : ' '}${expected.type || 'typeless'} argument`, () => {
                // arrange

                // act
                const result = argumentBuilder.create(...input as Parameters<IArgumentSource['create']>);

                // assert
                expect(result).to.deep.equal(expected);
            });
        }
    });
    describe('function require', () => {
        for (const { input: raw, structure: expected } of testCases.where(c => c.input[1])) {
            it(`should create a required ${expected.many ? 'expandable ' : ''}${expected.type || 'typeless'} argument`, () => {
                // arrange
                const input = [raw[0], ...raw.slice(2)];

                // act
                const result = argumentBuilder.require(...input as Parameters<IArgumentSource['require']>);

                // assert
                expect(result).to.deep.equal(expected);
            });
        }
    });
    describe('function optional', () => {
        for (const { input: raw, structure: expected } of testCases.where(c => !c.input[1])) {
            it(`should create an optional ${expected.many ? 'expandable ' : ''}${expected.type || 'typeless'} argument`, () => {
                // arrange
                const input = [raw[0], ...raw.slice(2)];

                // act
                const result = argumentBuilder.optional(...input as Parameters<IArgumentSource['optional']>);

                // assert
                expect(result).to.deep.equal(expected);
            });
        }
    });
    describe('function group', () => {
        const cases = [
            { required: undefined, expected: false },
            { required: true, expected: true },
            { required: false, expected: false }
        ];

        for (const { required, expected } of cases) {
            it(`should create ${required === undefined ? 'a default' : required ? 'a required' : 'an optional'} group`, () => {
                // arrange
                const args = Enumerable.from([required, ...testCases.select(c => c.structure)]).where(a => a !== undefined) as any as Parameters<IArgumentSource['group']>;

                // act
                const result = argumentBuilder.group(...args);

                // assert
                expect(result).to.deep.equal({ required: expected, values: testCases.select(c => c.structure).toArray() });
            });
        }
    });
    describe('function stringify', () => {
        for (const { structure: input, string: expected } of testCases) {
            it(`should turn ${input.required ? 'a required' : 'an optional'}${input.many ? ' expandable' : ''} ${input.type || 'typeless'} argument`, () => {
                // arrange

                // act
                const result = argumentBuilder.stringify(';', [input]);

                // assert
                expect(result).to.equal(expected);
            });
        }
        it('should turn multiple arguments into one space separated string', () => {
            // arrange
            const input = testCases.select(c => c.structure);
            const expected = testCases.select(c => c.string).join(';');

            // act
            const result = argumentBuilder.stringify(';', input.toArray());

            // assert
            expect(result).to.deep.equal(expected);
        });
        it(`should turn a required group of 2 arguments into <arg1 arg2>`, () => {
            // arrange
            const parts = testCases.where((_, i) => [6, 13].indexOf(i) !== -1);

            // act
            const result = argumentBuilder.stringify(';', [{ required: true, values: parts.select(p => p.structure).toArray() }]);

            // assert
            expect(result).to.equal(`<${parts.select(p => p.string).join(';')}>`);
        });
        it(`should turn an optional group of 2 arguments into <arg1 arg2>`, () => {
            // arrange
            const parts = testCases.where((_, i) => [6, 13].indexOf(i) !== -1);

            // act
            const result = argumentBuilder.stringify(';', [{ required: false, values: parts.select(p => p.structure).toArray() }]);

            // assert
            expect(result).to.equal(`[${parts.select(p => p.string).join(';')}]`);
        });
    });
});