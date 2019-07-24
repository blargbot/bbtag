// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { DatabaseValue, IPartialVariableScope, SubtagContext, VariableScope } from '../../..';
import { ctx } from '../../testUtils';

describe('class VariableScope', () => {
    it('should correctly apply minimal overrides', () => {
        // arrange
        const options: IPartialVariableScope = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            * getKey(): IterableIterator<string> { }
        };

        // act
        const result = new VariableScope(options);

        // assert
        for (const key of Object.keys(options)) {
            expect(result).to.have.property(key, (options as any)[key]);
        }
    });
    it('should correctly apply all overrides', () => {
        // arrange
        const options: IPartialVariableScope = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            * getKey(): IterableIterator<string> { },
            delete(): void { },
            set(): void { },
            setBulk(): void { },
            get(): void { }
        };

        // act
        const result = new VariableScope(options);

        // assert
        for (const key of Object.keys(options)) {
            expect(result).to.have.property(key, (options as any)[key]);
        }
    });
    it('should correctly set', async () => {
        // arrange
        const keys = ['a', 'b', 'c'];
        const context = ctx();
        const key = 'TESTKey';
        const values = [1, 'a', false];
        const options: IPartialVariableScope<SubtagContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: SubtagContext, k: string): string[] {
                expect(c).to.equal(context);
                expect(k).to.equal(key);
                return keys;
            }
        };
        const scope = new VariableScope(options);
        let callCount = 0;
        context.engine.database.set = (p: Iterable<string>, v: DatabaseValue) => {
            expect(p).to.equal(keys);
            expect(v).to.equal(values);
            callCount++;
        };

        // act
        const result = await scope.set(context, key, values);

        // assert
        expect(result).to.be.undefined;
        expect(callCount).to.equal(1);
    });
    it('should correctly setBulk', async () => {
        // arrange
        const keys = ['a', 'b', 'c'];
        const context = ctx();
        const values: Array<[string, DatabaseValue]> = [['key1', [1, 'a', false]], ['key2', 10]];
        const options: IPartialVariableScope<SubtagContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: SubtagContext, k: string): string[] {
                expect(c).to.equal(context);
                expect(k).to.be.oneOf(values.map(v => v[0]));
                return keys;
            }
        };
        const scope = new VariableScope(options);
        let callCount = 0;
        context.engine.database.setBulk = (v: Iterable<[string, DatabaseValue]>) => {
            expect([...v]).to.deep.equal(values.map(e => [keys, e[1]]));
            callCount++;
        };

        // act
        const result = await scope.setBulk(context, values);

        // assert
        expect(result).to.be.undefined;
        expect(callCount).to.equal(1);
    });
    it('should correctly get', async () => {
        // arrange
        const keys = ['a', 'b', 'c'];
        const context = ctx();
        const key = 'TESTKey';
        const values = [1, 'a', false];
        const options: IPartialVariableScope<SubtagContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: SubtagContext, k: string): string[] {
                expect(c).to.equal(context);
                expect(k).to.equal(key);
                return keys;
            }
        };
        const scope = new VariableScope(options);
        context.engine.database.get = (p: Iterable<string>) => {
            expect(p).to.equal(keys);
            return values;
        };

        // act
        const result = await scope.get(context, key);

        // assert
        expect(result).to.eq(values);
    });
    it('should correctly delete', async () => {
        // arrange
        const keys = ['a', 'b', 'c'];
        const context = ctx();
        const key = 'TESTKey';
        const options: IPartialVariableScope<SubtagContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: SubtagContext, k: string): string[] {
                expect(c).to.equal(context);
                expect(k).to.equal(key);
                return keys;
            }
        };
        const scope = new VariableScope(options);
        let callCount = 0;
        context.engine.database.delete = (p: Iterable<string>) => {
            expect(p).to.equal(keys);
            callCount++;
        };

        // act
        const result = await scope.delete(context, key);

        // assert
        expect(result).to.be.undefined;
        expect(callCount).to.equal(1);
    });
});