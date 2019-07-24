// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { AggregateError } from '../../..';

describe('class AggregateError', () => {
    const testCases: Array<{ message?: string, innerErrors: any[] }> = [
        { message: undefined, innerErrors: [] },
        { message: 'test', innerErrors: [] },
        { message: undefined, innerErrors: [12345, 'abc', {}] },
        { message: 'test', innerErrors: [12345, 'abc', {}] }
    ];

    for (const { message, innerErrors } of testCases) {
        it(`should successfully construct ` +
            `${message === undefined ? '(no message)' : ''}` +
            `${innerErrors.length === 0 ? '(no inner errors)' : ''}`,
            () => {
                // arrange

                // act
                const result = new AggregateError(message, ...innerErrors);

                // assert
                expect(result.message).to.equal(message || '');
                expect(result.innerErrors).to.have.ordered.members([...innerErrors]);
            }
        );
    }
});