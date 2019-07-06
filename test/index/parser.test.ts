// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { parse } from '../../src/parser';
import { str, stripStrToken, tag } from '../testHelpers/subtag';

describe('function parse', () => {
    const testCases: Array<{ input: string, expected: any }> = [
        { input: 'this is} a test', expected: new Error('Unpaired \'}\'') },
        { input: 'this {is;{a;test}', expected: new Error('Unpaired \'{\'') },
        { input: '', expected: str('') },
        { input: 'this is a test', expected: str('this is a test') },
        { input: 'this is; a test', expected: str('this is; a test') },
        { input: 'this {is;a} test', expected: str('this {0} test', tag(str('is'), str('a'))) },
        { input: ' { this { is ; a parsing } ; test } ', expected: str('{0}', tag(str('this {0}', tag(str('is'), str('a parsing'))), str('test'))) }
    ];

    for (const testCase of testCases) {
        if (testCase.expected instanceof Error) {
            it(`should fail to parse ${testCase.input} because ${testCase.expected.message}`, () => {
                // arrange
                const test = () => parse(testCase.input);

                // act

                // assert
                expect(test).to.throw(testCase.expected.message);
            });
        } else {
            it(`should correctly parse ${testCase.input}`, () => {
                // arrange

                // act
                const result = parse(testCase.input);

                // assert
                expect(stripStrToken(result)).to.deep.equal(stripStrToken(testCase.expected));
            });
        }
    }
});