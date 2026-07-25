import { CategoryModel } from "@/categories/categories.model";

export enum TopSpendingCategoryPeriod {
    Weekly = "weekly",
    Monthly = "monthly",
    Yearly = "yearly",
}

export class TopSpendingCategoryModel {
    category: CategoryModel;
    amount: number;
}

export class SpendingCategoryTrendModel {
    category: CategoryModel;
    amount: number;
    date: string;
}
