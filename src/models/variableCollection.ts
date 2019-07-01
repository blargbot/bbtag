import { SubtagResult } from './subtag';

export class VariableCollection {
    public async remove(key: string): Promise<void> { }
    public async  set(key: string, ...values: SubtagResult[]): Promise<void> { }
    public async get(key: string): Promise<SubtagResult> { }
}