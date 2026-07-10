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
            amount: parseFloat(faker.finance.amount()),
            period: "yearly",
            newCategories: ["Groceries"],
        };
        const res = await authRequest(app, "post", "/budgets")
            .send(newBudget)
            .expect(201)
            .expect("Content-Type", /json/);
        expect(res.body).toEqual({
            budget: {
                id: expect.any(Number),
                amount: newBudget.amount,
                period: newBudget.period,
                categoryIds: expect.any(Array),
            },
        });
        const body = res.body as { budget: CreatedBudget };
        expect(body.budget.categoryIds.every(Number.isInteger)).toBe(true);
    });
});
