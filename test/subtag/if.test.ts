import { expect } from 'chai';
import { If } from '../../dist/subtags/general/system/if';
import { Context, BBSubTag, parse, Engine, SubTag, errors, SubTagError } from '../../dist';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { runTest, contexts, checkBackwardsCompat, checkArgRange } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new If(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    checkBackwardsCompat(subtag, 'if');
    checkArgRange(context, subtag, 2, 5);

    it('should accept a boolean and a `then`', async () => {
        await runTest(context, subtag,
            {
                input: ['true', 'success'],
                expected: 'success',
                echo: ['true', 'success']
            },
            {
                input: ['false', 'failure'],
                expected: '',
                echo: ['false']
            },
            {
                input: ['notABool', 'failure'],
                expected: errors.value.notABool('notABool'),
                echo: ['notABool'],
                errors: 1
            });
    });

    it('should accept a boolean, a `then` and an `else`', async () => {
        await runTest(context, subtag,
            {
                input: ['true', 'success', 'failure'],
                expected: 'success',
                echo: ['true', 'success']
            },
            {
                input: ['false', 'failure', 'success'],
                expected: 'success',
                echo: ['false', 'success']
            },
            {
                input: ['notABool', 'failure', 'failure'],
                expected: errors.value.notABool('notABool'),
                echo: ['notABool'],
                errors: 1
            });
    });

    it('should accept a `value1`, an `operator`, a `value2` and a `then`', async () => {
        await runTest(context, subtag,
            {
                input: ['true', '==', 'true', 'success'],
                expected: 'success',
                echo: ['true', '==', 'true', 'success']
            },
            {
                input: ['true', '!=', 'true', 'failure'],
                expected: '',
                echo: ['true', '!=', 'true']
            },
            {
                input: ['true', 'notAnOperator', 'true', 'failure'],
                expected: errors.value.notAComparer(['true', 'notAnOperator', 'true']),
                echo: ['true', 'notAnOperator', 'true'],
                errors: 1
            });
    });

    it('should accept a `value1`, an `operator`, a `value2`, a `then` and an `else`', async () => {
        await runTest(context, subtag,
            {
                input: ['true', '==', 'true', 'success', 'failure'],
                expected: 'success',
                echo: ['true', '==', 'true', 'success']
            },
            {
                input: ['true', '!=', 'true', 'failure', 'success'],
                expected: 'success',
                echo: ['true', '!=', 'true', 'success']
            },
            {
                input: ['true', 'notAnOperator', 'true', 'failure', 'failure'],
                expected: errors.value.notAComparer(['true', 'notAnOperator', 'true']),
                echo: ['true', 'notAnOperator', 'true'],
                errors: 1
            });
    });
}