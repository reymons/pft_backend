export enum CategoryType {
    Groceries = "groceries",
    Sports = "sports",
    Food = "food",
    Furniture = "furniture",
}

export class CategoryModel {
    id: number;
    userId: number | null;
    type: CategoryType | null;
    customName: string | null;

    get isDefault() {
        return this.userId === null;
    }
}
