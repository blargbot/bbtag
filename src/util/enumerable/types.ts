export type selector<TSource, TResult> = (element: TSource, index: number) => TResult;
export type comparer<TSource> = (left: TSource, right: TSource) => number;
export type predicate<TSource> = (element: TSource, index: number) => boolean;
export type EnumerableSource<T> = T[] | ArrayLike<T> | string | Set<T> | Iterable<T>;