import { PostgresInterval } from "@/db/db.types";

export type BudgetEntity = {
    id: number;
    userId: number;
    categoryId: number;
    amount: string;
    period: PostgresInterval;
};
