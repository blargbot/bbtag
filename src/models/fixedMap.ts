export class FixedMap<TKey, TValue> extends Map<TKey, TValue> {
    public constructor(valueGenerator?: (key: TKey) => TValue | undefined) {
        super();

        if (valueGenerator) {
            let baseGet = super.get.bind(this);
            let baseSet = super.set.bind(this);
            this.get = function get(this: FixedMap<TKey, TValue>, key: TKey): TValue | undefined {
                let base = baseGet(key);
                if (base === undefined) {
                    base = valueGenerator(key);
                    if (base !== undefined) {
                        baseSet(key, base);
                    }
                }
                return base;
            }
            this.has = () => true;
        }
    }

    public set(key: TKey, value: TValue): this {
        if (this.has(key)) {
            throw new Error(`Key ${key} is already defined`);
        }
        return super.set(key, value);
    }
}