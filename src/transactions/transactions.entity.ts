import { CategoryEntity } from "@/categories/categories.entity";
import { TransactionType } from "./transactions.model";

export type RecurringTrxEntity = {
    id: number;
};

export type TransactionEntity = {
    id: number;
    type: TransactionType;
    name: string;
    description: string | null;
    amount: string;
    category_id: number;
    created_at: string;
};

export type TransactionWithCategoryEntity = TransactionEntity & {
    category: CategoryEntity;
    total: number;
};
