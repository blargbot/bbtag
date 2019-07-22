// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { DatabaseValue } from '../../src/external';
import { IPartialVariableScope, VariableScope, variableScopes } from '../../src/structures';
import { MockExecutionContext } from '../testHelpers/mocks';

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
        const context = new MockExecutionContext();
        const key = 'TESTKey';
        const values = [1, 'a', false];
        const options: IPartialVariableScope<MockExecutionContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: MockExecutionContext, k: string): string[] {
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
        const context = new MockExecutionContext();
        const values: Array<[string, DatabaseValue]> = [['key1', [1, 'a', false]], ['key2', 10]];
        const options: IPartialVariableScope<MockExecutionContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: MockExecutionContext, k: string): string[] {
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
        const context = new MockExecutionContext();
        const key = 'TESTKey';
        const values = [1, 'a', false];
        const options: IPartialVariableScope<MockExecutionContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: MockExecutionContext, k: string): string[] {
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
        const context = new MockExecutionContext();
        const key = 'TESTKey';
        const options: IPartialVariableScope<MockExecutionContext> = {
            description: 'abc',
            name: 'name',
            prefix: 'x',
            getKey(c: MockExecutionContext, k: string): string[] {
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

describe('const variableScopes', () => {
    describe('Global', () => {
        const scope = variableScopes.find(s => s.prefix === '*');
        if (scope === undefined) {
            throw new Error('Unable to find global scope with prefix \'*\'');
        }
        it('should correctly getKey', () => {
            // arrange
            const context = new MockExecutionContext();
            const key = 'THIS is a test key';

            // act
            const result = scope.getKey(context, key);

            // assert
            expect(result).to.deep.equal(['GLOBAL', key]);
        });
        it('should not override any methods', () => {
            // arrange
            const methods: Array<keyof VariableScope> = ['get', 'set', 'setBulk', 'delete'];

            // act

            // assert
            for (const name of methods) {
                expect(scope).to.have.property(name, VariableScope.prototype[name]);
            }
        });
    });
    describe('Local', () => {
        const scope = variableScopes.find(s => s.prefix === '');
        if (scope === undefined) {
            throw new Error('Unable to find local scope with prefix \'\'');
        }
        it('should correctly getKey', () => {
            // arrange
            const context = new MockExecutionContext();
            const key = 'THIS is a test key';

            // act
            const result = scope.getKey(context, key);

            // assert
            expect(result).to.deep.equal(['LOCAL', context.tagName, context.scope, key]);
        });
        it('should not override any methods', () => {
            // arrange
            const methods: Array<keyof VariableScope> = ['get', 'set', 'setBulk', 'delete'];

            // act

            // assert
            for (const name of methods) {
                expect(scope).to.have.property(name, VariableScope.prototype[name]);
            }
        });
    });
    describe('Temporary', () => {
        const scope = variableScopes.find(s => s.prefix === '~');
        if (scope === undefined) {
            throw new Error('Unable to find temporary scope with prefix \'~\'');
        }
        it('should correctly getKey', () => {
            // arrange
            const context = new MockExecutionContext();
            const key = 'THIS is a test key';

            // act
            const result = scope.getKey(context, key);

            // assert
            expect(result).to.deep.equal([]);
        });
        it('should not touch the database on a set', () => {
            // arrange
            const context = new MockExecutionContext();
            context.engine.database.set = () => { success = false; };
            let success = true;

            // act
            scope.set(context, 'abc', 1234567890);

            // assert
            expect(success).to.be.true;
        });
        it('should not touch the database on a get', () => {
            // arrange
            const context = new MockExecutionContext();
            context.engine.database.get = () => { success = false; };
            let success = true;

            // act
            scope.get(context, 'abc');

            // assert
            expect(success).to.be.true;
        });
        it('should not touch the database on a delete', () => {
            // arrange
            const context = new MockExecutionContext();
            context.engine.database.delete = () => { success = false; };
            let success = true;

            // act
            scope.delete(context, 'abc');

            // assert
            expect(success).to.be.true;
        });
        it('should not touch the database on a setBulk', () => {
            // arrange
            const context = new MockExecutionContext();
            context.engine.database.setBulk = () => { success = false; };
            let success = true;

            // act
            scope.setBulk(context, [['abc', 12344567890]]);

            // assert
            expect(success).to.be.true;
        });
    });
});