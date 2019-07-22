// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { SubtagContext, system } from '../../src';
import { MockEngine, MockSubtag } from '../testHelpers/mocks';

describe('class ExecutionContext', () => {
    it('should successfully construct', () => {
        // arrange
        const engine = new MockEngine();
        const name = 'testName';
        const args: system.ISubtagContextArgs = {
            scope: 'test',
            name: 'testName'
        };
        engine.subtags.register(new MockSubtag<SubtagContext>(SubtagContext, name));

        // act
        const result = new SubtagContext(engine, args);

        // assert
        expect(result.engine).to.equal(engine);
        expect([...result.subtags]).to.have.members([...engine.subtags]);
        expect(result.tagName).to.equal(name);
        expect(result.scope).to.equal(args.scope);
    });
});