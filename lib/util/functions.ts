export const functions = {
    blank(..._args: any[]): void { },
    never(..._args: any[]): never { throw new Error('This function should never have been called'); },
    identity<T>(x: T): T { return x; },
    true(..._args: any[]): true { return true; },
    false(..._args: any[]): false { return false; },
    toString(value: {}): string { return value.toString(); },
    NaN: {
        isReallyNaN(value: any): value is typeof NaN { return typeof value === 'number' && value !== value; },
        eq(left: any, right: any): boolean { return left === right || (functions.NaN.isReallyNaN(left) && functions.NaN.isReallyNaN(right)); },
        ne(left: any, right: any): boolean { return !functions.NaN.eq(left, right); }
    }
};

export default functions;