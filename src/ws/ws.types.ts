import { WebSocket } from "ws";
import { JwtUser } from "@/jwt/jwt.types";

export type WSConn = WebSocket & {
    user: JwtUser;
};
