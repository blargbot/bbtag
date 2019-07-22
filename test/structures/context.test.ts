// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { IExecutionContextArgs, SubtagContext } from '../../src/structures';
import { MockEngine, MockSubtag } from '../testHelpers/mocks';

describe('class ExecutionContext', () => {
    it('should successfully construct', () => {
        // arrange
        const engine = new MockEngine();
        const name = 'testName';
        const args: IExecutionContextArgs<SubtagContext> = {
            scope: 'test'
        };
        engine.subtags.push(new MockSubtag<SubtagContext>(SubtagContext, name));

        // act
        const result = new SubtagContext(engine, name, args);

        // assert
        expect(result.database).to.equal(engine.database);
        expect(result.engine).to.equal(engine);
        expect([...result.subtags]).to.have.ordered.members(engine.subtags);
        expect(result.tagName).to.equal(name);
        expect(result.scope).to.equal(args.scope);
    });
});