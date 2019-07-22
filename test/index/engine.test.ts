// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { BBTagEngine } from '../../src/engine';
import { bbtag, IStringToken, SubtagResult } from '../../src/language';
import { SubtagContext } from '../../src/structures';
import { default as subtags } from '../../src/subtags';
import { MockExecutionContext } from '../testHelpers/mocks';
import { str, stripStrToken, tag } from '../testHelpers/subtag';

describe('class Engine', () => {
    describe('function process', () => {
        const testCases: Array<{ input: string, expected: any }> = [
            { input: 'this is} a test', expected: new Error('Unpaired \'}\'') },
            { input: 'this {is;{a;test}', expected: new Error('Unpaired \'{\'') },
            { input: 'this is a test', expected: str('this is a test') },
            { input: 'this is; a test', expected: str('this is; a test') },
            { input: 'this {is;a} test', expected: str('this {0} test', tag(str('is'), str('a'))) },
            { input: ' { this { is ; a parsing } ; test } ', expected: str('{0}', tag(str('this {0}', tag(str('is'), str('a parsing'))), str('test'))) },
            { input: '  { // ;comment test} aaaa', expected: str('aaaa') },
            { input: '  { // { // ;why would you do this};comment test} aaaa', expected: str('aaaa') }
        ];
        for (const { input, expected } of testCases) {
            const engine = new BBTagEngine(SubtagContext, undefined!);
            engine.subtags.register(...subtags);
            const context = new SubtagContext(engine, { scope: 'testing', name: 'test' });

            if (expected instanceof Error) {
                it(`should fail to process '${input}' because ${expected.message}`, () => {
                    // arrange
                    const test = () => engine.process(input, context);

                    // act

                    // assert
                    expect(test).to.throw(expected.message);
                });
            } else {
                it(`should correctly process '${input}'`, () => {
                    // arrange

                    // act
                    const result = engine.process(input, context);

                    // assert
                    expect(stripStrToken(result.root)).to.deep.equal(stripStrToken(expected));
                });
            }
        }
    });

    describe('function execute', () => {
        const engine = new BBTagEngine(MockExecutionContext, undefined!);
        const setupContext = new MockExecutionContext();
        engine.subtags.register(...subtags);

        const testCases: Array<{ input: string, token?: IStringToken, assert: (context: SubtagContext, result: SubtagResult) => void }> = [
            { input: 'hi {if;true;yay!}', assert: (_, r) => expect(bbtag.toString(r)).to.equal('hi yay!') },
            { input: 'hi {if;true}', assert: (_, r) => expect(bbtag.toString(r)).to.equal('hi `Not enough arguments`') },
            { input: 'hi {if;false;booo}', assert: (_, r) => expect(bbtag.toString(r)).to.equal('hi ') },
            { input: 'hi {if;{bool;a;==;b};booo}', assert: (_, r) => expect(bbtag.toString(r)).to.equal('hi ') },
            { input: 'hi {if;{bool;a;!=;b};yay!}', assert: (_, r) => expect(bbtag.toString(r)).to.equal('hi yay!') }
        ];

        for (const entry of testCases) {
            entry.token = engine.process(entry.input, setupContext).root;
        }

        for (const { input, token, assert } of testCases) {
            it(`should correctly execute '${input}'`, async () => {
                // arrange
                const context = new SubtagContext(engine, { scope: 'tests', name: 'tests' });

                // act
                const result = await engine.execute(token!, context);

                // assert
                assert(context, result);
            });
        }
    });
});