export type selectorFunc<TSource, TResult> = (element: TSource, index: number) => TResult;
export type comparerFunc<TSource> = (left: TSource, right: TSource) => number;
export type predicateFunc<TSource> = (element: TSource, index: number) => boolean;
export type EnumerableSource<T> = T[] | ArrayLike<T> | string | Set<T> | Iterable<T>;