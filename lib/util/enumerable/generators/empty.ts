import { Enumerable, Enumerator } from '..';

export class EmptyEnumerable<T> extends Enumerable<T> {
    public static create<T>(): EmptyEnumerable<T> {
        return new EmptyEnumerable();
    }

    public getEnumerator(): EmptyEnumerator<T> {
        return new EmptyEnumerator<T>();
    }
}

export class EmptyEnumerator<T> extends Enumerator<T> {
    public moveNext(): boolean {
        return false;
    }

    public get current(): T {
        return undefined!;
    }
}