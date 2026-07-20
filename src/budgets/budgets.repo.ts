import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { BudgetModel, BudgetPeriod } from "./budgets.model";
import { BudgetWithCategoriesEntity } from "./budgets.entity";
import { PostgresInterval } from "@/db/db.types";
import { SaveBudgetDto, PatchBudgetDto } from "./dto/repo";
import { CategoriesRepo } from "@/categories/categories.repo";

@Injectable()
export class BudgetsRepoFactory {
    constructor(@Inject(DB_HELPERS) private readonly helpers: DBHelpers) {}

    createRepo(db: DBClient): BudgetsRepo {
        return new BudgetsRepo(db, this.helpers);
    }
}

@Injectable()
export class BudgetsRepo {
    private static readonly getBudgetSQL = (many: boolean) => `
        WITH budget_period_windows AS (
            SELECT
                id AS budget_id,
                period,
                CASE
                    WHEN starts_at > now() THEN starts_at
                    ELSE starts_at + floor(extract(epoch FROM (now() - starts_at)) / extract(epoch FROM period)) * period
                END AS period_start
            FROM budgets
        ),
        budget_total_spent AS (
            SELECT bpw.budget_id, coalesce(sum(t.amount), 0)::float as total_spent
            FROM budget_period_windows AS bpw
            LEFT JOIN budget_categories AS bc ON bc.budget_id = bpw.budget_id
            LEFT JOIN transactions AS t ON
                t.type = 'expense' AND
                (t.category_id = bc.category_id OR bc.category_id IS NULL) AND
                t.added_at >= bpw.period_start AND
                t.added_at < bpw.period_start + bpw.period
            GROUP BY bpw.budget_id
        )
        SELECT
            b.id,
            b.user_id,
            b.name,
            b.amount,
            b.period,
            b.starts_at,
            bts.total_spent AS total_spent,
            coalesce(
                json_agg(
                    json_build_object(
                        'id', c.id,
                        'user_id', c.user_id,
                        'type', c.type,
                        'custom_name', c.custom_name
                    )
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
            ) AS categories
        FROM budgets AS b
        JOIN budget_total_spent AS bts ON b.id = bts.budget_id
        LEFT JOIN budget_categories AS bc ON b.id = bc.budget_id
        LEFT JOIN categories AS c ON bc.category_id = c.id
        WHERE ${many ? "" : "b.id = $(budgetId) AND"} b.user_id = $(userId)
        GROUP BY b.id, bts.total_spent
    `;

    private static readonly insertCategoriesSQL = `
        INSERT INTO budget_categories(budget_id, category_id)
        SELECT $1, category_id FROM unnest($2::int[]) AS category_id
        ON CONFLICT (budget_id, category_id) DO NOTHING
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

    private budgetWithCatsToModel(ent: BudgetWithCategoriesEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.name = ent.name;
        m.amount = parseFloat(ent.amount);
        m.period = this.sqlPeriodToModelPeriod(ent.period);
        m.totalSpent = ent.total_spent;
        m.startsAt = ent.starts_at;
        m.categories = ent.categories.map((ent) => CategoriesRepo.toModel(ent));
        return m;
    }

    private async getOne(db: DBClient, budgetId: number, userId: number): Promise<BudgetModel> {
        const ent = await db.one<BudgetWithCategoriesEntity>(BudgetsRepo.getBudgetSQL(false), { budgetId, userId });
        return this.budgetWithCatsToModel(ent);
    }

    async getAllByUserId(userId: number): Promise<BudgetModel[]> {
        const rows = await this.db.many<BudgetWithCategoriesEntity>(BudgetsRepo.getBudgetSQL(true), { userId });
        return rows.map((r) => this.budgetWithCatsToModel(r));
    }

    async save(dto: SaveBudgetDto): Promise<BudgetModel> {
        return this.db.tx<BudgetModel>(async (t) => {
            const { id: budgetId } = await this.db.one<{ id: number }>(
                "INSERT INTO budgets(user_id, name, amount, period, starts_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [dto.userId, dto.name, dto.amount, BudgetsRepo.sqlPeriod[dto.period], dto.startsAt],
            );
            if (dto.categoryIds?.length) {
                const data = dto.categoryIds.map((id) => ({ budget_id: budgetId, category_id: id }));
                const cs = new this.helpers.ColumnSet(["budget_id", "category_id"], { table: "budget_categories" });
                const query = this.helpers.insert(data, cs);
                await this.db.none(query);
            }
            return this.getOne(t, budgetId, dto.userId);
        });
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

    private buildSet(dto: PatchBudgetDto) {
        const cond: string[] = [];
        const values: Record<string, unknown> = {};
        if (dto.name !== undefined) {
            cond.push("name = $(name)");
            values.name = dto.name;
        }
        if (dto.amount !== undefined) {
            cond.push("amount = $(amount)");
            values.amount = dto.amount;
        }
        if (dto.period) {
            cond.push("period = $(period)");
            values.period = BudgetsRepo.sqlPeriod[dto.period];
        }
        if (dto.startsAt) {
            cond.push("starts_at = $(startsAt)");
            values.startsAt = dto.startsAt;
        }
        return { sql: cond.join(","), values };
    }

    async patch(dto: PatchBudgetDto): Promise<BudgetModel> {
        const set = this.buildSet(dto);
        if (!set.sql) {
            throw new Error("Nothing to patch");
        }
        return this.db.tx(async (t) => {
            const queries: Promise<null>[] = [];
            set.values.budgetId = dto.budgetId;
            set.values.userId = dto.userId;
            const q = t.none(
                `UPDATE budgets SET ${set.sql} WHERE id = $(budgetId) AND user_id = $(userId)`,
                set.values,
            );
            queries.push(q);
            if (dto.categoryIds?.length) {
                let q = t.none("DELETE FROM budget_categories WHERE budget_id = $1 AND category_id <> ALL($2::int[])", [
                    dto.budgetId,
                    dto.categoryIds,
                ]);
                queries.push(q);
                q = t.none(BudgetsRepo.insertCategoriesSQL, [dto.budgetId, dto.categoryIds]);
                queries.push(q);
            }
            await Promise.all(queries);
            return this.getOne(t, dto.budgetId, dto.userId);
        });
    }
}
