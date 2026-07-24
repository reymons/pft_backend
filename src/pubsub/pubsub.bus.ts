import { Event } from "./events/event";

type EventListener = (ev: Event) => void;

export class EventSubscriber {
    private readonly topics: Record<string, null> = {};
    _eventListener: EventListener = () => {};

    constructor(private readonly bus: EventBus) {}

    subscribe(topic: string) {
        if (this.topics[topic] === undefined) {
            this.bus._subscribe(topic, this);
            this.topics[topic] = null;
        }
    }

    unsubscribe(topic: string) {
        this.bus._unsubscribe(topic, this);
        delete this.topics[topic];
    }

    onEvent(ln: EventListener) {
        this._eventListener = ln;
    }
}

export class EventBus {
    private readonly topicSubs: Record<string, Map<EventSubscriber, null>> = {};

    createSubscriber() {
        return new EventSubscriber(this);
    }

    _subscribe(topic: string, sub: EventSubscriber) {
        let subs = this.topicSubs[topic];
        if (!subs) {
            subs = new Map<EventSubscriber, null>();
            this.topicSubs[topic] = subs;
        }
        subs.set(sub, null);
    }

    _unsubscribe(topic: string, sub: EventSubscriber) {
        const subs = this.topicSubs[topic];
        if (subs) {
            subs.delete(sub);
            if (!subs.size) {
                delete this.topicSubs[topic];
            }
        }
    }

    publish(ev: Event) {
        const subs = this.topicSubs[ev.type];
        if (subs) {
            for (const sub of subs.keys()) {
                sub._eventListener(ev);
            }
        }
    }
}
