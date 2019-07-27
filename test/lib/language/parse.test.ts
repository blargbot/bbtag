// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { bbtag, IStringToken } from '../../../lib';
import { str, stripStrToken, tag } from '../../testUtils';

describe('function parse', () => {
    const testCases: Array<{ input: string, expected: string | IStringToken }> = [
        { input: 'this is} a test', expected: 'Unpaired \'}\'' },
        { input: 'this {is;{a;test}', expected: 'Unpaired \'{\'' },
        { input: '', expected: str('') },
        { input: 'this is a test', expected: str('this is a test') },
        { input: 'this is; a test', expected: str('this is; a test') },
        { input: 'this {is;a} test', expected: str('this {0} test', tag(str('is'), str('a'))) },
        { input: ' { this { is ; a parsing } ; test } ', expected: str('{0}', tag(str('this {0}', tag(str('is'), str('a parsing'))), str('test'))) }
    ];

    for (const { input, expected } of testCases) {
        if (typeof expected === 'string') {
            it(`should fail to parse ${input} because ${expected}`, () => {
                // arrange
                const test = () => bbtag.parse(input);

                // act

                // assert
                expect(test).to.throw(expected);
            });
        } else {
            it(`should correctly parse ${input}`, () => {
                // arrange

                // act
                const result = bbtag.parse(input);

                // assert
                expect(stripStrToken(result)).to.deep.equal(stripStrToken(expected));
            });
        }
    }
});