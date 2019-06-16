import { expect } from 'chai';
import { Parser } from '../src/parser';
import '../src/';

function tag(name: any, ...args: any[]) {
    return { name, args };
}

function str(format: string, ...subtags: any[]) {
    return { format, subtags }
}

function stripStrToken(token: any) {
    return {
        format: token.format,
        subtags: token.subtags.map(stripTagToken)
    };
}

function stripTagToken(token: any) {
    return {
        name: stripStrToken(token.name),
        args: token.args.map(stripStrToken)
    };
}

describe('parse', function () {
    let testCases: { input: string, expected: any }[] = [
        { input: 'this is} a test', expected: new Error('Unpaired \'}\'') },
        { input: 'this {is;{a;test}', expected: new Error('Unpaired \'{\'') },
        { input: 'this is a test', expected: str('this is a test') },
        { input: 'this is; a test', expected: str('this is; a test') },
        { input: 'this {is;a} test', expected: str('this {0} test', tag(str('is'), str('a'))) },
        { input: ' { this { is ; a parsing } ; test } ', expected: str('{0}', tag(str('this {0}', tag(str('is'), str('a parsing'))), str('test'))) },
        { input: '  { // ;comment test} aaaa', expected: str('aaaa') },
        { input: '  { // { // ;why would you do this};comment test} aaaa', expected: str('aaaa') }
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
                expect(result.source).to.be.equal(testCase.input);
                expect(stripStrToken(result.root)).to.deep.equal(testCase.expected);
            });
        }
    }
});