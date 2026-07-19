import { CategoryEntity } from "@/categories/categories.entity";

export type TopSpendingCategoryEntity = CategoryEntity & {
    amount: number;
};
