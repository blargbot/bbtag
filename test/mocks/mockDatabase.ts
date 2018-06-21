import { IDatabase } from '../../dist/interfaces/idatabase';
import { DiscordContext } from '../../dist/structures/context';

export class MockDb implements IDatabase<DiscordContext> {
    public store: { [key: string]: string } = {};
    async getVariable(context: DiscordContext, name: string): Promise<string> {
        return this.store[name] || (this.store[name] = name);
    }
    async setVariable(context: DiscordContext, ...values: Array<{ name: string; value: string; }>): Promise<void> {
        for (const entry of values)
            this.store[entry.name] = entry.value;
    }
}