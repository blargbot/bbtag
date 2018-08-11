import { expect, AssertionError } from 'chai';
import * as language from '../dist/language.v2';
import { Location } from '../dist/structures/selection';

type bbString = Array<string | bbSubTag>;
type bbSubTag = {
    name: bbString | bbSubTag;
    args?: Array<bbString | bbSubTag>;
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
    expect(actual.parts.count(), parent + `.parts.count()`).to.equal(expected.length);
    for (let i = 0; i < expected.length; i++) {
        if (typeof expected[i] === 'string')
            expect(actual.parts.get(i), parent + `.parts.get(${i})`).to.equal(expected[i]);
        else
            checkBBSubTag(<any>actual.parts.get(i), <any>expected[i], parent + `.parts.get(${i})`);
    }
}

function checkBBSubTag(actual: language.BBSubTag, expected: bbSubTag, parent: string) {
    expect(actual).to.be.instanceOf(language.BBSubTag, parent + ' instanceof language.BBSubTag');
    checkBBSubTagOrBBString(actual.name, expected.name, parent + '.name');
    if (expected.args) {
        expect(actual.args.positional.count(), parent + '.args.positional.count()').to.equal(expected.args.length);
        for (let i = 0; i < expected.args.length; i++)
            checkBBSubTagOrBBString(actual.args.positional.get(i)!, expected.args[i], parent + `.args.positional.get(${i})`);
    }
    if (expected.named) {
        expect(actual.args.named.count(), parent + '.args.named.count()').to.equal(expected.named.length);
        for (let i = 0; i < expected.named.length; i++)
            checkBBNamedArg(actual.args.named.get(i)!, expected.named[i], parent + `.args.named.get(${i})`);
    }
}

function checkBBNamedArg(actual: language.BBNamedArg, expected: bbNamedArg, parent: string) {
    expect(actual).to.be.instanceOf(language.BBNamedArg, parent + ' instancef language.BBNamedArg');
    checkBBSubTagOrBBString(actual.name, expected.name, parent + '.name');
    expect(actual.values.count(), parent + '.values.count()').to.equal(expected.values.length);
    for (let i = 0; i < expected.values.length; i++)
        checkBBSubTagOrBBString(actual.values.get(i)!, expected.values[i], parent + `.values.get(${i})`);
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
                    { input: 'Hello, { this } is a test', output: ['Hello, ', { name: ['this'] }, ' is a test'] },
                    { input: 'Hello, { this ; is } a test', output: ['Hello, ', { name: ['this'], args: [['is']] }, ' a test'] }
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
                        expect(action).to.throw(language.ParseError, expected);
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