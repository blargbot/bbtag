// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { ExecutionContext, IExecutionContextArgs } from '../../src/structures';
import { MockEngine, MockSubtag } from '../test helpers/mocks';

describe('class ExecutionContext', () => {
    it('should successfully construct', () => {
        // arrange
        const engine = new MockEngine();
        const name = 'testName';
        const args: IExecutionContextArgs<ExecutionContext> = {
            scope: 'test'
        };
        engine.subtags.push(new MockSubtag<ExecutionContext>(ExecutionContext, name));

        // act
        const result = new ExecutionContext(engine, name, args);

        // assert
        expect(result.database).to.equal(engine.database);
        expect(result.engine).to.equal(engine);
        expect([...result.subtags]).to.have.ordered.members(engine.subtags);
        expect(result.tagName).to.equal(name);
        expect(result.scope).to.equal(args.scope);
    });
});