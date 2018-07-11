import { expect } from 'chai';
import { Comment } from '../../dist/subtags/general/system/comment';
import { Context, BBSubTag, parse, Engine, SubTag } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Comment(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should have global names for backwards compatibility', async () => {
        // arrange
        let expected = ['//'];

        // act & assert
        expect(subtag.globalNames).to.deep.equal(expected);
    });

    it('should not execute inner arguments', async () => {
        // arrange
        let expected: string[] = [];
        let context = new Context(engine);
        let code = parse('{//;{mock.echo;subtag}}').parts[0] as BBSubTag;

        // act
        await subtag.execute(code, context);

        // assert
        expect(Echo.values).to.deep.equal(expected);
    });

    it('should not return any text', async () => {
        // arrange
        let expected = '';
        let context = new Context(engine);
        let code = parse('{//;this is a test}').parts[0] as BBSubTag;

        // act
        let result = await subtag.execute(code, context);

        // assert
        expect(result).to.equal(expected);
    });
}