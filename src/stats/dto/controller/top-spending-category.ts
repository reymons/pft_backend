import { CategoryRes } from "@/categories/dto/controller/category";
import { TopSpendingCategoryModel } from "@/stats/stats.model";
import { ApiProperty } from "@nestjs/swagger";

export class TopSpendingCategoryRes {
    @ApiProperty({ type: CategoryRes })
    category: CategoryRes;

    @ApiProperty()
    amount: number;

    constructor(m: TopSpendingCategoryModel) {
        this.category = m.category;
        this.amount = m.amount;
    }
}
