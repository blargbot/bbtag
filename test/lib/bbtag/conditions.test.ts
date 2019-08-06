import { expect } from 'chai';
import conditions from '../../../lib/bbtag/conditions';
import { IStringToken } from '../../../lib/bbtag/types';

type TestCase =
    | { kind: 'success', input: string, expect: IStringToken[][], reject: IStringToken[][] }
    | { kind: 'fail', input: string, expect?: undefined, reject?: undefined };

function tokens(count: number): IStringToken[] {
    return new Array<IStringToken>(count).fill({ format: 'testing', range: 'aaaaaaa' as any, subtags: [] });
}

const testCases: TestCase[] = [
    { kind: 'success', input: '0', expect: [0].map(tokens), reject: [1, 2, 3, 4, 5, 6, 7, 8, 10].map(tokens) },
    { kind: 'success', input: '5', expect: [5].map(tokens), reject: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '= 5', expect: [5].map(tokens), reject: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '== 5', expect: [5].map(tokens), reject: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '=== 5', expect: [5].map(tokens), reject: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '!5', expect: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens), reject: [5].map(tokens) },
    { kind: 'success', input: '!= 5', expect: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens), reject: [5].map(tokens) },
    { kind: 'success', input: '!== 5', expect: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map(tokens), reject: [5].map(tokens) },
    { kind: 'success', input: '< 5', expect: [0, 1, 2, 3, 4].map(tokens), reject: [5, 6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '<= 5', expect: [0, 1, 2, 3, 4, 5].map(tokens), reject: [6, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '> 5', expect: [6, 7, 8, 9, 10].map(tokens), reject: [0, 1, 2, 3, 4, 5].map(tokens) },
    { kind: 'success', input: '>= 5', expect: [5, 6, 7, 8, 9, 10].map(tokens), reject: [0, 1, 2, 3, 4].map(tokens) },
    { kind: 'success', input: '3 - 7', expect: [3, 4, 5, 6, 7].map(tokens), reject: [0, 1, 2, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '3! - 7', expect: [4, 5, 6, 7].map(tokens), reject: [0, 1, 2, 3, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '3 - 7!', expect: [3, 4, 5, 6].map(tokens), reject: [0, 1, 2, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '3! - 7!', expect: [4, 5, 6].map(tokens), reject: [0, 1, 2, 3, 7, 8, 9, 10].map(tokens) },
    { kind: 'success', input: '2,4,6,8', expect: [2, 4, 6, 8].map(tokens), reject: [0, 1, 3, 5, 7, 9, 10].map(tokens) },
    { kind: 'fail', input: 'abc' },
    { kind: 'fail', input: '1a2' }
];

describe('const bbtag.conditions', () => {
    describe('function parse', () => {
        for (const testCase of testCases) {
            switch (testCase.kind) {
                case 'success':
                    it(`should correctly parse ${JSON.stringify(testCase.input)}`, () => {
                        // arrange

                        // act
                        const result = conditions.parse(testCase.input);

                        // assert
                        for (const args of testCase.expect) { expect(result(args)).to.be.true; }
                        for (const args of testCase.reject) { expect(result(args)).to.be.false; }
                    });
                    break;
                case 'fail':
                    it(`should fail to parse ${JSON.stringify(testCase.input)}`, () => {
                        // arrange

                        // act
                        const test = () => conditions.parse(testCase.input);

                        // assert
                        expect(test).to.throw();
                    });
            }
        }
    });
});