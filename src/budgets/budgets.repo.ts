import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { BudgetModel, BudgetPeriod } from "./budgets.model";
import { BudgetEntity } from "./budgets.entity";

@Injectable()
export class BudgetsRepoFactory {
    constructor(@Inject(DB_HELPERS) private readonly helpers: DBHelpers) {}

    createRepo(db: DBClient): BudgetsRepo {
        return new BudgetsRepo(db, this.helpers);
    }
}

@Injectable()
export class BudgetsRepo {
    private static readonly sqlPeriod: Record<BudgetPeriod, string> = {
        weekly: "1 week",
        monthly: "1 month",
        yearly: "1 year",
    };

    constructor(
        @Inject(DB_CLIENT) private readonly db: DBClient,
        @Inject(DB_HELPERS) private readonly helpers: DBHelpers,
    ) {}

    private toModel(ent: BudgetEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.userId;
        m.amount = parseFloat(ent.amount);
        m.categoryIds = [];

        const p = ent.period;
        if (p.days && p.days === 7) {
            m.period = BudgetPeriod.Weekly;
        } else if (p.months && p.months === 1) {
            m.period = BudgetPeriod.Monthly;
        } else if (p.years && p.years === 1) {
            m.period = BudgetPeriod.Yearly;
        } else {
            throw new Error("Unknown budget period");
        }

        return m;
    }

    async save(userId: number, amount: number, period: BudgetPeriod, categoryIds: number[] = []): Promise<BudgetModel> {
        const budget = await this.db.one<BudgetEntity>(
            "INSERT INTO budgets(user_id, amount, period) VALUES ($1, $2, $3) RETURNING id, user_id, period, amount",
            [userId, amount, BudgetsRepo.sqlPeriod[period]],
        );
        const m = this.toModel(budget);
        if (categoryIds.length) {
            const data = categoryIds.map((id) => ({ budget_id: budget.id, category_id: id }));
            const cs = new this.helpers.ColumnSet(["budget_id", "category_id"], { table: "budget_categories" });
            const query = this.helpers.insert(data, cs);
            await this.db.none(query);
            m.categoryIds = [...categoryIds];
        }
        return m;
    }

    async exists(budgetId: number, userId: number): Promise<boolean> {
        const count = await this.db.one<number>("SELECT count(*) FROM budgets WHERE id = $1 AND user_id = $2", [
            budgetId,
            userId,
        ]);
        return count > 0;
    }

    async deleteById(id: number): Promise<void> {
        await this.db.none("DELETE FROM budgets WHERE id = $1", id);
    }
}
