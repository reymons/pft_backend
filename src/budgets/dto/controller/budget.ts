import { ApiProperty } from "@nestjs/swagger";
import { BudgetModel, BudgetPeriod } from "@/budgets/budgets.model";
import { CategoryRes } from "@/categories/dto/controller/category";

export class BudgetRes {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    amount: number;

    @ApiProperty({ enum: BudgetPeriod })
    period: BudgetPeriod;

    @ApiProperty({ isArray: true, type: CategoryRes })
    categories: CategoryRes[];

    constructor(budget: BudgetModel) {
        this.id = budget.id;
        this.name = budget.name;
        this.amount = budget.amount;
        this.period = budget.period;
        this.categories = [...budget.categories];
    }
}
