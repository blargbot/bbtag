import { AggregateError } from './errors';

type Func = (...args: any[]) => any;
type EventDeclaration<T> = { [P in keyof T]: Func };

export class EventManager<TEvents extends EventDeclaration<TEvents> = { [key: string]: Func }> {
    private readonly events: Map<keyof TEvents, Set<Func>>;

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
        if (handlers === undefined) {
            return [];
        }

        const results: Array<ReturnType<TEvents[TKey]>> = [];
        const errors: any[] = [];

        for (const handler of handlers) {
            try {
                results.push(handler(...args));
            } catch (ex) {
                errors.push(ex);
            }
        }

        if (errors.length > 0) {
            throw new AggregateError(`Errors were thrown while invoking event ${event}. See innerErrors for details`, ...errors);
        }

        return results;
    }
}