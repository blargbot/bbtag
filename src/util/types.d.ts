export type Awaitable<T> = Promise<T> | T;
export type IsSuperOf<T1 extends T3, T2, T3> = T3 & (T2 extends T1 ? T3 : undefined);
