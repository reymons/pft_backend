import { PostgresInterval } from "@/db/db.types";

export type BudgetEntity = {
    id: number;
    user_id: number;
    amount: string;
    period: PostgresInterval;
};

export type BudgetWithCategoriesEntity = BudgetEntity & {
    category_ids: number[];
};
