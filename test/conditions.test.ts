import { expect } from 'chai';
import { hasCount, hasCounts, BBSubTag } from '../dist';
import { RawArguments } from '../dist/structures/subtag';

function mockSubTagArgs(args: any[]): BBSubTag {
    return <BBSubTag><any>{ args };
}

describe('SubtagConditions', () => {
    describe('#hasCount()', () => {
        async function runTest(condition: number | string, cases: { args: any[], expect: boolean }[]) {
            // arrange
            let check = hasCount(condition);

            for (const entry of cases) {
                // act
                let subtag = mockSubTagArgs(entry.args);
                let result = await check(subtag, {});

                // assert
                expect(result).to.be.equal(entry.expect);
            }
        }
        it('should accept number arguments', async () => {
            await runTest(1, [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [], expect: false }
            ]);
        });
        it('should accept `\\d+` arguments', async () => {
            await runTest('1', [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [], expect: false }
            ]);
        });
        it('should accept `>\\d+` arguments', async () => {
            await runTest('>1', [
                { args: [1], expect: false },
                { args: [1, 2], expect: true },
                { args: [1, 2, 3], expect: true },
                { args: [], expect: false }
            ]);
        });
        it('should accept `<\\d+` arguments', async () => {
            await runTest('<2', [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [1, 2, 3], expect: false },
                { args: [], expect: true }
            ]);
        });
        it('should accept `>=\\d+` arguments', async () => {
            await runTest('>=2', [
                { args: [1], expect: false },
                { args: [1, 2], expect: true },
                { args: [1, 2, 3], expect: true },
                { args: [], expect: false }
            ]);
        });
        it('should accept `<=\\d+` arguments', async () => {
            await runTest('<=1', [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [1, 2, 3], expect: false },
                { args: [], expect: true }
            ]);
        });
        it('should accept `==\\d+` arguments', async () => {
            await runTest('==1', [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [], expect: false }
            ]);
        });
        it('should accept `=\\d+` arguments', async () => {
            await runTest('=1', [
                { args: [1], expect: true },
                { args: [1, 2], expect: false },
                { args: [], expect: false }
            ]);
        });
        it('should accept `!=\\d+` arguments', async () => {
            await runTest('!=1', [
                { args: [1], expect: false },
                { args: [1, 2], expect: true },
                { args: [], expect: true }
            ]);
        });
        it('should accept `!\\d+` arguments', async () => {
            await runTest('!1', [
                { args: [1], expect: false },
                { args: [1, 2], expect: true },
                { args: [], expect: true }
            ]);
        });
        it('should accept range arguments', async () => {
            await runTest('1-2', [
                { args: [1], expect: true },
                { args: [1, 2], expect: true },
                { args: [1, 2, 3], expect: false },
                { args: [], expect: false }
            ]);
        });
    });
    describe('#hasCounts()', () => {
        it('should allow multiple counts', async () => {
            // arrange
            let check = hasCounts(1, 2, 5);
            let cases = [
                { args: [], expect: false },
                { args: [1], expect: true },
                { args: [1, 2], expect: true },
                { args: [1, 2, 3], expect: false },
                { args: [1, 2, 3, 4], expect: false },
                { args: [1, 2, 3, 4, 5], expect: true },
                { args: [1, 2, 3, 4, 5, 6], expect: false },
            ];

            for (const entry of cases) {
                // act
                let subtag = mockSubTagArgs(entry.args);
                let result = await check(subtag, {});

                // assert
                expect(result).to.be.equal(entry.expect);
            }
        });
    });
});