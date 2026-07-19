import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { TopSpendingCategoryModel, TopSpendingCategoryPeriod } from "./stats.model";
import { TopSpendingCategoryEntity } from "./stats.entity";
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
        WHERE t.user_id = $(userId) AND t.type = 'expense' AND t.created_at >= NOW() - INTERVAL '${StatsRepo.periodToInterval[q.period]}'
        GROUP BY c.id
        ${StatsRepo.limitClause(q.limit)}
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
}
