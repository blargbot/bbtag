import { default as serialization } from './serializer';
import { default as stringUtil } from './stringUtil';
import { default as subtag } from './subtagResults';
import { default as tryGet } from './tryGet';

export { TryGetResult, ITryGetFailure, ITryGetSuccess } from './tryGet';
export { Enumerable } from './enumerable';
export * from './types';

export default {
    ...stringUtil,
    serialization,
    tryGet,
    subtag
};