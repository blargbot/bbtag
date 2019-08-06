import { expect } from 'chai';
import errors from '../../../lib/bbtag/errors';
import { ErrorFunc, IStringToken, ISubtagError, ISubtagErrorContext, ISubtagToken } from '../../../lib/bbtag/types';
import { ISubtag } from '../../../lib/structures/subtag';

function mockContext(expectedToken: IStringToken | ISubtagToken, expectedMessage: string, callback: (error: ISubtagError) => void): ISubtagErrorContext {
    return {
        error(this: ISubtagErrorContext, token: IStringToken | ISubtagToken, message: string): ISubtagError {
            expect(token).to.equal(expectedToken);
            expect(message).to.equal(expectedMessage);
            const result = { context: this, token, message };
            callback(result);
            return result;
        },
        fallback: undefined
    };
}

function positiveTest(message: string, execute: (context: ISubtagErrorContext, token: IStringToken | ISubtagToken) => ISubtagError): void {
    // arrange
    const token = { range: '' } as ISubtagToken;
    const context = mockContext(token, message, err => error = err);
    let error: ISubtagError | undefined;

    // act
    const result = execute(context, token);

    // assert
    expect(error).to.not.be.undefined;
    expect(result).to.equal(error);
}

function negativeTest(message: string, execute: (context: ISubtagErrorContext, token: IStringToken | ISubtagToken) => never): void {
    // arrange
    const token = { range: '' } as ISubtagToken;
    const context = mockContext(token, message, err => error = err);
    let error: ISubtagError | undefined;

    // act
    const test = () => execute(context, token);

    // assert
    expect(test).to.throw().which.equals(error);
    expect(error).to.not.be.undefined;
}

function positiveTests(message: string, subject: ErrorFunc): () => void;
function positiveTests<T extends any[]>(message: ((...args: T) => string), subject: ErrorFunc<T>, argsFactory: () => T): () => void;
function positiveTests(message: string | ((...args: any[]) => string), subject: ErrorFunc<any[]>, argsFactory?: () => any[]): () => void {
    const af = argsFactory || (() => []);
    const msg = typeof message === 'string' ? () => message : message;
    return () => {
        it(`should return \`${msg(...[])}\` when given a context and token`, () => {
            const args = af();
            positiveTest(msg(...args), (ctx, tkn) => subject(ctx, tkn, ...args));
        });
        it(`should return \`${msg(...[])}\` when given an args and a token`, () => {
            const args = af();
            const fakeToken = {} as ISubtagToken;
            positiveTest(msg(...args), (ctx, tkn) => subject({ context: ctx, token: fakeToken }, tkn, ...args));
        });
        it(`should return \`${msg(...[])}\` when given an args`, () => {
            const args = af();
            positiveTest(msg(...args), (ctx, tkn) => subject({ context: ctx, token: tkn }, ...args));
        });
    };
}

function negativeTests(message: string, subject: (...args: any[]) => never): () => void;
function negativeTests<T extends any[]>(message: ((...args: T) => string), subject: (...args: any[]) => never, argsFactory: () => T): () => void;
function negativeTests(message: string | ((...args: any[]) => string), subject: (...args: any[]) => never, argsFactory?: () => any[]): () => void {
    const af = argsFactory || (() => []);
    const msg = typeof message === 'string' ? () => message : message;
    return () => {
        it(`should throw \`${msg(...[])}\` when given a context and token`, () => {
            const args = af();
            negativeTest(msg(...args), (ctx, tkn) => subject(ctx, tkn, ...args));
        });
        it(`should throw \`${msg(...[])}\` when given an args and a token`, () => {
            const args = af();
            const fakeToken = {} as ISubtagToken;
            negativeTest(msg(...args), (ctx, tkn) => subject({ context: ctx, token: fakeToken }, tkn, ...args));
        });
        it(`should throw \`${msg(...[])}\` when given an args`, () => {
            const args = af();
            negativeTest(msg(...args), (ctx, tkn) => subject({ context: ctx, token: tkn }, ...args));
        });
    };
}

describe('const bbtag.errors', () => {
    describe('const system', () => {
        describe('function internal', positiveTests(
            'Internal Server Error',
            errors.system.internal
        ));
        describe('function unknownSubtag', positiveTests<[string]>(
            name => `Unknown subtag ${name || '{SUBTAGNAME}'}`,
            errors.system.unknownSubtag,
            () => ['testName']
        ));
        const defaultSubtag = { toString(): string { return '{SUBTAGSTRING}'; } } as ISubtag<any>;
        describe('function unknownHandler', positiveTests<[ISubtag<any>]>(
            (subtag = defaultSubtag) => `Missing handler for execution of subtag ${subtag.toString()}`,
            errors.system.unknownHandler,
            () => [{ toString(): string { return '{test subtag;123}'; } } as ISubtag<any>]
        ));
    });
    describe('const types', () => {
        describe('function notNumber', positiveTests(
            'Not a number',
            errors.types.notNumber
        ));
        describe('function notArray', positiveTests(
            'Not an array',
            errors.types.notArray
        ));
        describe('function notBool', positiveTests(
            'Not a boolean',
            errors.types.notBool
        ));
        describe('function notOperator', positiveTests(
            'Invalid operator',
            errors.types.notOperator
        ));
        describe('const array', () => {
            describe('function outOfBounds', positiveTests(
                'Index out of range',
                errors.types.array.outOfBounds
            ));
        });
    });
    describe('function notEnoughArgs', positiveTests(
        'Not enough arguments',
        errors.notEnoughArgs
    ));
    describe('function tooManyArgs', positiveTests(
        'Too many arguments',
        errors.tooManyArgs
    ));
    describe('const throw', () => {
        describe('const system', () => {
            describe('function internal', negativeTests(
                'Internal Server Error',
                errors.throw.system.internal
            ));
            describe('function unknownSubtag', negativeTests<[string]>(
                name => `Unknown subtag ${name || '{SUBTAGNAME}'}`,
                errors.throw.system.unknownSubtag,
                () => ['testName']
            ));
            const defaultSubtag = { toString(): string { return '{SUBTAGSTRING}'; } } as ISubtag<any>;
            describe('function unknownHandler', negativeTests<[ISubtag<any>]>(
                (subtag = defaultSubtag) => `Missing handler for execution of subtag ${subtag.toString()}`,
                errors.throw.system.unknownHandler,
                () => [{ toString(): string { return '{test subtag;123}'; } } as ISubtag<any>]
            ));
        });
        describe('const types', () => {
            describe('function notNumber', negativeTests(
                'Not a number',
                errors.throw.types.notNumber
            ));
            describe('function notArray', negativeTests(
                'Not an array',
                errors.throw.types.notArray
            ));
            describe('function notBool', negativeTests(
                'Not a boolean',
                errors.throw.types.notBool
            ));
            describe('function notOperator', negativeTests(
                'Invalid operator',
                errors.throw.types.notOperator
            ));
            describe('const array', () => {
                describe('function outOfBounds', negativeTests(
                    'Index out of range',
                    errors.throw.types.array.outOfBounds
                ));
            });
        });
        describe('function notEnoughArgs', negativeTests(
            'Not enough arguments',
            errors.throw.notEnoughArgs
        ));
        describe('function tooManyArgs', negativeTests(
            'Too many arguments',
            errors.throw.tooManyArgs
        ));
    });
});
