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

    @ApiProperty()
    totalSpent: number;

    @ApiProperty({ enum: BudgetPeriod })
    period: BudgetPeriod;

    @ApiProperty()
    startsAt: string;

    @ApiProperty({ isArray: true, type: CategoryRes })
    categories: CategoryRes[];

    constructor(budget: BudgetModel) {
        this.id = budget.id;
        this.name = budget.name;
        this.amount = budget.amount;
        this.totalSpent = budget.totalSpent;
        this.period = budget.period;
        this.startsAt = budget.startsAt;
        this.categories = [...budget.categories];
    }
}
