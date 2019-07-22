import { SubtagContext } from '../contexts';

export class OptimizationContext {
    public readonly inner: SubtagContext;
    public readonly warnings: any[];

    public constructor(inner: SubtagContext) {
        this.inner = inner;
        this.warnings = [];
    }
}