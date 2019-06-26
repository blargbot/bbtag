import '../../src';
// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { Engine } from '../../src/engine';
import { tag, str, stripStrToken } from '../test helpers/subtag';
import { default as subtags } from '../../src/subtags';
import { ExecutionContext, IStringToken, SubtagResult } from '../../src/models';
import { default as util } from '../../src/util';

describe('engine', () => {
    describe('process', () => {
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
            if (expected instanceof Error) {
                it(`should fail to process '${input}' because ${expected.message}`, () => {
                    // arrange
                    const engine = new Engine(undefined!);
                    engine.subtags.register(...subtags);
                    const test = () => engine.process(input);

                    // act

                    // assert
                    expect(test).to.throw(expected.message);
                });
            } else {
                it(`should correctly process '${input}'`, () => {
                    // arrange
                    const engine = new Engine(undefined!);
                    engine.subtags.register(...subtags);

                    // act
                    const result = engine.process(input);

                    // assert
                    expect(stripStrToken(result.root)).to.deep.equal(expected);
                });
            }
        }
    });

    describe('execute', () => {
        const engine = new Engine(undefined!);
        engine.subtags.register(...subtags);

        const testCases: Array<{ input: string, token?: IStringToken, assert: (context: ExecutionContext, result: SubtagResult) => void }> = [
            { input: 'hi {if;true;yay!}', assert: (_, r) => expect(util.subtag.toString(r)).to.be.equal('hi yay!') },
            { input: 'hi {if;true}', assert: (_, r) => expect(util.subtag.toString(r)).to.be.equal('hi `Not enough arguments`') },
            { input: 'hi {if;false;yay!}', assert: (_, r) => expect(util.subtag.toString(r)).to.be.equal('hi ') }
        ];

        for (const entry of testCases) {
            entry.token = engine.process(entry.input).root;
        }

        for (const { input, token, assert } of testCases) {
            it(`should correctly execute '${input}'`, async () => {
                // arrange
                const context = new ExecutionContext(engine, 'test');

                // act
                const result = await engine.execute(token!, context);

                // assert
                assert(context, result);
            });
        }
    });
});