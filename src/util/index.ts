import * as serialization from './serializer';
import * as stringUtil from './stringUtil';
import { default as tryGet } from './tryGet';

export const util = {
    ...stringUtil,
    serialization,
    tryGet
};

export { TryGetResult, ITryGetFailure, ITryGetSuccess } from './tryGet';

export default util;