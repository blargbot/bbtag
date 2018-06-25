import { expect } from 'chai';
import { Engine } from '../dist/engine';
import { MockDb } from './mocks/mockDatabase';
import { MockSubTag } from './mocks/subtags/mockSubTag';

describe('Engine', () => {
    describe('#register()', () => {
        it('should successfully register subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });

            // act
            engine.register(MockSubTag);

            // assert
            expect(engine.subtags.members).to.have.length(1);
            expect(engine.subtags.members[0]).to.be.instanceof(MockSubTag);
        });
        it('should not register duplicate subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.register(MockSubTag);

            // act
            engine.register(MockSubTag);

            // assert
            expect(engine.subtags.members).to.have.length(1);
        });
    });
    describe('#remove()', () => {
        it('should successfully remove subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.subtags.add(new MockSubTag(engine));

            // act
            engine.remove(MockSubTag);

            // assert
            expect(engine.subtags.members).to.have.length(0);
        });
        it('should remove multiple subtags of the same instance', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.subtags.add(new MockSubTag(engine));
            engine.subtags.add(new MockSubTag(engine));

            // act
            engine.remove(MockSubTag);

            // assert
            expect(engine.subtags.members).to.have.length(0);
        });
    });
});