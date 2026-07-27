import { PostgresInterval } from "@/db/db.types";
import { CategoryEntity } from "@/categories/categories.entity";
import { TransactionType } from "./transactions.model";
import { Currency } from "@/currency/currency.model";

export type RecurringTrxEntity = {
    id: number;
    updated_at: string;
    update_interval: PostgresInterval;
};

export type TransactionEntity = {
    id: number;
    type: TransactionType;
    name: string;
    description: string | null;
    amount: string;
    category_id: number;
    added_at: string;
    created_at: string;
    category: CategoryEntity;
    currency: Currency;
    recurring_trx_id: number | null;
};

export type TransactionWithTotalEntity = TransactionEntity & {
    total: number;
};
