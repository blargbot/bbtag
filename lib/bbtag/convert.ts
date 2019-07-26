import { functions, Try } from '../util';
import check from './check';
import serializers from './serialize';
import switchType from './switchType';
import { ISubtagError, ISubtagResultCollection, SubtagPrimitiveResult, SubtagResult, SubtagResultArray, SwitchHandlers } from './types';

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
    error<T>(noFallback: (error: ISubtagError) => T, handleFallback: SwitchHandlers<T>): (error: ISubtagError) => T {
        return (target: ISubtagError) => {
            if (target.context === undefined) { return noFallback(target); }
            if (check.null(target.context.fallback)) { return noFallback(target); }
            const result = switchType(target.context.fallback, handleFallback);
            if (result === undefined) { return noFallback(target); }
            return result;
        };
    },
    errorToString(error: ISubtagError): string {
        return `\`${error.message}\``;
    }
};

const toStringSwitch: SwitchHandlers<string> = {
    string: functions.identity,
    boolean: serializers.boolean.serialize,
    number: serializers.number.serialize,
    array: serializers.array.serialize,
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
    string: serializers.boolean.tryDeserialize,
    boolean: Try.success
};

const tryToNumberSwitch: SwitchHandlers<Try.Result<number>> = {
    string: serializers.number.tryDeserialize,
    number: Try.success
};

const tryToArraySwitch: SwitchHandlers<Try.Result<SubtagResultArray>> = {
    string: serializers.array.tryDeserialize,
    array: Try.success
};

toStringSwitch.error = util.error(util.errorToString, toStringSwitch);
toPrimitiveSwitch.error = util.error(util.errorToString, toPrimitiveSwitch);
tryToBooleanSwitch.error = util.error(Try.failure, tryToBooleanSwitch);
tryToNumberSwitch.error = util.error(Try.failure, tryToNumberSwitch);
tryToArraySwitch.error = util.error(Try.failure, tryToArraySwitch);

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
export const convert = {
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