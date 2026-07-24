import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage as SubscribeMessageDecorator,
    WebSocketGateway,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { WebSocket } from "ws";
import { JwtService } from "@/jwt/jwt.service";
import { IncomingMessage } from "http";
import { EventSubscriber } from "@/pubsub/pubsub.bus";
import { Event } from "@/pubsub/events/event";
import { type WSConn } from "./ws.types";
import { NotificationEvent } from "@/pubsub/events/notification";
import { type SubscribeMessage } from "./messages/subscribe";

class MockEvent implements Event {
    get type() {
        return "";
    }
}

const notifEvent = new NotificationEvent(0, new MockEvent(), "");

@WebSocketGateway({ path: "/ws" })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly conns = new Map<WebSocket, null>();
    private readonly connTopics = new Map<WebSocket, string[]>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly events: EventSubscriber,
    ) {
        events.onEvent((ev) => this.handleEvent(ev));
    }

    private handleEvent(ev: Event) {
        try {
            const mesg = JSON.stringify({ type: ev.type, data: ev });
            for (const [conn, topics] of this.connTopics.entries()) {
                // TODO: use topicSubs map for O(1) search
                if (topics.includes(ev.type)) {
                    conn.send(mesg);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    private extractJWTTokenFromURL(url: string): string {
        const params = new URLSearchParams(url.split("?").at(1) ?? "");
        return params.get("token") ?? "";
    }

    async handleConnection(conn: WebSocket, req: IncomingMessage) {
        if (!req.url) {
            conn.close();
            return;
        }
        const token = this.extractJWTTokenFromURL(req.url);
        if (!token) {
            conn.close();
            return;
        }
        try {
            (conn as WSConn).user = await this.jwtService.verifyAccessToken(token);
            this.conns.set(conn, null);
        } catch (err) {
            console.error(err);
            conn.close();
        }
    }

    handleDisconnect(conn: WebSocket) {
        this.conns.delete(conn);
        const topics = this.connTopics.get(conn);
        this.connTopics.delete(conn);
        if (topics) {
            for (const topic of topics) {
                this.events.unsubscribe(topic);
            }
        }
    }

    @SubscribeMessageDecorator("subscribe")
    handleSubscribe(@ConnectedSocket() conn: WSConn, @MessageBody() body: SubscribeMessage) {
        if (body.topic === notifEvent.type) {
            this.events.subscribe(notifEvent.type);
            this.connTopics.set(conn, [notifEvent.type]);
        }
    }
}
