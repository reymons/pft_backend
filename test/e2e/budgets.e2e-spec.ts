import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { App } from "supertest/types";
import { faker } from "@faker-js/faker";
import { AppModule } from "@/app.module";
import { authRequest } from "../helpers/auth";

type CreatedBudget = {
    id: number;
    amount: number;
    period: string;
    categoryIds: number[];
};

describe("Budgets API", () => {
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

    it("creates a budget", async () => {
        const newBudget = {
            name: faker.string.uuid(),
            amount: parseFloat(faker.finance.amount()),
            period: "yearly",
            newCategories: ["Groceries"],
            startsAt: faker.date.soon(),
        };
        const res = await authRequest(app, "post", "/budgets")
            .send(newBudget)
            .expect(201)
            .expect("Content-Type", /json/);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: expect.any(String),
            amount: newBudget.amount,
            period: newBudget.period,
            startsAt: expect.any(String),
            totalSpent: expect.any(Number),
            categories: expect.any(Array),
        });
    });

    it("deletes a budget", async () => {
        const budget = {
            name: faker.string.uuid(),
            amount: parseFloat(faker.finance.amount()),
            period: "weekly",
            startsAt: faker.date.soon(),
        };
        const res = await authRequest(app, "post", "/budgets").send(budget).expect(201);
        const newBudget = res.body as CreatedBudget;
        await authRequest(app, "delete", `/budgets/${newBudget.id}`).send().expect(204);
    });
});
