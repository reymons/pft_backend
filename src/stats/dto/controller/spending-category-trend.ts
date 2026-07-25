import { CategoryRes } from "@/categories/dto/controller/category";
import { SpendingCategoryTrendModel } from "@/stats/stats.model";
import { ApiProperty } from "@nestjs/swagger";

export class SpendingCategoryTrendRes {
    @ApiProperty({ type: CategoryRes })
    category: CategoryRes;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    date: string;

    constructor(m: SpendingCategoryTrendModel) {
        this.category = m.category;
        this.amount = m.amount;
        this.date = m.date;
    }
}
