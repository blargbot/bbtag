import { expect } from 'chai';
import parse from '../../../lib/bbtag/parse';
import { IStringToken } from '../../../lib/bbtag/types';
import { stringToken as str, subtagToken as tag } from './_helpers';

type TestCase =
    | { kind: 'success', input: string, name?: string, expected: IStringToken }
    | { kind: 'fail', input: string, name?: string, expected: string };

interface IImportedStringToken {
    readonly format: string;
    readonly subtags: IImportedSubtagToken[];
    readonly range: string;
}

interface IImportedSubtagToken {
    readonly name: IImportedStringToken;
    readonly args: IImportedStringToken[];
    readonly range: string;
}

function cast(file: Promise<{ kind: string, input: string, name: string, expected: IImportedStringToken | string }>): Promise<TestCase> {
    return file as Promise<TestCase>;
}

const testCases = Promise.all([
    cast(import('../../test data/notes.json')),
    { kind: 'fail', input: 'this is} a test', expected: 'Unpaired \'}\'' },
    { kind: 'fail', input: 'this {is;{a;test}', expected: 'Unpaired \'{\'' },
    {
        kind: 'success', input: '',
        expected: str('', '[0:0:0]:[0:0:0]')
    },
    {
        kind: 'success', input: 'this is a test',
        expected: str('this is a test', '[0:0:0]:[0:0:0]')
    },
    {
        kind: 'success', input: 'this is; a test',
        expected: str('this is; a test', '[0:0:0]:[15:0:15]')
    },
    {
        kind: 'success', input: 'this {is;a} test',
        expected: str('this {0} test', '[0:0:0]:[16:0:16]',
            tag('[5:0:5]:[11:0:11]',
                str('is', '[6:0:6]:[6:0:6]'),
                str('a', '[9:0:9]:[9:0:9]')
            )
        )
    },
    {
        kind: 'success', input: ' { this { is ; a parsing } ; test } ',
        expected: str('{0}', '[0:0:0]:[36:0:36]',
            tag('[1:0:1]:[35:0:35]',
                str('this {0}', '[2:0:2]:[27:0:27]',
                    tag('[8:0:8]:[26:0:26]',
                        str('is', '[9:0:9]:[9:0:9]'),
                        str('a parsing', '[14:0:14]:[14:0:14]')
                    )
                ),
                str('test', '[28:0:28]:[28:0:28]')
            )
        )
    }
] as Array<Promise<TestCase> | TestCase>);

describe('function bbtag.parse', async () => {
    for (const testCase of await testCases) {
        switch (testCase.kind) {
            case 'success':
                it(`should successfully parse ${testCase.name || JSON.stringify(testCase.input)}`, () => {
                    // arrange

                    // act
                    const result = parse(testCase.input);

                    // assert
                    expect(result).to.deep.equal(testCase.expected);
                });
                break;
            case 'fail':
                it(`should fail to parse ${testCase.name || JSON.stringify(testCase.input)} because ${testCase.expected}`, () => {
                    // arrange

                    // act
                    const test = () => parse(testCase.input);

                    // assert
                    expect(test).to.throw(testCase.expected);
                });
                break;
        }
    }
});