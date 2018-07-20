import { expect } from 'chai';
import { Operator } from '../../dist/subtags/general/system/operator';
import { Context, BBSubTag, parse, Engine, SubTag } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, contexts, runTest } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Operator(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should initially have no operators', () => {
        // assert
        expect(subtag.globalNames).to.have.length(0);
    });

    it('should not allow a direct call', async () => {
        await runTest(context, subtag,
            {
                input: [],
                expected: SubTag.errors.value.notAnOperator('system.operator'),
                echo: [],
                errors: 1
            });
    })
}