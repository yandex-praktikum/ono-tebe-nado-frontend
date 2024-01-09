import {EventEmitter} from "./events";
import {bem, ensureElement, getObjectProperties, isEmpty, pascalToKebab} from "../../utils/utils";

export type EventData = {
    event: Event,
    element?: PartialElement,
    block?: PartialElement
};
export type EventHandler = (args: EventData) => void;
export type PartialElement = HTMLElement | Partial<any, any, any, any>;

export class Partial<NodeType extends HTMLElement, DataType extends object, Events extends string, Modifiers> {
    readonly name: string;
    protected node: NodeType;
    protected elements: Record<string, PartialElement>;
    protected events: EventEmitter;
    readonly fieldNames: string[];

    constructor(root: NodeType, name?: string) {
        this.node = root;
        this.name = name ?? pascalToKebab(this.constructor.name);
        this.fieldNames = getObjectProperties(this, (name, prop) => !!(prop.get || prop.set));
        this.elements = {};
        this.bindEmitter(new EventEmitter());
        this.init();
    }

    protected ensure<T extends HTMLElement>(selector: string) {
        return ensureElement<T>(selector, this.node);
    }

    protected bem(element?: string, modifier?: string) {
        return bem(this.name, element, modifier);
    }

    protected assign(data?: object) {
        if (data) Object.keys(data).map(key => {
            if (this.fieldNames.includes(key)) {
                //@ts-ignore
                this[key as string] = data[key];
            }
        });
    }

    protected element<T extends Partial<any, any, any, any>>(name: string, ClassType?: new (el: HTMLElement, name: string) => T): T {
        if (!this.elements[name]) {
            const el = this.bem(name);
            this.select<T>(name, el.class, ClassType);
        }
        return this.elements[name] as T;
    }

    protected select<T extends Partial<any, any, any, any>>(name: string, selector?: string, ClassType?: new (el: HTMLElement, name: string) => T): T {
        if (!this.elements[name]) {
            const $el = this.ensure<HTMLElement>(selector);
            if (ClassType) {
                this.elements[name] = new ClassType($el, name);
            } else {
                this.elements[name] = new Partial<any, any, any, any>($el, name);
            }
        }
        return this.elements[name] as T;
    }

    protected init() {}

    render(data?: DataType): NodeType {
        this.assign(data);
        return this.node;
    }

    bindEmitter(emitter: EventEmitter) {
        this.events = emitter;
        return this;
    }

    bindEvent(sourceEvent: string, targetEvent?: string, data?: object) {
        this.node.addEventListener(sourceEvent, (event: Event) => {
            debugger;
            this.events.emit((targetEvent ?? sourceEvent) as Events, {
                event,
                element: this
            });
        });
        return this;
    }

    trigger = (eventName: Events, data?: EventData) => (event: EventData) => {
        this.events.emit(eventName, {
            ...event,
            element: this,
            ...data
        });
    }

    on(eventName: Events, handler: EventHandler) {
        this.events.on(eventName as string, handler);
        return this;
    }

    toggle(modifier: Modifiers) {
        this.toggleClass(`.${this.name}_${modifier}`);
        return this;
    }

    clear() {
        this.node.replaceChildren();
        return this;
    }

    append(...items: PartialElement[]) {
        for (const item of items) {
            if (item instanceof Partial) {
                this.node.append(item.render());
            }
            if (item instanceof HTMLElement) {
                this.node.append(item);
            }
        }
    }

    text(value: string) {
        if (!isEmpty(value)) {
            if (this.node instanceof HTMLImageElement) {
                this.node.alt = value;
            } else {
                this.node.textContent = value;
            }
        }
        return this;
    }

    link(value: string) {
        if (!isEmpty(value)) {
            if (this.node instanceof HTMLImageElement) {
                this.node.src = value;
            }
            if (this.node instanceof HTMLAnchorElement) {
                this.node.href = value;
            }
        }
        return this;
    }

    setContent(item?: PartialElement) {
        return this.append(item);
    }

    toggleClass(className: string) {
        this.node.classList.toggle(className);
        return this;
    }

    addClass(className: string) {
        this.node.classList.add(className);
        return this;
    }

    removeClass(className: string) {
        this.node.classList.remove(className);
        return this;
    }

    hasClass(className: string): boolean {
        return this.node.className.includes(className);
    }

    public static factory<T extends Partial<any, any, any, any>>(this: new (el: unknown, name?: string) => T, el: unknown, data?: any, name?: string): T {
        const instance = new this(el, name);
        if (data) instance.render(data);
        return instance;
    }

    static clone<T>(templateId: string, data?: any, name?: string): T {
        const template = document.getElementById(templateId) as HTMLTemplateElement;
        const element = template.content.firstElementChild.cloneNode(true);
        return this.factory(element, data, name) as T;
    }

    static mount<T>(selectorElement: HTMLElement | string, data?: any, name?: string): T {
        const element = (typeof selectorElement === "string")
            ? document.querySelector(selectorElement)
            : selectorElement;
        return this.factory(element, data, name) as T;
    }
}