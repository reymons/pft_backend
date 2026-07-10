import { CategoryType } from "./categories.model";

export type CategoryEntity = {
    id: number;
    user_id: number | null;
    type: CategoryType | null;
    custom_name: string | null;
};
