import { expect } from 'chai';
import { Comment } from '../../dist/subtags/general/system/comment';
import { Context, BBSubTag, parse, Engine, SubTag } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';

export function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let comment = new Comment(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should not execute inner arguments', async () => {
        // arrange
        let expected: string[] = [];
        let context = new Context(engine);
        let subtag = parse('{//;{mock.echo;comment}}').parts[0] as BBSubTag;

        // act
        await comment.execute(subtag, context);

        // assert
        expect(Echo.values).to.deep.equal(expected);
    });

    it('should not return any text', async () => {
        // arrange
        let expected = '';
        let context = new Context(engine);
        let subtag = parse('{//;this is a test}').parts[0] as BBSubTag;

        // act
        let result = await comment.execute(subtag, context);

        // assert
        expect(result).to.equal(expected);
    });
}