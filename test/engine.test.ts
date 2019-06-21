import '../src/';
import { expect } from 'chai';
import { Engine } from '../src/engine';
import { tag, str, stripStrToken } from './test helpers/subtag';
import { default as subtags } from '../src/subtags';


describe('engine', function () {
    describe('process', function () {
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
                it(`should fail to process ${testCase.input} because ${testCase.expected.message}`, function () {
                    // arrange
                    let engine = new Engine(undefined!);
                    engine.subtags.register(...subtags);
                    let test = () => engine.process(testCase.input);

                    // act

                    // assert
                    expect(test).to.throw(testCase.expected.message);
                });
            } else {
                it(`should correctly process ${testCase.input}`, function () {
                    // arrange
                    let engine = new Engine(undefined!);
                    engine.subtags.register(...subtags);

                    // act
                    let result = engine.process(testCase.input);

                    // assert
                    expect(stripStrToken(result.root)).to.deep.equal(testCase.expected);
                });
            }
        }
    });
});