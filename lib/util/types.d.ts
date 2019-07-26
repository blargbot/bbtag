export type Awaitable<T> = Promise<T> | T;

/**
 * Checks if `T2` derives from `T1`. 
 * 
 * This is a workaround for typescripts lack of contravariance
 * @example
 * class A           { prop1: string }
 * class B extends A { prop2: string }
 * class C extends B { prop3: string }
 * class D extends C { prop4: string }
 * class E           {               }
 * 
 * function test<T extends IsSupertypeOf<T, C>>(): number { return 0; }
 * 
 * const a = test<A>(); // Compiles
 * const b = test<B>(); // Compiles
 * const c = test<C>(); // Compiles
 * const d = test<D>(); // Fails
 */
export type IsSupertypeOf<T1 extends TRoot, T2 extends TRoot, TRoot extends object = object> = TRoot & (T2 extends T1 ? TRoot : void);