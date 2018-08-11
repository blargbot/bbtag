import { expect, AssertionError } from 'chai';
import * as language from '../dist/language.v2';
import { Location } from '../dist/structures/selection';

type bbString = Array<string | bbSubTag>;
type bbSubTag = {
    name: bbString | bbSubTag;
    positional?: Array<bbString | bbSubTag>;
    named?: Array<bbNamedArg>;
};
type bbNamedArg = {
    name: bbString | bbSubTag;
    values: Array<bbString | bbSubTag>;
};
type testCase = {
    input: string;
    output: bbString | string;
};
type testCollection = {
    description: string;
    cases: Array<testCase>;
};

function checkBBString(actual: language.BBString, expected: bbString, parent: string) {
    expect(actual).to.be.instanceOf(language.BBString, parent + ' instanceof language.BBString');
    expect(actual.parts.count(), parent + `\n\t.parts.count()`).to.equal(expected.length);
    for (let i = 0; i < expected.length; i++) {
        if (typeof expected[i] === 'string')
            expect(actual.parts.get(i), parent + `\n\t.parts.get(${i})`).to.equal(expected[i]);
        else
            checkBBSubTag(<any>actual.parts.get(i), <any>expected[i], parent + `\n\t.parts.get(${i})`);
    }
}

function checkBBSubTag(actual: language.BBSubTag, expected: bbSubTag, parent: string) {
    expect(actual).to.be.instanceOf(language.BBSubTag, parent + ' instanceof language.BBSubTag');
    checkBBSubTagOrBBString(actual.name, expected.name, parent + '\n\t.name');
    if (expected.positional) {
        expect(actual.args.positional.count(), parent + '\n\t.args.positional.count()').to.equal(expected.positional.length);
        for (let i = 0; i < expected.positional.length; i++)
            checkBBSubTagOrBBString(actual.args.positional.get(i)!, expected.positional[i], parent + `\n\t.args.positional.get(${i})`);
    }
    if (expected.named) {
        expect(actual.args.named.count(), parent + '\n\t.args.named.count()').to.equal(expected.named.length);
        for (let i = 0; i < expected.named.length; i++)
            checkBBNamedArg(actual.args.named.get(i)!, expected.named[i], parent + `\n\t.args.named.get(${i})`);
    }
}

function checkBBNamedArg(actual: language.BBNamedArg, expected: bbNamedArg, parent: string) {
    expect(actual).to.be.instanceOf(language.BBNamedArg, parent + ' instanceof language.BBNamedArg');
    checkBBSubTagOrBBString(actual.name, expected.name, parent + '\n\t.name');
    expect(actual.values.count(), parent + '\n\t.values.count()').to.equal(expected.values.length);
    for (let i = 0; i < expected.values.length; i++)
        checkBBSubTagOrBBString(actual.values.get(i)!, expected.values[i], parent + `\n\t.values.get(${i})`);
}

function checkBBSubTagOrBBString(actual: language.BBSubTag | language.BBString, expected: bbSubTag | bbString, parent: string) {
    if (Array.isArray(expected))
        checkBBString(<any>actual, expected, parent);
    else
        checkBBSubTag(<any>actual, expected, parent);
}

describe('Language.2', () => {
    describe('#parse(string)', () => {
        let testCases: Array<testCollection> = [
            {
                description: 'should successfully parse a string without subtags',
                cases: [
                    // successes
                    { input: '', output: [] },
                    { input: '    ', output: [] },
                    { input: '    test', output: ['test'] },
                    { input: 'test    ', output: ['test'] },
                    { input: 'Hello, this is a test', output: ['Hello, this is a test'] },
                    { input: 'Hello, this is; a test', output: ['Hello, this is; a test'] },
                    // errors
                    { input: 'Hello, this} is a test', output: '[1:12] Unpaired \'}\'' },
                    { input: 'Hello, {this is a test', output: '[1:8] Unpaired \'{\'' }
                ]
            },
            {
                description: 'should successfully parse a string with non-nested subtags',
                cases: [
                    // successes
                    {
                        input: '{}',
                        output: [{ name: [] }]
                    }, {
                        input: 'Hello, { this } is a test',
                        output: ['Hello, ', { name: ['this'] }, ' is a test']
                    }, {
                        input: 'Hello, { this ; is a } test',
                        output: ['Hello, ', { name: ['this'], positional: [['is a']] }, ' test']
                    }, {
                        input: '{hello;this is a;test}',
                        output: [{ name: ['hello'], positional: [['this is a'], ['test']] }]
                    }, {
                        input: '{hello;this;{*is;a test}}',
                        output: [{ name: ['hello'], positional: [['this']], named: [{ name: ['*is'], values: [['a test']] }] }]
                    }, {
                        input: '{*hello;this;{*is;a test}}',
                        output: [{ name: ['*hello'], positional: [['this']], named: [{ name: ['*is'], values: [['a test']] }] }]
                    }, {
                        input: '{hello;matey;this;{*is;a test}{*with;multiple};{*named;args;woah}}',
                        output: [{
                            name: ['hello'],
                            positional: [['matey'], ['this']],
                            named: [
                                { name: ['*is'], values: [['a test']] },
                                { name: ['*with'], values: [['multiple']] },
                                { name: ['*named'], values: [['args'], ['woah']] }
                            ]
                        }]
                    },
                    // errors
                    {
                        input: '{hello;{*there;!};General kenobi!}',
                        output: '[1:19] Named args cannot be followed by positional args'
                    },
                    {
                        input: '{hello;{*there;!};{*General;{*kenobi}}}',
                        output: '[1:29] Named args cannot contain named args'
                    },
                    {
                        input: '{hello;{*there;!} general kenobi}',
                        output: '[1:8] Cannot mix named args and text'
                    }
                ]
            }
        ];

        for (const collection of testCases) {
            it(collection.description, () => {
                for (const entry of collection.cases) {
                    // arrange
                    let input = entry.input;
                    let expected = entry.output;

                    if (typeof expected === 'string') {
                        // act
                        let action = (() => language.parse(input));

                        // assert
                        expect(action, `language.parse('${input}')`).to.throw(language.ParseError, expected);
                    } else {
                        // act
                        let result = language.parse(input);

                        // assert
                        checkBBString(result, expected, `language.parse('${input}')`);
                    }
                }
            });
        }
    });
});