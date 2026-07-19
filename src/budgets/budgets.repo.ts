import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { BudgetModel, BudgetPeriod } from "./budgets.model";
import { BudgetEntity, BudgetWithCategoriesEntity } from "./budgets.entity";
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
    private static readonly getAllBudgetsSQL = `
        SELECT
            b.id,
            b.user_id,
            b.name,
            b.amount,
            b.period,
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
        LEFT JOIN budget_categories AS bc ON b.id = bc.budget_id
        LEFT JOIN categories AS c ON bc.category_id = c.id
        WHERE b.user_id = $1
        GROUP BY b.id
    `;

    private static readonly getBudgetSQL = `
        SELECT
            b.id,
            b.user_id,
            b.name,
            b.amount,
            b.period,
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
        LEFT JOIN budget_categories AS bc ON b.id = bc.budget_id
        LEFT JOIN categories AS c ON bc.category_id = c.id
        WHERE b.id = $1 AND b.user_id = $2
        GROUP BY b.id
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

    private budgetToModel(ent: BudgetEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.name = ent.name;
        m.amount = parseFloat(ent.amount);
        m.categories = [];
        m.period = this.sqlPeriodToModelPeriod(ent.period);
        return m;
    }

    private budgetWithCatsToModel(ent: BudgetWithCategoriesEntity): BudgetModel {
        const m = new BudgetModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.name = ent.name;
        m.amount = parseFloat(ent.amount);
        m.period = this.sqlPeriodToModelPeriod(ent.period);
        m.categories = ent.categories.map((ent) => CategoriesRepo.toModel(ent));
        return m;
    }

    async getAllByUserId(userId: number): Promise<BudgetModel[]> {
        const rows = await this.db.many<BudgetWithCategoriesEntity>(BudgetsRepo.getAllBudgetsSQL, userId);
        return rows.map((r) => this.budgetWithCatsToModel(r));
    }

    async save(dto: SaveBudgetDto): Promise<BudgetModel> {
        const budget = await this.db.one<BudgetEntity>(
            "INSERT INTO budgets(user_id, name, amount, period) VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, period, amount",
            [dto.userId, dto.name, dto.amount, BudgetsRepo.sqlPeriod[dto.period]],
        );
        const m = this.budgetToModel(budget);
        if (dto.categoryIds?.length) {
            const data = dto.categoryIds.map((id) => ({ budget_id: budget.id, category_id: id }));
            const cs = new this.helpers.ColumnSet(["budget_id", "category_id"], { table: "budget_categories" });
            const query = this.helpers.insert(data, cs);
            await this.db.none(query);
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

    private async getOne(db: DBClient, budgetId: number, userId: number): Promise<BudgetModel> {
        const ent = await db.one<BudgetWithCategoriesEntity>(BudgetsRepo.getBudgetSQL, [budgetId, userId]);
        return this.budgetWithCatsToModel(ent);
    }

    async deleteById(id: number): Promise<void> {
        await this.db.none("DELETE FROM budgets WHERE id = $1", id);
    }

    private buildSet(dto: PatchBudgetDto, idx: number) {
        const cond: string[] = [];
        const v: unknown[] = [];
        if (dto.name !== undefined) {
            cond.push(`name = $${idx++}`);
            v.push(dto.name);
        }
        if (dto.amount !== undefined) {
            cond.push(`amount = $${idx++}`);
            v.push(dto.amount);
        }
        if (dto.period) {
            cond.push(`period = $${idx++}`);
            v.push(BudgetsRepo.sqlPeriod[dto.period]);
        }
        return { sql: cond.join(","), values: v, idx };
    }

    async patch(dto: PatchBudgetDto): Promise<BudgetModel> {
        let idx = 1;
        const set = this.buildSet(dto, idx);
        idx = set.idx;
        if (!set.sql) {
            throw new Error("Nothing to patch");
        }
        return this.db.tx(async (t) => {
            const queries: Promise<null>[] = [];
            const q = t.none(`UPDATE budgets SET ${set.sql} WHERE id = $${idx++} AND user_id = $${idx++}`, [
                ...set.values,
                dto.budgetId,
                dto.userId,
            ]);
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
