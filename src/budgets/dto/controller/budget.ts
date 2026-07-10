import { ApiProperty } from "@nestjs/swagger";
import { BudgetModel, BudgetPeriod } from "@/budgets/budgets.model";

export class BudgetRes {
    @ApiProperty()
    id: number;

    @ApiProperty()
    amount: number;

    @ApiProperty({ enum: BudgetPeriod })
    period: BudgetPeriod;

    @ApiProperty({ isArray: true, type: "number" })
    categoryIds: number[];

    constructor(budget: BudgetModel) {
        this.id = budget.id;
        this.amount = budget.amount;
        this.period = budget.period;
        this.categoryIds = [...budget.categoryIds];
    }
}
