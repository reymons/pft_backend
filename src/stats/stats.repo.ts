import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { SpendingCategoryTrendModel, TopSpendingCategoryModel, TopSpendingCategoryPeriod } from "./stats.model";
import { SpendingCategoryTrendEntity, SummaryEntity, TopSpendingCategoryEntity } from "./stats.entity";
import { CategoriesRepo } from "@/categories/categories.repo";
import { TopSpendingCategoriesQuery } from "./query/top-spending-categories";
import { SpendingCategoryTrendQuery } from "./query/spending-category-trend";

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
        WITH user_currency AS (
            SELECT default_currency AS value
            FROM users WHERE id = $(userId)
        ),
        trx_usd_amounts AS (
            SELECT t.id, t.category_id, t.added_at, t.amount * (1 / er.usd_rate) AS amount
            FROM transactions t
            JOIN exchange_rates er ON t.currency = er.currency AND (t.added_at AT TIME ZONE 'UTC')::date = er.rate_date
            WHERE t.user_id = $(userId) AND t.type = 'expense' AND t.added_at >= NOW() - INTERVAL '${StatsRepo.periodToInterval[q.period]}'
        ),
        trx_converted AS (
            SELECT tua.category_id, tua.amount * er.usd_rate AS amount
            FROM trx_usd_amounts AS tua
            CROSS JOIN user_currency
            JOIN exchange_rates er ON (tua.added_at AT TIME ZONE 'UTC')::date = er.rate_date AND er.currency = user_currency.value
        )
        SELECT c.id, c.type, c.custom_name, sum(tc.amount)::float AS amount
        FROM categories AS c
        JOIN trx_converted AS tc ON c.id = tc.category_id
        GROUP BY c.id
        ORDER BY c.id DESC
        ${StatsRepo.limitClause(q.limit)}
    `;

    private static getSummarySQL = `
        WITH user_currency AS (
            SELECT default_currency AS value
            FROM users WHERE id = $(userId)
        ),
        trx_usd_amounts AS (
            SELECT t.added_at, t.type, t.amount * (1 / er.usd_rate) AS amount
            FROM transactions t
            JOIN exchange_rates er ON t.currency = er.currency AND (t.added_at AT TIME ZONE 'UTC')::date = er.rate_date
            WHERE t.user_id = $(userId)
        ),
        trx_converted AS (
            SELECT tua.added_at, tua.type, tua.amount * er.usd_rate AS amount
            FROM trx_usd_amounts AS tua
            CROSS JOIN user_currency
            JOIN exchange_rates er ON (tua.added_at AT TIME ZONE 'UTC')::date = er.rate_date AND er.currency = user_currency.value
        ),
        trx_summary AS (
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
                ), 0)::float AS balance,
                coalesce(
                    sum(amount) FILTER (
                        WHERE type = 'expense' AND
                            added_at >= date_trunc('month', current_date) AND
                            added_at < date_trunc('month', current_date) + INTERVAL '1 month'
                    ),
                    0
                )::float AS spending_this_month,
                coalesce(
                    sum(amount) FILTER (
                        WHERE type = 'expense' AND
                            added_at >= date_trunc('month', current_date) - INTERVAL '1 month' AND
                            added_at < date_trunc('month', current_date)
                    ),
                    0
                )::float AS spending_prev_month
            FROM trx_converted
        ),
        budgets_summary AS (
            SELECT count(*)::int AS budgets
            FROM budgets WHERE user_id = $(userId)
        )
        SELECT * FROM trx_summary CROSS JOIN budgets_summary
    `;

    private static getSpendingCategoryTrendSQL = (q: SpendingCategoryTrendQuery) => `
        WITH user_currency AS (
            SELECT default_currency AS value
            FROM users WHERE id = $(userId)
        ),
        trx_usd_amounts AS (
            SELECT t.id, t.category_id, t.added_at, t.amount * (1 / er.usd_rate) AS amount
            FROM transactions t
            JOIN exchange_rates er ON t.currency = er.currency AND (t.added_at AT TIME ZONE 'UTC')::date = er.rate_date
            WHERE t.user_id = $(userId)
                AND t.type = 'expense'
                AND added_at >= date_trunc('day', $(startDate)::date)
                AND added_at < date_trunc('day', $(endDate)::date + INTERVAL '1 day')
            ORDER BY amount DESC
            ${StatsRepo.limitClause(q.limit)}
        ),
        trx_converted AS (
            SELECT tua.id, tua.category_id, tua.added_at, sum(tua.amount * er.usd_rate) AS amount
            FROM trx_usd_amounts AS tua
            CROSS JOIN user_currency
            JOIN exchange_rates er ON (tua.added_at AT TIME ZONE 'UTC')::date = er.rate_date AND er.currency = user_currency.value
            GROUP BY tua.id, tua.category_id, tua.added_at
        )
        SELECT
            date_trunc('day', t.added_at) AS date,
            sum(t.amount)::float AS amount,
            json_build_object(
                'id', c.id,
                'type', c.type,
                'custom_name', c.custom_name
            ) AS category
        FROM categories c
        JOIN trx_converted t ON c.id = t.category_id
        GROUP BY c.id, date
        ORDER BY date;
    `;

    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    static toTopSpendingCategoryModel(ent: TopSpendingCategoryEntity) {
        const m = new TopSpendingCategoryModel();
        m.category = CategoriesRepo.toModel(ent);
        m.amount = ent.amount;
        return m;
    }

    static toSpendingCategoryTrendModel(ent: SpendingCategoryTrendEntity) {
        const m = new SpendingCategoryTrendModel();
        m.category = CategoriesRepo.toModel(ent.category);
        m.amount = ent.amount;
        m.date = ent.date;
        return m;
    }

    async getTopSpendingCategories(userId: number, q: TopSpendingCategoriesQuery): Promise<TopSpendingCategoryModel[]> {
        const ents = await this.db.manyOrNone<TopSpendingCategoryEntity>(StatsRepo.getTopSpendingCategoriesSQL(q), {
            userId,
            limit: q.limit,
        });
        return ents.map((ent) => StatsRepo.toTopSpendingCategoryModel(ent));
    }

    getSummary(userId: number): Promise<SummaryEntity> {
        return this.db.one<SummaryEntity>(StatsRepo.getSummarySQL, { userId });
    }

    async getSpendingCategoryTrend(userId: number, q: SpendingCategoryTrendQuery) {
        const ents = await this.db.manyOrNone<SpendingCategoryTrendEntity>(StatsRepo.getSpendingCategoryTrendSQL(q), {
            userId,
            startDate: q.startDate,
            endDate: q.endDate,
            limit: q.limit,
        });
        return ents.map((ent) => StatsRepo.toSpendingCategoryTrendModel(ent));
    }
}
