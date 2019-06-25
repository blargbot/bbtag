export class HardMap<TKey, TValue> extends Map<TKey, TValue> {
    public constructor(valueGenerator?: (key: TKey) => TValue | undefined) {
        super();

        if (valueGenerator) {
            const baseGet = super.get.bind(this);
            const baseSet = super.set.bind(this);
            this.get = function get(this: HardMap<TKey, TValue>, key: TKey): TValue | undefined {
                let base = baseGet(key);
                if (base === undefined) {
                    base = valueGenerator(key);
                    if (base !== undefined) {
                        baseSet(key, base);
                    }
                }
                return base;
            };
            this.has = () => true;
        }
    }

    public set(key: TKey, value: TValue): this {
        if (super.has(key)) {
            throw new Error(`Key ${key} is already defined`);
        }
        return super.set(key, value);
    }
}