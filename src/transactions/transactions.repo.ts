import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { RecurringTrxPeriod, TransactionModel } from "./transactions.model";
import { Inject, Injectable } from "@nestjs/common";
import { RecurringTrxEntity, TransactionEntity, TransactionWithCategoryEntity } from "./transactions.entity";
import { SaveTrxDto } from "./dto/repo";
import { TransactionSortField, TransactionsQuery } from "./query/trx";
import { CategoriesRepo } from "@/categories/categories.repo";

@Injectable()
export class TransactionsRepoFactory {
    createRepo(db: DBClient): TransactionsRepo {
        return new TransactionsRepo(db);
    }
}

@Injectable()
export class TransactionsRepo {
    private static readonly sqlPeriod: Record<RecurringTrxPeriod, string> = {
        [RecurringTrxPeriod.Weekly]: "1 week",
        [RecurringTrxPeriod.Monthly]: "1 month",
        [RecurringTrxPeriod.Yearly]: "1 year",
    };

    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    private toModel(ent: TransactionEntity): TransactionModel {
        const m = new TransactionModel();
        m.id = ent.id;
        m.type = ent.type;
        m.name = ent.name;
        m.description = ent.description ?? "";
        m.recurringPeriod = null;
        m.createdAt = ent.created_at;
        m.amount = parseFloat(ent.amount);
        return m;
    }

    private buildWhere(q: TransactionsQuery, idx: number) {
        const cond: string[] = [];
        const v: unknown[] = [];
        if (q.name) {
            cond.push(`similarity(t.name, $${idx++}) > 0.1`);
            v.push(q.name);
        }
        if (q.description) {
            cond.push(`similarity(t.description, $${idx++}) > 0.1`);
            v.push(q.name);
        }
        if (q.type) {
            cond.push(`t.type = $${idx++}`);
            v.push(q.type);
        }
        if (q.categoryIds?.length) {
            cond.push(`cat.id = ANY($${idx++})`);
            v.push(q.categoryIds);
        }
        return { sql: cond.join(" AND "), values: v, idx };
    }

    async save(dto: SaveTrxDto): Promise<TransactionModel> {
        return this.db.tx<TransactionModel>(async (t) => {
            let recurringId: number | null = null;

            if (dto.recurringPeriod) {
                const row = await t.one<RecurringTrxEntity>(
                    "INSERT INTO recurring_transactions(type, name, description, amount, user_id, category_id, update_interval) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                    [
                        dto.type,
                        dto.name,
                        dto.description ?? null,
                        dto.amount,
                        dto.userId,
                        dto.categoryId,
                        TransactionsRepo.sqlPeriod[dto.recurringPeriod],
                    ],
                );
                recurringId = row.id;
            }

            const ent = await t.one<TransactionEntity>(
                "INSERT INTO transactions(type, name, description, amount, user_id, category_id, recurring_trx_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, type, name, amount, description, category_id, created_at",
                [dto.type, dto.name, dto.description, dto.amount, dto.userId, dto.categoryId, recurringId],
            );
            const trx = this.toModel(ent);
            trx.recurringPeriod = dto.recurringPeriod ?? null;
            return trx;
        });
    }

    private static readonly sortColumns: Record<TransactionSortField, string> = {
        [TransactionSortField.Date]: "created_at",
    };

    async getAllByUserId(
        userId: number,
        query: TransactionsQuery,
    ): Promise<{ data: TransactionModel[]; total: number }> {
        const where = this.buildWhere(query, 2);
        let next = where.idx;
        const sortCol = TransactionsRepo.sortColumns[query.sortBy];
        const ents = await this.db.manyOrNone<TransactionWithCategoryEntity>(
            `
                SELECT
                    t.id, t.type, t.name, t.amount, t.description, t.category_id, t.created_at,
                    json_build_object(
                        'id', cat.id,
                        'user_id', cat.user_id,
                        'type', cat.type,
                        'custom_name', cat.custom_name
                    ) AS category,
                    count(*) over()::int AS total
                FROM transactions AS t JOIN categories AS cat ON t.category_id = cat.id
                WHERE t.user_id = $1 ${where.sql ? `AND ${where.sql}` : ""}
                ORDER BY ${sortCol} ${query.dir} OFFSET $${next++} LIMIT $${next++}
            `,
            [userId, ...where.values, query.page * query.pageSize, query.pageSize],
        );
        const data = ents.map((ent) => {
            const trx = this.toModel(ent);
            trx.category = CategoriesRepo.toModel(ent.category);
            return trx;
        });
        return { data, total: ents.at(0)?.total ?? 0 };
    }
}
