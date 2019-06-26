export { TryGetResult, ITryGetFailure, ITryGetSuccess } from './tryGet';
import { default as serialization } from './serializer';
import { default as stringUtil } from './stringUtil';
import { default as subtag } from './subtagResults';
import { default as tryGet } from './tryGet';

export default {
    ...stringUtil,
    serialization,
    tryGet,
    subtag
};