import { functions, Try } from '../util';
import check from './check';
import switchType from './switchType';
import { IBBTagTypeConverter, ISubtagError, ISubtagResultCollection, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SwitchHandlers } from './types';

const util = {
    switch<T>(handlers: SwitchHandlers<T>, defaultResult: () => T): (target: SubtagResult) => T {
        return (target: SubtagResult) => switchType(target, handlers, defaultResult);
    },
    switchTry<T>(handlers: SwitchHandlers<Try.Result<T>>, typeName: string): (value: SubtagResult, defaultValue?: T | ((value: SubtagResult) => T)) => T {
        const errorHandler = (target: SubtagResult) => {
            throw new Error(`${(check.error(target) ? convert.toString : JSON.stringify)(target)} is not convertable to ${typeName}`);
        };
        const trySwitch = util.switch(handlers, Try.failure);
        return (t: SubtagResult, d: T | ((value: SubtagResult) => T) = errorHandler): T => {
            const r = trySwitch(t);
            const f = (typeof d === 'function' ? d : () => d) as (target: SubtagResult) => T;
            return r.success ? r.value : f(t);
        };
    },
    error<T>(handleFallback: SwitchHandlers<T>, noFallback: (error: ISubtagError) => T): (error: ISubtagError) => T {
        return (target: ISubtagError) => {
            if (check.null(target.context.fallback)) {
                return noFallback(target);
            }
            return switchType(target.context.fallback, handleFallback, () => noFallback(target));
        };
    },
    errorToString(error: ISubtagError): string {
        return `\`${error.message}\``;
    },
    isRawArray(value: any): value is ({ n?: string, v: any[] }) {
        return typeof value === 'object' &&
            value !== null &&
            Array.isArray(value.v) &&
            (typeof value.n === 'undefined' || typeof value.n === 'string');
    }
};

const toStringSwitch: SwitchHandlers<string> = {
    string: functions.identity,
    boolean: functions.toString,
    number: functions.toString,
    array: arr => JSON.stringify(arr.name === undefined ? arr : { v: arr, n: arr.name }),
    null: () => ''
};

const toPrimitiveSwitch: SwitchHandlers<SubtagPrimitiveResult> = {
    string: functions.identity,
    number: functions.identity,
    boolean: functions.identity,
    null: functions.identity,
    array: toStringSwitch.array
};

const tryToBooleanSwitch: SwitchHandlers<Try.Result<boolean>> = {
    string: str => {
        const match = /^(?:(true|yes|t|y)|(false|no|f|n))$/i.exec(str);
        if (match !== null) {
            return Try.success(!!match[1]);
        }
        return Try.failed;
    },
    boolean: Try.success
};

const tryToNumberSwitch: SwitchHandlers<Try.Result<number>> = {
    string: str => {
        str = str.replace(/[,\.](?=\d*?[,\.])/g, '').replace(',', '.');
        let result = Number(str);
        if (isNaN(result)) {
            const isInfinity = /^([-+]?)\s*infinity$/i.exec(str);
            if (isInfinity) {
                result = isInfinity[1] === '-' ? -Infinity : Infinity;
            } else if (!/^nan$/i.test(str)) {
                return Try.failed;
            }
        }
        return Try.success(result);
    },
    number: Try.success
};

const tryToArraySwitch: SwitchHandlers<Try.Result<SubtagResultArray>> = {
    string: str => {
        try {
            const obj = JSON.parse(str);
            const arr = Array.isArray(obj) ? { v: obj } : util.isRawArray(obj) ? obj : undefined;
            if (arr !== undefined) {
                const result = arr.v.map(convert.toPrimitive) as SubtagResultArray;
                result.name = arr.n;
                return Try.success(result);
            }

        } catch { }
        return Try.failed;
    },
    array: Try.success
};

toStringSwitch.error = util.error(toStringSwitch, util.errorToString);
toPrimitiveSwitch.error = util.error(toPrimitiveSwitch, util.errorToString);
tryToBooleanSwitch.error = util.error(tryToBooleanSwitch, Try.failure);
tryToNumberSwitch.error = util.error(tryToNumberSwitch, Try.failure);
tryToArraySwitch.error = util.error(tryToArraySwitch, Try.failure);

class ArrayCollectionWrapper implements ISubtagResultCollection {
    private readonly _source: SubtagResultArray;
    constructor(source: SubtagResultArray) {
        this._source = source;
    }

    public startsWith(target: SubtagResult): boolean {
        return this._source[0] === convert.toPrimitive(target);
    }

    public endsWith(target: SubtagResult): boolean {
        return this._source[this._source.length - 1] === convert.toPrimitive(target);
    }

    public includes(target: SubtagResult): boolean {
        return this._source.indexOf(convert.toPrimitive(target)) !== -1;
    }
}

class StringCollectionWrapper implements ISubtagResultCollection {
    private readonly _source: string;
    constructor(source: string) {
        this._source = source;
    }

    public startsWith(target: SubtagResult): boolean {
        if (check.null(target)) { return false; }
        return this._source.startsWith(convert.toString(target));
    }

    public endsWith(target: SubtagResult): boolean {
        if (check.null(target)) { return false; }
        return this._source.endsWith(convert.toString(target));
    }

    public includes(target: SubtagResult): boolean {
        if (check.null(target)) { return false; }
        return this._source.includes(convert.toString(target));
    }
}
export const convert: IBBTagTypeConverter = {
    toString: util.switch(toStringSwitch, functions.never),
    toPrimitive: util.switch(toPrimitiveSwitch, functions.never),
    toBoolean: util.switchTry(tryToBooleanSwitch, 'boolean'),
    toNumber: util.switchTry(tryToNumberSwitch, 'number'),
    toArray: util.switchTry(tryToArraySwitch, 'array'),
    tryToBoolean: util.switch(tryToBooleanSwitch, Try.failure),
    tryToNumber: util.switch(tryToNumberSwitch, Try.failure),
    tryToArray: util.switch(tryToArraySwitch, Try.failure),
    toCollection(target: SubtagResult): ISubtagResultCollection {
        const asArray = convert.tryToArray(target);
        if (asArray.success) {
            return new ArrayCollectionWrapper(asArray.value);
        }
        return new StringCollectionWrapper(convert.toString(target));
    }
};

export default convert;