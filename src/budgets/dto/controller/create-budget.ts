import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { BudgetModel, BudgetPeriod } from "@/budgets/budgets.model";

export class CreateBudgetReq {
    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: BudgetPeriod })
    @IsEnum(BudgetPeriod)
    period: BudgetPeriod;

    @ApiProperty({ isArray: true, type: "number", required: false })
    @IsInt({ each: true })
    @IsOptional()
    categoryIds?: number[];

    @ApiProperty({ isArray: true, type: "string", required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    newCategories?: string[];
}

class BudgetRes {
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

export class CreateBudgetRes {
    constructor(budget: BudgetModel) {
        this.budget = new BudgetRes(budget);
    }

    @ApiProperty()
    budget: BudgetRes;
}
