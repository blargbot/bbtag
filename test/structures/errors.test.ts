// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { AggregateError, ChainedError, IStringToken, ISubtagToken, SubtagError } from '../../src/structures';
import { MockExecutionContext } from '../test helpers/mocks';
import { str, tag } from '../test helpers/subtag';

describe('class ChainedError', () => {
    const testCases: Array<{ message?: string, innerError?: any }> = [
        { message: undefined, innerError: undefined },
        { message: 'test', innerError: undefined },
        { message: undefined, innerError: 12345 },
        { message: 'test', innerError: 12345 }
    ];

    for (const { message, innerError } of testCases) {
        it(`should successfully construct ` +
            `${message === undefined ? '(no message)' : ''}` +
            `${innerError === undefined ? '(no inner error)' : ''}`,
            () => {
                // arrange

                // act
                const result = new ChainedError(message, innerError);

                // assert
                expect(result.message).to.equal(message || '');
                expect(result.innerError).to.equal(innerError);
            }
        );
    }
});

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

describe('class SubtagError', () => {
    const testCases: Array<{ token: ISubtagToken | IStringToken, message?: string, innerError: any }> = [
        { token: str('text'), message: undefined, innerError: undefined },
        { token: tag(str('text')), message: undefined, innerError: undefined },
        { token: str('text'), message: 'test', innerError: undefined },
        { token: tag(str('text')), message: 'test', innerError: undefined },
        { token: str('text'), message: undefined, innerError: 12345 },
        { token: tag(str('text')), message: undefined, innerError: 12345 },
        { token: str('text'), message: 'test', innerError: 12345 },
        { token: tag(str('text')), message: 'test', innerError: 12345 }
    ];

    for (const { token, message, innerError } of testCases) {
        it(`should successfully construct ` +
            `${'name' in token ? '(subtag token)' : '(string token)'}` +
            `${message === undefined ? '(no message)' : ''}` +
            `${innerError === undefined ? '(no inner error)' : ''}`,
            () => {
                // arrange
                const context = new MockExecutionContext();

                // act
                const result = new SubtagError(context, token, message, innerError);

                // assert
                expect(result.message).to.equal(message || '');
                expect(result.innerError).to.equal(innerError);
                expect(result.context).to.equal(context);
                expect(result.token).to.equal(token);
            }
        );
    }
});