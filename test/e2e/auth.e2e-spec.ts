import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { faker } from "@faker-js/faker";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "@/app.module";
import { JwtService } from "@/jwt/jwt.service";
import { getTestUser, SignUpRes } from "../helpers/auth";

type SignInRes = SignUpRes;

const accessTokenTTL = 7 * 24 * 60 * 60;

describe("Auth API", () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("POST /auth/sign-up", async () => {
        const reqBody = {
            name: faker.internet.username(),
            password: faker.internet.password(),
        };
        const res = await request(app.getHttpServer())
            .post("/auth/sign-up")
            .send(reqBody)
            .expect(201)
            .expect("Content-Type", /json/);
        expect(res.body).toEqual({
            accessToken: expect.any(String),
            accessTokenTTL,
            user: {
                id: expect.any(Number),
                name: reqBody.name,
                createdAt: expect.any(String),
            },
        });
        const body = res.body as SignUpRes;
        const jwtService = app.get(JwtService);
        const jwtUser = await jwtService.verifyAccessToken(body.accessToken);
        expect(jwtUser).toEqual({ id: body.user.id });
    });

    it("POST /auth/sign-in", async () => {
        const user = getTestUser();
        const res = await request(app.getHttpServer())
            .post("/auth/sign-in")
            .send({ name: user.name, password: user.password })
            .expect(201)
            .expect("Content-Type", /json/);
        expect(res.body).toEqual({
            accessToken: expect.any(String),
            accessTokenTTL,
            user: {
                id: user.id,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
        const body = res.body as SignInRes;
        const jwtService = app.get(JwtService);
        const jwtUser = await jwtService.verifyAccessToken(body.accessToken);
        expect(jwtUser).toEqual({ id: body.user.id });
    });
});
