import { Comment } from '../../dist/subtags/general/system/comment';
import { Engine, SubTag } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, contexts, runTest } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Comment(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    checkBackwardsCompat(subtag, '//');

    it('should not return any text', async () => {
        await runTest(context, subtag,
            {
                input: ['this is a test', 'this is still a test'],
                expected: '',
                echo: []
            });
    });
}