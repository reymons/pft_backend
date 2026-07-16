import { PostgresInterval } from "@/db/db.types";

export type BudgetEntity = {
    id: number;
    user_id: number;
    name: string;
    amount: string;
    period: PostgresInterval;
};

export type BudgetWithCategoriesEntity = BudgetEntity & {
    category_ids: number[];
};
