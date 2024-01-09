export class EventEmitter {
    protected handlers: Map<string, Set<Function>>;

    constructor() {
        this.handlers = new Map();
    }

    on(eventName: string, handler: Function) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, new Set());
        }
        this.handlers.get(eventName).add(handler);
    }

    off(eventName: string, handler: Function) {
        if (this.handlers.has(eventName)) {
            this.handlers.get(eventName).delete(handler);
        }
    }

    emit(eventName: string, data: any) {
        if (this.handlers.has(eventName)) {
            this.handlers.get(eventName).forEach(handler => handler(data))
        }
    }
}