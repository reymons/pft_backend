import { AppModule } from "@/app.module";
import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";

export type UserRes = {
    id: number;
    name: string;
    createdAt: string;
};

type User = UserRes & {
    password: string;
};

export type SignUpRes = {
    accessToken: string;
    accessTokenTTL: number;
    user: UserRes;
};

let user: User;
let accessToken: string;

export function getTestUser(): User {
    return { ...user };
}

export function getTestUserAccessToken(): string {
    return accessToken;
}

export function signUpTestUser() {
    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        const app: INestApplication<App> = moduleFixture.createNestApplication();
        await app.init();
        const password = faker.internet.password();
        const res = await request(app.getHttpServer()).post("/auth/sign-up").send({
            name: faker.internet.username(),
            password,
        });
        const body = res.body as SignUpRes;
        user = { ...body.user, password };
        accessToken = body.accessToken;
        await app.close();
    });
}

export function authRequest(
    app: INestApplication<App>,
    method: "get" | "post" | "patch" | "put" | "delete",
    url: string,
    token = accessToken,
) {
    const req = request(app.getHttpServer())[method](url);
    return req.set("Authorization", `Bearer ${token}`);
}
