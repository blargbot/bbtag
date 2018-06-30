import { expect } from 'chai';
import { Comparer } from '../../dist/util';

export function test() {
    let collator = new Intl.Collator();
    describe('#compare()', () => {
        it('should compare correctly', () => {
            // arrange
            let cases = [
                { a: 'This is a test', b: 'This is also a test' }
            ] as Array<{ a: string, b: string, expected?: number }>;

            for (const entry of cases) {
                let expected = typeof entry.expected === 'number' ? entry.expected
                    : collator.compare(entry.a, entry.b);

                // act
                let result = Comparer.Default.compare(entry.a, entry.b);

                // assert
                expect(result, `'${entry.a}' compared to '${entry.b}' should be ${expected}`).to.equal(expected);
            }
        });
    });
}