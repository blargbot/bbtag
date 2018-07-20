import { expect } from 'chai';
import { Switch } from '../../dist/subtags/general/system/switch';
import { Context, errors, BBSubTag, parse, Engine, SubTag, SubTagError } from '../../dist';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkArgRange, contexts, checkBackwardsCompat, runTest } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Switch(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    checkBackwardsCompat(subtag, 'switch');
    checkArgRange(context, subtag, 2, null);

    it('should successfully switch to the correct case', async () => {
        await runTest(context, subtag,
            {
                input: ['case1', 'case1', 'success'],
                expected: 'success',
                echo: ['case1', 'case1', 'success']
            },
            {
                input: ['case2', 'case1', 'failure', 'case2', 'success'],
                expected: 'success',
                echo: ['case2', 'case1', 'case2', 'success']
            },
            {
                input: ['case1', 'case1', 'success', 'case2', 'failure'],
                expected: 'success',
                echo: ['case1', 'case1', 'case2', 'success']
            },
            {
                input: ['casemissing', 'case1', 'success', 'case2', 'failure'],
                expected: '',
                echo: ['casemissing', 'case1', 'case2']
            },
            {
                input: ['casemissing', 'case1', 'failure', 'case2', 'failure', 'success'],
                expected: 'success',
                echo: ['casemissing', 'case1', 'case2', 'success']
            })
    });

    it('should support arrays as the case', async () => {
        await runTest(context, subtag,
            {
                input: ['case1', '["case1","case2"]', 'success'],
                expected: 'success',
                echo: ['case1', '["case1","case2"]', 'success']
            },
            {
                input: ['case3', '["case1","case2"]', 'failure', 'case3', 'success'],
                expected: 'success',
                echo: ['case3', '["case1","case2"]', 'case3', 'success']
            },
            {
                input: ['case1', 'case1', 'success', '["case2","case3"]', 'failure'],
                expected: 'success',
                echo: ['case1', 'case1', '["case2","case3"]', 'success']
            },
            {
                input: ['case3', 'case1', 'failure', '["case2","case3"]', 'success'],
                expected: 'success',
                echo: ['case3', 'case1', '["case2","case3"]', 'success']
            },
            {
                input: ['casemissing', '["case1","case2"]', 'failure', 'case3', 'failure'],
                expected: '',
                echo: ['casemissing', '["case1","case2"]', 'case3']
            },
            {
                input: ['casemissing', '["case1","case2"]', 'failure', 'case3', 'failure', 'success'],
                expected: 'success',
                echo: ['casemissing', '["case1","case2"]', 'case3', 'success']
            })
    });

    it('should always pick the first match', async () => {
        await runTest(context, subtag,
            {
                input: ['case1', 'case1', 'success', 'case1', 'failure'],
                expected: 'success',
                echo: ['case1', 'case1', 'case1', 'success']
            })
    });
}