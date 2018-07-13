import { expect } from 'chai';
import { Bool } from '../../dist/subtags/general/system/bool';
import { Context, BBSubTag, parse, Engine, SubTag, errors } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, checkArgRange, contexts, checkLoadOperators } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Bool(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    checkBackwardsCompat(subtag, 'bool');
    checkArgRange(context, subtag, 2, 3);
    checkLoadOperators(e => new Bool(e), Object.keys(Bool.operators));

    let tests = [
        {
            operator: '==',
            cases: [
                { a: 'Test', b: 'Test', e: true },
                { a: 'Test', b: 'test', e: false },
                { a: '1', b: '1', e: true },
                { a: '01', b: '1', e: true },
                { a: '1e3', b: '1000', e: true },
                { a: '10', b: '100', e: false },
                { a: '10test', b: 'test', e: false },
            ]
        },
        {
            operator: '!=',
            cases: [
                { a: 'Test', b: 'Test', e: false },
                { a: 'Test', b: 'test', e: true },
                { a: '1', b: '1', e: false },
                { a: '01', b: '1', e: false },
                { a: '1e3', b: '1000', e: false },
                { a: '10', b: '100', e: true },
                { a: '10test', b: 'test', e: true },
            ]
        },
        {
            operator: '>',
            cases: [
                { a: 'Test', b: 'Test', e: false },
                { a: 'Test', b: 'test', e: true },
                { a: 'test', b: 'Test', e: false },
                { a: '1', b: '1', e: false },
                { a: '02', b: '1', e: true },
                { a: '1e3', b: '1001', e: false },
                { a: '10', b: '100', e: false },
                { a: '10test', b: 'test', e: false },
            ]
        },
        {
            operator: '>=',
            cases: [
                { a: 'Test', b: 'Test', e: true },
                { a: 'Test', b: 'test', e: true },
                { a: 'test', b: 'Test', e: false },
                { a: '1', b: '1', e: true },
                { a: '02', b: '1', e: true },
                { a: '1e3', b: '1001', e: false },
                { a: '10', b: '100', e: false },
                { a: '10test', b: 'test', e: false },
            ]
        },
        {
            operator: '<',
            cases: [
                { a: 'Test', b: 'Test', e: false },
                { a: 'Test', b: 'test', e: false },
                { a: 'test', b: 'Test', e: true },
                { a: '1', b: '1', e: false },
                { a: '02', b: '1', e: false },
                { a: '1e3', b: '1001', e: true },
                { a: '10', b: '100', e: true },
                { a: '10test', b: 'test', e: true },
            ]
        },
        {
            operator: '<=',
            cases: [
                { a: 'Test', b: 'Test', e: true },
                { a: 'Test', b: 'test', e: false },
                { a: 'test', b: 'Test', e: true },
                { a: '1', b: '1', e: true },
                { a: '02', b: '1', e: false },
                { a: '1e3', b: '1001', e: true },
                { a: '10', b: '100', e: true },
                { a: '10test', b: 'test', e: true },
            ]
        },
    ];
    for (const test of tests) {
        it(`should correctly handle the ${test.operator} operator`, async () => {
            for (const entry of test.cases) {
                // arrange
                let cases = [
                    [entry.a, test.operator, entry.b]
                ];

                for (const scenario of cases) {
                    let code = parse(`{System.bool;${scenario.join(';')}}`).parts[0] as BBSubTag;
                    let context = new Context(engine);

                    // act
                    let result = await subtag.execute(code, context);

                    // assert
                    expect(result).to.equal(String(entry.e), `'${code.content}' should correctly execute`);
                }
            }
        })
    }
}