export type Awaitable<T> = Promise<T> | T;

/**
 * Checks if `TQuery` logically lies on or between `TParent` and `TChild`. This check is performed using the properties on each type
 * @example
 * class A           { prop1: string }
 * class B extends A { prop2: string }
 * class C extends B { prop3: string }
 * class D extends C { prop4: string }
 * 
 * function test<T extends IsBetween<T, C, A>>(): number { return 0; }
 * 
 * const a = test<A>(); // Compiles
 * const b = test<B>(); // Compiles
 * const c = test<C>(); // Compiles
 * const d = test<D>(); // Fails
 */
export type IsBetween<TQuery extends TParent, TChild extends TParent, TParent> = TParent & (TChild extends TQuery ? TParent : undefined);
