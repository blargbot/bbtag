export class Converter {
    public async convert(value: any, toType: string) {
        switch (toType) {
            case 'string': return this.toString(value);
            case 'number': return this.toNumber(value);
        }
    }

    public toString(value: any): string {
        return String(value);
    }

    public toNumber(value: any): number {
        if (typeof value === 'number')
            return value;
        return parseFloat(value);
    }
}