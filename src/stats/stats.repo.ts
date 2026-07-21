import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { TopSpendingCategoryModel, TopSpendingCategoryPeriod } from "./stats.model";
import { SummaryEntity, TopSpendingCategoryEntity } from "./stats.entity";
import { CategoriesRepo } from "@/categories/categories.repo";
import { TopSpendingCategoriesQuery } from "./query/top-spending-categories";

@Injectable()
export class StatsRepo {
    private static periodToInterval: Record<TopSpendingCategoryPeriod, string> = {
        [TopSpendingCategoryPeriod.Weekly]: "1 week",
        [TopSpendingCategoryPeriod.Monthly]: "1 month",
        [TopSpendingCategoryPeriod.Yearly]: "1 year",
    };

    private static limitClause(limit?: number): string {
        return limit === undefined ? "" : "LIMIT $(limit)";
    }

    private static getTopSpendingCategoriesSQL = (q: TopSpendingCategoriesQuery) => `
        SELECT c.id, c.type, c.custom_name, sum(t.amount)::int AS amount
        FROM categories AS c
        JOIN transactions AS t ON c.id = t.category_id
        WHERE t.user_id = $(userId) AND t.type = 'expense' AND t.added_at >= NOW() - INTERVAL '${StatsRepo.periodToInterval[q.period]}'
        GROUP BY c.id
        ${StatsRepo.limitClause(q.limit)}
    `;

    private static getSummarySQL = `
        WITH trx_summary AS (
            SELECT
                count(*)::int AS transactions,
                count(*) FILTER (
                    WHERE added_at >= date_trunc('month', current_date) AND
                        added_at < date_trunc('month', current_date) + INTERVAL '1 month'
                )::int AS transactions_this_month,
                count(*) FILTER (
                    WHERE added_at >= date_trunc('month', current_date) - INTERVAL '1 month' AND
                        added_at < date_trunc('month', current_date)
                )::int AS transactions_prev_month,
                coalesce(sum(
                    CASE
                        WHEN type = 'income' THEN amount
                        WHEN type = 'expense' THEN -amount
                    END
                ), 0)::float AS balance
            FROM transactions WHERE user_id = $(userId)
        ),
        budgets_summary AS (
            SELECT count(*)::int AS budgets
            FROM budgets WHERE user_id = $(userId)
        )
        SELECT * FROM trx_summary CROSS JOIN budgets_summary
    `;

    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    static toTopSpendingCategoryModel(ent: TopSpendingCategoryEntity): TopSpendingCategoryModel {
        const m = new TopSpendingCategoryModel();
        m.category = CategoriesRepo.toModel(ent);
        m.amount = ent.amount;
        return m;
    }

    async getTopSpendingCategories(userId: number, q: TopSpendingCategoriesQuery): Promise<TopSpendingCategoryModel[]> {
        const ents = await this.db.manyOrNone<TopSpendingCategoryEntity>(StatsRepo.getTopSpendingCategoriesSQL(q), {
            userId,
            limit: q.limit,
        });
        return ents.map((ent) => StatsRepo.toTopSpendingCategoryModel(ent));
    }

    async getSummary(userId: number): Promise<SummaryEntity> {
        return this.db.one<SummaryEntity>(StatsRepo.getSummarySQL, { userId });
    }
}
