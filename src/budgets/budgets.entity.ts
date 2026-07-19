import { CategoryEntity } from "@/categories/categories.entity";
import { PostgresInterval } from "@/db/db.types";

export type BudgetEntity = {
    id: number;
    user_id: number;
    name: string;
    amount: string;
    spent: number;
    period: PostgresInterval;
    starts_at: string;
};

export type BudgetWithCategoriesEntity = BudgetEntity & {
    categories: CategoryEntity[];
    total_spent: number;
};
