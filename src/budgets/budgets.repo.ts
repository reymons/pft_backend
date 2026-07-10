import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { BudgetModel, BudgetPeriod } from "./budgets.model";
import { BudgetEntity, BudgetWithCategoriesEntity } from "./budgets.entity";
import { PostgresInterval } from "@/db/db.types";

@Injectable()
export class BudgetsRepoFactory {
    constructor(@Inject(DB_HELPERS) private readonly helpers: DBHelpers) {}

    createRepo(db: DBClient): BudgetsRepo {
        return new BudgetsRepo(db, this.helpers);
    }
}

@Injectable()
export class BudgetsRepo {
    private static readonly getAllBudgetsSQL = `
        SELECT
            b.id, b.user_id, b.amount, b.period,
            COALESCE(
                json_agg(bc.category_id) FILTER (WHERE bc.category_id IS NOT NULL),
                '[]'
            ) as category_ids
        FROM budgets AS b
        LEFT JOIN budget_categories AS bc ON b.id = bc.budget_id
        WHERE b.user_id = $1
        GROUP BY b.id
    `;

    private static readonly sqlPeriod: Record<BudgetPeriod, string> = {
        weekly: "1 week",
        monthly: "1 month",
        yearly: "1 year",
    };

    constructor(
        @Inject(DB_CLIENT) private readonly db: DBClient,
        @Inject(DB_HELPERS) private readonly helpers: DBHelpers,
    ) {}

    private sqlPeriodToModelPeriod(p: PostgresInterval): BudgetPeriod {
        if (p.days && p.days === 7) {
            return BudgetPeriod.Weekly;
        }
        if (p.months && p.months === 1) {
            return BudgetPeriod.Monthly;
        }
        if (p.years && p.years === 1) {
            return BudgetPeriod.Yearly;
        }
        throw new Error("Unknown budget period");
    }

    private budgetToModel(ent: BudgetEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.amount = parseFloat(ent.amount);
        m.categoryIds = [];
        m.period = this.sqlPeriodToModelPeriod(ent.period);
        return m;
    }

    private budgetWithCatsToModel(ent: BudgetWithCategoriesEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.amount = parseFloat(ent.amount);
        m.period = this.sqlPeriodToModelPeriod(ent.period);
        m.categoryIds = [...ent.category_ids];
        return m;
    }

    async getAllByUserId(userId: number): Promise<BudgetModel[]> {
        const rows = await this.db.many<BudgetWithCategoriesEntity>(BudgetsRepo.getAllBudgetsSQL, userId);
        return rows.map((r) => this.budgetWithCatsToModel(r));
    }

    async save(userId: number, amount: number, period: BudgetPeriod, categoryIds: number[] = []): Promise<BudgetModel> {
        const budget = await this.db.one<BudgetEntity>(
            "INSERT INTO budgets(user_id, amount, period) VALUES ($1, $2, $3) RETURNING id, user_id, period, amount",
            [userId, amount, BudgetsRepo.sqlPeriod[period]],
        );
        const m = this.budgetToModel(budget);
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
        const result = await this.db.one<{ count: number }>(
            "SELECT count(*) FROM budgets WHERE id = $1 AND user_id = $2 LIMIT 1",
            [budgetId, userId],
        );
        return result.count > 0;
    }

    async deleteById(id: number): Promise<void> {
        await this.db.none("DELETE FROM budgets WHERE id = $1", id);
    }
}
