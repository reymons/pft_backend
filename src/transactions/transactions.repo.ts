import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { RecurringTrxPeriod, TransactionModel } from "./transactions.model";
import { Inject, Injectable } from "@nestjs/common";
import { TransactionEntity, TransactionWithTotalEntity } from "./transactions.entity";
import { SaveTrxDto } from "./dto/repo";
import { TransactionSortField, TransactionsQuery } from "./query/trx";
import { CategoriesRepo } from "@/categories/categories.repo";
import { EntityWithId } from "@/common/entity";
import { PostgresInterval } from "@/db/db.types";

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

    private sqlPeriodToModelPeriod(p: PostgresInterval): RecurringTrxPeriod {
        if (p.days && p.days === 7) {
            return RecurringTrxPeriod.Weekly;
        }
        if (p.months && p.months === 1) {
            return RecurringTrxPeriod.Monthly;
        }
        if (p.years && p.years === 1) {
            return RecurringTrxPeriod.Yearly;
        }
        throw new Error("Unknown recurring transaction period");
    }

    private static readonly getTransactionSQL = (opts: {
        many?: boolean;
        select?: string;
        where?: string;
        after?: string;
    }) => `
        SELECT
            t.id, t.type, t.name, t.amount, t.description, t.category_id, t.added_at, t.created_at, t.recurring_trx_id,
            json_build_object(
                'id', cat.id,
                'user_id', cat.user_id,
                'type', cat.type,
                'custom_name', cat.custom_name
            ) AS category ${opts.select ? `, ${opts.select}` : ""}
        FROM transactions AS t JOIN categories AS cat ON t.category_id = cat.id
        WHERE ${opts.many ? "" : "t.id = $(trxId) AND"} t.user_id = $(userId) ${opts.where ? `AND ${opts.where}` : ""}
        ${opts.after || ""}
    `;

    private static readonly insertTransactionSQL = `
        INSERT INTO transactions(type, name, description, amount, user_id, category_id, added_at, recurring_trx_id)
        VALUES ($(type), $(name), $(description), $(amount), $(userId), $(categoryId), $(addedAt), $(recurringTrxId))
        RETURNING id
    `;

    private static readonly insertRecurringTransactionSQL = `
        INSERT INTO recurring_transactions(type, name, description, amount, user_id, category_id, updates_at, update_interval)
        VALUES ($(type), $(name), $(description), $(amount), $(userId), $(categoryId), $(period)::interval + $(addedAt)::timestamptz, $(period))
        RETURNING id
    `;

    private static readonly updateRecurringTrxSQL = (recurringTrxId?: number) => `
        WITH RECURSIVE due AS (
            SELECT id, type, name, description, category_id, user_id, amount, updates_at, update_interval
            FROM recurring_transactions
            WHERE updates_at <= NOW() ${recurringTrxId ? " AND id = $(id)" : ""}

            UNION ALL

            SELECT id, type, name, description, category_id, user_id, amount, updates_at + update_interval, update_interval
            FROM due
            WHERE updates_at + update_interval <= NOW()
        ),
        inserted AS (
            INSERT INTO transactions(type, name, description, category_id, user_id, recurring_trx_id, amount, added_at)
                SELECT type, name, description, category_id, user_id, id, amount, updates_at
                FROM due
            RETURNING recurring_trx_id
        )
        UPDATE recurring_transactions rt
        SET updates_at = (
            SELECT updates_at + update_interval
            FROM due d
            WHERE d.id = rt.id
            ORDER BY updates_at DESC
            LIMIT 1
        )
        FROM inserted i
        WHERE i.recurring_trx_id = rt.id
    `;

    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    static toModel(ent: TransactionEntity): TransactionModel {
        const m = new TransactionModel();
        m.id = ent.id;
        m.type = ent.type;
        m.name = ent.name;
        m.description = ent.description ?? "";
        m.recurringPeriod = null;
        m.addedAt = ent.added_at;
        m.createdAt = ent.created_at;
        m.amount = parseFloat(ent.amount);
        m.category = CategoriesRepo.toModel(ent.category);
        m.recurringTrxId = ent.recurring_trx_id;
        return m;
    }

    private async getOne(db: DBClient, trxId: number, userId: number): Promise<TransactionModel> {
        const ent = await db.one<TransactionEntity>(TransactionsRepo.getTransactionSQL({}), {
            trxId,
            userId,
        });
        return TransactionsRepo.toModel(ent);
    }

    async save(dto: SaveTrxDto): Promise<TransactionModel> {
        return this.db.tx<TransactionModel>(async (t) => {
            let recurringTrxId: number | null = null;
            if (dto.recurringPeriod) {
                const row = await t.one<EntityWithId>(TransactionsRepo.insertRecurringTransactionSQL, {
                    type: dto.type,
                    name: dto.name,
                    description: dto.description,
                    amount: dto.amount,
                    userId: dto.userId,
                    categoryId: dto.categoryId,
                    addedAt: dto.addedAt,
                    period: TransactionsRepo.sqlPeriod[dto.recurringPeriod],
                });
                recurringTrxId = row.id;
            }
            const ent = await t.one<EntityWithId>(TransactionsRepo.insertTransactionSQL, {
                type: dto.type,
                name: dto.name,
                description: dto.description,
                amount: dto.amount,
                userId: dto.userId,
                categoryId: dto.categoryId,
                addedAt: dto.addedAt,
                recurringTrxId,
            });
            return this.getOne(t, ent.id, dto.userId);
        });
    }

    private static readonly sortColumns: Record<TransactionSortField, string> = {
        [TransactionSortField.Date]: "added_at",
    };

    private buildWhere(q: TransactionsQuery) {
        const cond: string[] = [];
        const values: Record<string, unknown> = {};
        if (q.name) {
            cond.push("similarity(t.name, $(name)) > 0.1");
            values.name = q.name;
        }
        if (q.description) {
            cond.push("similarity(t.description, $(description)) > 0.1");
            values.description = q.description;
        }
        if (q.type) {
            cond.push("t.type = $(type)");
            values.type = q.type;
        }
        if (q.categoryIds?.length) {
            cond.push("cat.id = ANY($(categoryIds))");
            values.categoryIds = q.categoryIds;
        }
        return { sql: cond.join(" AND "), values };
    }

    async getAllByUserId(
        userId: number,
        query: TransactionsQuery,
    ): Promise<{ data: TransactionModel[]; total: number }> {
        const where = this.buildWhere(query);
        const sortCol = TransactionsRepo.sortColumns[query.sortBy];
        const ents = await this.db.manyOrNone<TransactionWithTotalEntity>(
            TransactionsRepo.getTransactionSQL({
                many: true,
                select: "count(*) over()::int AS total",
                where: where.sql,
                after: `ORDER BY ${sortCol} ${query.dir} OFFSET $(offset) LIMIT $(limit)`,
            }),
            {
                ...where.values,
                userId,
                offset: query.page * query.pageSize,
                limit: query.pageSize,
            },
        );
        return {
            data: ents.map((ent) => TransactionsRepo.toModel(ent)),
            total: ents.at(0)?.total ?? 0,
        };
    }

    async updateDue(recurringTrxId?: number): Promise<void> {
        await this.db.none(TransactionsRepo.updateRecurringTrxSQL(recurringTrxId), { id: recurringTrxId });
    }
}
