import { Enumerable } from '../util';
import { ISubtagError, SubtagResult, SubtagResultTypeMap } from './types';

const sampleError: ISubtagError = { message: undefined!, context: undefined!, token: undefined! };
const errorKeys = Enumerable.from(Object.keys(sampleError));

const check: { [K in keyof SubtagResultTypeMap]: (target: SubtagResult) => target is SubtagResultTypeMap[K] } = {
    string(target: SubtagResult): target is SubtagResultTypeMap['string'] {
        return typeof target === 'string';
    },
    number(target: SubtagResult): target is SubtagResultTypeMap['number'] {
        return typeof target === 'number';
    },
    boolean(target: SubtagResult): target is SubtagResultTypeMap['boolean'] {
        return typeof target === 'boolean';
    },
    array(target: SubtagResult): target is SubtagResultTypeMap['array'] {
        return Array.isArray(target);
    },
    null(target: SubtagResult): target is SubtagResultTypeMap['null'] {
        return target === undefined || target === null;
    },
    error(target: SubtagResult): target is SubtagResultTypeMap['error'] {
        if (typeof target !== 'object' || target === null) {
            return false;
        }

        return errorKeys.isDataEqual(Object.keys(target));
    }
};

export default check;