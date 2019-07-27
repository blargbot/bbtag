// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { ISubtagContextArgs, SubtagContext } from '../../../lib';
import { eng, MockSubtag } from '../../testUtils';

describe('class ' + SubtagContext.name, () => {
    it('should successfully construct', () => {
        // arrange
        const engine = eng();
        const name = 'testName';
        const args: ISubtagContextArgs = {
            scope: 'test',
            name: 'testName',
            arguments: []
        };
        engine.subtags.register(new MockSubtag(SubtagContext, name));

        // act
        const result = new SubtagContext(engine, args);

        // assert
        expect(result.engine).to.equal(engine);
        expect([...result.subtags]).to.have.members([...engine.subtags]);
        expect(result.tagName).to.equal(name);
        expect(result.scope).to.equal(args.scope);
    });
});