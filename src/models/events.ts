type EventDeclaration<T> = { [P in keyof T]: (...args: any[]) => any };

export class EventManager<TEvents extends EventDeclaration<TEvents> = { [key: string]: (...args: any[]) => any }> {
    private readonly events: Map<keyof TEvents, Set<(...args: any[]) => any>>;

    public constructor() {
        this.events = new Map();
    }

    public on<TKey extends keyof TEvents>(event: TKey, handler: TEvents[TKey]): void {
        let handlers = this.events.get(event);
        if (!handlers) {
            this.events.set(event, handlers = new Set());
        }

        handlers.add(handler);
    }

    public off<TKey extends keyof TEvents>(event: TKey, handler: TEvents[TKey]): void {
        const handlers = this.events.get(event);
        if (!handlers) {
            return;
        }

        handlers.delete(handler);
        if (handlers.size === 0) {
            this.events.delete(event);
        }
    }

    public clear(event?: keyof TEvents): void {
        if (event === undefined) {
            this.events.clear();
        } else {
            this.events.delete(event);
        }
    }

    public raise<TKey extends keyof TEvents>(event: TKey, ...args: Parameters<TEvents[TKey]>): Array<ReturnType<TEvents[TKey]>> {
        const handlers = this.events.get(event) as Set<TEvents[TKey]> | undefined;
        if (!handlers || handlers.size === 0) {
            return [];
        }

        const results = [] as ReturnType<TEvents[TKey]>;

        for (const handler of handlers) {
            results.push(handler(...args));
        }

        return results;
    }
}