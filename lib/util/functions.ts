export const functions = {
    blank(..._: any[]): void { },
    never(..._: any[]): never { throw new Error('This function should never have been called'); },
    identity<T>(x: T): T { return x; },
    true(..._: any[]): true { return true; },
    false(..._: any[]): false { return false; }
};

export default functions;