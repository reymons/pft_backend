import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { BudgetModel, BudgetPeriod } from "@/budgets/budgets.model";
import { BudgetRes } from "./budget";

export class CreateBudgetReq {
    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(1_000_000_000)
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

export class CreateBudgetRes {
    constructor(budget: BudgetModel) {
        this.budget = new BudgetRes(budget);
    }

    @ApiProperty()
    budget: BudgetRes;
}
