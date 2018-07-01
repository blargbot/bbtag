import { expect } from 'chai';
import { Bool } from '../../dist/subtags/general/system/bool';
import { Context, BBSubTag, parse, Engine, SubTag, errors } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';

export function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let bool = new Bool(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should execute all inner arguments', async () => {
        // arrange
        let expected = ['a', 'b', 'c'];
        let context = new Context(engine);
        let subtag = parse('{System.bool;{mock.echo;a};{mock.echo;b};{mock.echo;c}}').parts[0] as BBSubTag;

        // act
        await bool.execute(subtag, context);

        // assert
        expect(Echo.values).to.deep.equal(expected);
    })
    it('should have global names for backwards compatibility', async () => {
        // arrange
        let expected = ['bool'];

        // act & assert
        expect(bool.globalNames).to.deep.equal(expected);
    });
    it('should return not enough args when given <2 args', async () => {
        // arrange
        let subtag = parse('{System.bool}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.notEnough(2);

        // act
        let result = await bool.execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
    it('should return too many args when given >3 args', async () => {
        // arrange
        let subtag = parse('{System.bool;a;b;c;d}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.tooMany(3);

        // act
        let result = await bool.execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
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
                { a: '10test', b: 'test', e: true },
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
                { a: '10test', b: 'test', e: true },
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
                { a: '10test', b: 'test', e: false },
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
                { a: '10test', b: 'test', e: false },
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
                    let subtag = parse(`{System.bool;${scenario.join(';')}}`).parts[0] as BBSubTag;
                    let context = new Context(engine);

                    // act
                    let result = await bool.execute(subtag, context);

                    // assert
                    expect(result).to.equal(String(entry.e), `'${subtag.content}' should correctly execute`);
                }
            }
        })
    }
}