import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { AppModule } from "@/app.module";
import { authRequest, getTestUser } from "../helpers/auth";

describe("Users API", () => {
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

    it("GET /users/me", async () => {
        const user = getTestUser();
        const res = await authRequest(app, "get", "/users/me").expect(200).expect("Content-Type", /json/);
        expect(res.body).toEqual({
            id: user.id,
            name: user.name,
            createdAt: user.createdAt,
        });
    });
});
