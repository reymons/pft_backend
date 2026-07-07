import { Injectable } from "@nestjs/common";
import { JwtUser } from "./jwt.types";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtService {
    readonly TOKEN_TTL = 7 * 24 * 60 * 60;

    constructor(private readonly secret: string) {}

    createAccessToken(userId: number): Promise<string> {
        return new Promise((res, rej) => {
            const u: JwtUser = { id: userId };
            jwt.sign(u, this.secret, { expiresIn: this.TOKEN_TTL }, (err, token) => {
                if (err) rej(err);
                else res(token!);
            });
        });
    }

    verifyAccessToken(token: string): Promise<JwtUser> {
        return new Promise((res, rej) => {
            jwt.verify(token, this.secret, (err, p) => {
                if (err) {
                    rej(err);
                    return;
                }
                try {
                    res({
                        // @ts-expect-error have try-catch
                        // eslint-disable-next-line
                        id: p.id,
                    });
                } catch (err) {
                    rej(err as Error);
                }
            });
        });
    }
}
