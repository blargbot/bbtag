import '../src/';
import { expect } from 'chai';
import { Parser } from '../src/parser';
import { tag, str, stripStrToken } from './test helpers/subtag';

describe('Parse', function () {
    describe('parse', function () {
        let testCases: { input: string, expected: any }[] = [
            { input: 'this is} a test', expected: new Error('Unpaired \'}\'') },
            { input: 'this {is;{a;test}', expected: new Error('Unpaired \'{\'') },
            { input: 'this is a test', expected: str('this is a test') },
            { input: 'this is; a test', expected: str('this is; a test') },
            { input: 'this {is;a} test', expected: str('this {0} test', tag(str('is'), str('a'))) },
            { input: ' { this { is ; a parsing } ; test } ', expected: str('{0}', tag(str('this {0}', tag(str('is'), str('a parsing'))), str('test'))) }
        ];

        for (const testCase of testCases) {
            if (testCase.expected instanceof Error) {
                it(`should fail to parse ${testCase.input} because ${testCase.expected.message}`, function () {
                    // arrange
                    let parser = new Parser();
                    let test = () => parser.parse(testCase.input);

                    // act

                    // assert
                    expect(test).to.throw(testCase.expected.message);
                });
            } else {
                it(`should correctly parse ${testCase.input}`, function () {
                    // arrange
                    let parser = new Parser();

                    // act
                    let result = parser.parse(testCase.input);

                    // assert
                    expect(stripStrToken(result)).to.deep.equal(testCase.expected);
                });
            }
        }
    });
});