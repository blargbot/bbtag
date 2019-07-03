// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { AggregateError, ChainedError, IStringToken, ISubtagToken, SubtagContext, SubtagError } from '../../src/structures';
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
                expect(result.message).to.be.equal(message || '');
                expect(result.innerError).to.be.equal(innerError);
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
                expect(result.message).to.be.equal(message || '');
                expect(result.innerErrors).to.have.ordered.members([...innerErrors]);
            }
        );
    }
});

describe('class SubtagError', () => {
    const testCases: Array<{ context: SubtagContext, token: ISubtagToken | IStringToken, message?: string, innerError: any }> = [
        { context: new MockExecutionContext(), token: str('text'), message: undefined, innerError: undefined },
        { context: new MockExecutionContext(), token: tag(str('text')), message: undefined, innerError: undefined },
        { context: new MockExecutionContext(), token: str('text'), message: 'test', innerError: undefined },
        { context: new MockExecutionContext(), token: tag(str('text')), message: 'test', innerError: undefined },
        { context: new MockExecutionContext(), token: str('text'), message: undefined, innerError: 12345 },
        { context: new MockExecutionContext(), token: tag(str('text')), message: undefined, innerError: 12345 },
        { context: new MockExecutionContext(), token: str('text'), message: 'test', innerError: 12345 },
        { context: new MockExecutionContext(), token: tag(str('text')), message: 'test', innerError: 12345 }
    ];

    for (const { context, token, message, innerError } of testCases) {
        it(`should successfully construct ` +
            `${'name' in token ? '(subtag token)' : '(string token)'}` +
            `${message === undefined ? '(no message)' : ''}` +
            `${innerError === undefined ? '(no inner error)' : ''}`,
            () => {
                // arrange

                // act
                const result = new SubtagError(context, token, message, innerError);

                // assert
                expect(result.message).to.be.equal(message || '');
                expect(result.innerError).to.be.equal(innerError);
                expect(result.context).to.be.equal(context);
                expect(result.token).to.be.equal(token);
            }
        );
    }
});