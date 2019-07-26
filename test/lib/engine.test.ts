// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, IStringToken, SubtagContext, SubtagResult } from '../..';
import { ctx, eng, MockSubtag, str, stripStrToken, tag } from '../testUtils';

const subtags: MockSubtag[] = [
    new MockSubtag('//', { optimize: _ => '' }),
    new MockSubtag('count', { optimize: t => t, execute: t => t.args.length })
];

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
            const engine = eng();
            engine.subtags.register(...subtags);
            const context = ctx(engine);

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
        const engine = eng();
        engine.subtags.register(...subtags);
        const setupContext = ctx(engine);

        const testCases: Array<{ input: string, token?: IStringToken, assert: (context: SubtagContext, result: SubtagResult) => void }> = [
            { input: 'hi {count;a}', assert: (_, r) => expect(bbtag.convert.toString(r)).to.equal('hi 1') },
            { input: 'hi {count}', assert: (_, r) => expect(bbtag.convert.toString(r)).to.equal('hi 0') },
            { input: 'hi {count;a, b;c d}', assert: (_, r) => expect(bbtag.convert.toString(r)).to.equal('hi 2') },
            { input: 'hi {aaaaa;a}', assert: (_, r) => expect(bbtag.convert.toString(r)).to.equal('hi `Unknown subtag aaaaa`') }
        ];

        for (const entry of testCases) {
            entry.token = engine.process(entry.input, setupContext).root;
        }

        for (const { input, token, assert } of testCases) {
            it(`should correctly execute '${input}'`, async () => {
                // arrange
                const context = ctx(engine);

                // act
                const result = await engine.execute(token!, context);

                // assert
                assert(context, result);
            });
        }
    });
});