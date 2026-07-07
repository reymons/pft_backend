import crypto from "crypto";
import util from "util";
import { Injectable } from "@nestjs/common";

const scrypt = util.promisify(crypto.scrypt);

@Injectable()
export class PasswordService {
    async createHash(input: string, saltLen: number): Promise<string> {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = (await scrypt(input, salt, saltLen)) as Buffer;
        return `${salt}:${hash.toString("hex")}`;
    }

    async verify(input: string, hashedInput: string, saltLen: number) {
        const [salt, key] = hashedInput.split(":");
        const thisKey = (await scrypt(input, salt, saltLen)) as Buffer;
        return crypto.timingSafeEqual(Buffer.from(key, "hex"), thisKey);
    }
}
